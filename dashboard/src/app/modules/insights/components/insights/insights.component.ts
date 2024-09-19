import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

import * as Highcharts from 'highcharts';
import * as _Highcharts from 'highcharts/highmaps';
import { Calendar } from 'primeng/calendar';
import { SelectItem } from 'primeng/api';
import { NbSelectComponent } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';

import { DataService } from '../../../shared/services/dashboard.service';
import {
  UserSelectItem,
  WeeklyData,
} from '../../../shared/interfaces/interfaces';
import {
  DAILY_INTERVAL,
  DASHBOARD_TAB,
  DASHBOAR_HEADER,
  INSIGHT,
  MONTHLY_INTERVAL,
  MOST_CLICKED_ACTION,
  TOAST_ERROR,
  WEEKLY_INTERVAL,
} from '../../../shared/constants/const';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css',
})
export class InsightsComponent {
  Highcharts: typeof _Highcharts = _Highcharts;

  dates: string[] = [];
  clientNames: string[] = [];
  userData: any = [];
  weeklyData: WeeklyData[] = [];
  userEventDates: UserSelectItem[] = [];
  userDropdownData: UserSelectItem[] = [];

  selectedUsername: string = '';
  selectedClient: string = '';
  selectedDateForId: string = '';
  defaultSelectedClient: string = '';
  selectedInterval: string = WEEKLY_INTERVAL;
  activeTab: string = DASHBOARD_TAB;
  header: string = DASHBOAR_HEADER;

  date: Date | undefined;

  noDataFound: boolean = false;
  isLoading: boolean = true;
  alive: boolean = true;
  isChartDataAvailable: boolean = false;
  isInterval: boolean = false;
  isScreenOverview: boolean = true;

  selectedDate: any;
  data: any;
  selectedScreen: any;

  subscriptions: Subscription[] = [];

  intervalOptions: SelectItem[] = [
    { label: 'Weekly', value: WEEKLY_INTERVAL },
    { label: 'Monthly', value: MONTHLY_INTERVAL },
  ];

  @ViewChild('userSelect') userSelect!: NbSelectComponent;
  @ViewChild('datePicker') datePicker!: Calendar;

  constructor(
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    //this.spinner.show();
    this.selectedInterval = WEEKLY_INTERVAL;
    this.dataService.emitActiveTab(true);
    this.selectedInterval = WEEKLY_INTERVAL;
    //this.activeTab = clickedTab;
    //this.loadSelectedTabData();

    this.dataService.onInsightsClientNames((data) => {
      console.log(' this.clientNames', this.clientNames);
      this.clientNames = data;
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        this.insightClientChange(this.defaultSelectedClient);
      }
    });
  }

  // load the insight tab
  loadSelectedTabData() {
    this.insightClientChange(this.defaultSelectedClient);
  }

  // load the chart based on the selected client
  insightClientChange(defaultSelectedClient: any): void {
    this.dataService.emitInsightsSelectedClient(defaultSelectedClient);
    this.userData = [];

    this.dataService.onInsightUserEvents((data) => {
      this.userData = data;
    });

    this.dataService.onInsightsUserId((users) => {
      this.userDropdownData = users.map((user: any, index: any) => ({
        id: user._id,
        value: `User ${index + 1}`,
      }));
      this.selectedUsername = this.userDropdownData?.[0].id;
      this.insightRenderChart(defaultSelectedClient);

      const isDailyInterval = this.selectedInterval === DAILY_INTERVAL;
      const isMonthlyInterval = this.selectedInterval === MONTHLY_INTERVAL;

      if (this.defaultSelectedClient && isDailyInterval) {
        this.selectedInterval = WEEKLY_INTERVAL;
        this.fetchMonthlyChartData();
        this.datePicker.writeValue(null);
        this.isScreenOverview = true;
      } else if (this.selectedClient && isMonthlyInterval) {
        this.fetchMonthlyChartData();
      } else if (this.selectedClient && isDailyInterval) {
        this.selectedInterval = WEEKLY_INTERVAL;
        this.datePicker.writeValue(null);
        this.isScreenOverview = true;
      }

      if (this.selectedClient && this.selectedUsername && !this.selectedDate) {
        this.getWeeklyData();
      }
    });
  }

  // render the weekly and monthly chart based on the condition
  insightRenderChart(selectedClient: string): void {
    if (
      selectedClient &&
      this.selectedUsername &&
      this.selectedInterval === WEEKLY_INTERVAL
    ) {
      this.getWeeklyData();
    }

    if (!this.selectedUsername || this.selectedUsername) {
      this.dataService.onInsightsUserId((users) => {
        this.dataService.userDropdownData = users.map((user: any) => ({
          id: user._id,
          value: user._id,
        }));
        this.selectedUsername = this.dataService.userDropdownData[0]?.id;

        if (
          selectedClient &&
          this.selectedInterval === WEEKLY_INTERVAL &&
          this.selectedUsername
        ) {
          this.getWeeklyData();
        } else {
          this.fetchMonthlyChartData();
        }
      });
    }
  }

  //load the chart based on the user selection
  userChange(): void {
    if (this.selectedUsername !== '') {
      if (this.selectedInterval == DAILY_INTERVAL) {
        this.getWeeklyData();
      }
      if (this.selectedInterval == WEEKLY_INTERVAL) {
        this.getWeeklyData();
        this.isScreenOverview = true;
      }
      if (this.selectedInterval == MONTHLY_INTERVAL) {
        this.fetchMonthlyChartData();
      }
    }
  }

  // load the chart based on the interval selection
  intervalChange(selectedInterval: string) {
    const interval = selectedInterval;
    if (this.isInterval) return;
    if (interval === MONTHLY_INTERVAL && this.selectedUsername) {
      this.fetchMonthlyChartData();
      this.isScreenOverview = true;
      this.datePicker.writeValue(null);
    } else if (interval === WEEKLY_INTERVAL && this.selectedUsername) {
      this.getWeeklyData();
      this.isScreenOverview = true;
      this.datePicker.writeValue(null);
    } else if (this.selectedInterval === WEEKLY_INTERVAL) {
      this.isScreenOverview = true;
      this.datePicker.writeValue(null);
    } else if (this.selectedInterval === DAILY_INTERVAL) {
      this.isScreenOverview = false;
    }
  }

  // method to get the week data for the selected user
  getWeeklyData() {
    if (!this.selectedUsername) {
      return;
    }

    this.dataService.emitSelectedUsername(this.selectedUsername);

    // Handle the success case
    this.dataService.onInsightWeeklyData((weeklyData) => {
      if (weeklyData && weeklyData.length > 0) {
        const currentDate = new Date();
        const currentWeekStart =
          currentDate.getDate() - currentDate.getDay() + 1;
        const currentWeekEnd = currentWeekStart + 6;

        const currentWeekData = this.getCurrentWeekTotalData(
          currentWeekStart,
          currentWeekEnd
        );

        weeklyData.forEach((entry: any) => {
          const entryDate = new Date(entry.date);
          const dayIndex = entryDate.getDay();

          if (dayIndex >= 0 && dayIndex < 7) {
            currentWeekData[dayIndex].totalCount = entry.totalCount;
          }
        });

        const dates = this.fetchDatesMD(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentWeekStart
          ),
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentWeekEnd
          )
        );

        const seriesData = [
          {
            name: this.selectedUsername,
            type: 'line',
            data: currentWeekData.map((entry) => entry.totalCount),
          },
        ];

        this.isChartDataAvailable = true;
        this.renderChart(seriesData, dates);
        this.noDataFound = false;
      }
    });

    this.dataService.onInsightWeeklyDataError(() => {
      this.isChartDataAvailable = false;
      this.noDataFound = true;
    });
  }

  // method to get the week date
  getCurrentWeekTotalData(start: any, end: any) {
    const currentWeekData = [];
    for (let i = start; i <= end; i++) {
      currentWeekData.push({
        totalCount: 0,
      });
    }
    return currentWeekData;
  }

  // function to get the monthly data fro the selected user
  fetchMonthlyChartData() {
    if (!this.selectedUsername) {
      return;
    }
    this.dataService.emitInsightSelectedClientMonthly(this.selectedUsername);
    this.dataService.onInsightMonthlyData((data) => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonthData = data.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() + 1 === currentMonth &&
          entryDate.getFullYear() === currentYear
        );
      });

      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      const dates = this.fetchDatesMD(startDate, endDate);

      const totalCounts = dates.map((date) => {
        const matchingEntry = currentMonthData.find(
          (entry: any) => entry.date === date
        );
        return matchingEntry ? matchingEntry.totalCount : 0;
      });

      const seriesData = [
        {
          name: this.selectedUsername,
          type: 'line',
          data: totalCounts,
        },
      ];

      this.isChartDataAvailable = true;
      this.renderChart(seriesData, dates);
    });

    this.dataService.onInsightMonthlyDataError(() => {
      this.isChartDataAvailable = false;
    });
  }

  fetchDatesMD(startDate: any, endDate: any) {
    const datesArray = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      datesArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
  }

  // load user events based on the selected date
  getChartDataBYUserId(selectedDateForId: string): void {
    if (!this.selectedUsername || !selectedDateForId) {
      console.log('error');
    }

    this.dataService.emitInsightsUserEvents(
      this.selectedUsername,
      selectedDateForId
    );

    this.dataService.onInsightUserEvents((userData) => {
      if (!userData) {
        this.toastr.error('Invalid response from API');
        return;
      }

      if (userData.totalCount === 0) {
        this.toastr.error(TOAST_ERROR);
      } else {
        this.userData = userData;
        const seriesData = [
          { name: 'Total Count', data: [userData.totalCount] },
        ];
        this.renderChart(seriesData, [selectedDateForId]);
      }
    });

    this.dataService.onInsightUserEventsError(() => {
      this.isScreenOverview = true;
    });
  }

  dateChange(selectedDate: Date): void {
    this.selectedDate = selectedDate;
    let selectedUserDate = this.formatDate(selectedDate);
    this.getChartDataBYUserId(selectedUserDate);

    if (this.selectedUsername !== '' && this.selectedDate !== '') {
      this.loadDatesForUser(this.selectedUsername);
      if (this.selectedDate != '') {
        this.selectedInterval = DAILY_INTERVAL;
        this.isScreenOverview = false;
      }
    }
  }

  loadDatesForUser(userId: string): void {
    const datesSubscription = this.dataService
      .getDatesByUserId(userId)
      .subscribe((dates) => {
        this.userEventDates = dates;
        this.cdr.detectChanges();
      });
    this.subscriptions.push(datesSubscription);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  renderChart(seriesData: any[], dates: string[]) {
    const options = {
      credits: { enabled: false },
      chart: { type: 'line', backgroundColor: 'transparent' },

      title: {
        text: '',

        style: { color: '#fff', fontSize: '14px', fontWeight: 'bold' },
      },
      xAxis: { categories: dates, labels: { style: { color: '#000000' } } },
      yAxis: {
        title: {
          text: MOST_CLICKED_ACTION,
          style: {
            color: '#000000',
          },
        },
        labels: { format: '{text}' },
        gridLineColor: 'transparent',
        gridLineWidth: 0,
      },
      // legend: {
      //   itemStyle: {
      //     color: '#000000',
      //   },
      // },
      legend: { enabled: false },
      series: seriesData,
    };

    Highcharts.chart('container', options);
  }

  // changeActiveTab(clickedTab: string) {
  //   this.dataService.emitActiveTab(true);
  //   this.selectedInterval = WEEKLY_INTERVAL;
  //   this.activeTab = clickedTab;
  //   this.loadSelectedTabData();
  // }

  getObjectEntries(obj: any): any[] {
    return obj ? Object.entries(obj) : [];
  }

  selectScreen(screen: any) {
    this.selectedScreen = screen;
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }
}
