import {
  Component,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

import * as Highcharts from 'highcharts';
import * as _Highcharts from 'highcharts/highmaps';
import { Calendar } from 'primeng/calendar';
import { SelectItem } from 'primeng/api';
import { NbSelectComponent } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';

import { DataService } from '../../../../shared/services/data.service';
import { UserSelectItem, WeeklyData } from '../../../../shared/interfaces/interfaces';
import { DAILY_INTERVAL, MONTHLY_INTERVAL, WEEKLY_INTERVAL } from '../../../../shared/lang/lang';

import { Subscription } from 'rxjs';


@Component({
  selector: 'app-insight',
  templateUrl: './dashboard-insight.component.html',
  styleUrl: './dashboard-insight.component.css'
})
export class InsightComponent {
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
  activeTab: string = 'dashboard';
  header: string = 'Dashboard';

  date: Date | undefined;

  noDataFound: boolean = false;
  isLoading: boolean = true;
  alive: boolean = true;
  isChartDataAvailable: boolean = false;
  isInterval: boolean = false;
  isScreenOverview: boolean = true;

  selectedDate: any;
  data: any;

  subscriptions: Subscription[] = [];

  intervalOptions: SelectItem[] = [
    { label: 'Weekly', value: WEEKLY_INTERVAL },
    { label: 'Monthly', value:  MONTHLY_INTERVAL },
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
    this.spinner.show();
    this.selectedInterval = WEEKLY_INTERVAL;

    const clientSubscription=this.dataService.getAllClients().subscribe((clients: any) => {
      this.clientNames = clients;
      this.clientNames.splice(-2);
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        if (this.activeTab == 'insights') {
          this.onInsightClientChange(this.defaultSelectedClient);

        }
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    });

    this.subscriptions.push(clientSubscription);
  }

  // load the insight tab 
  loadSelectedTabData() {
    if (this.activeTab === 'insights' && this.selectedInterval === WEEKLY_INTERVAL) {
      this.onInsightClientChange(this.defaultSelectedClient);
    }
  }

  // load the chart based on the selected client
  onInsightClientChange(defaultSelectedClient: any): void {
    this.userData = [];
    this.unsubscribeAll();

    const userSubscription= this.dataService
      .getUsersByClientName(defaultSelectedClient)
      .subscribe((users) => {
        this.userDropdownData = users.map((user, index) => ({
          id: user._id,
          value: `User ${index + 1}`,
        }));
        this.selectedUsername = '';
        this.onInsightRenderChart(defaultSelectedClient);

        const isDailyInterval = this.selectedInterval === DAILY_INTERVAL;
        const isMonthlyInterval = this.selectedInterval ===  MONTHLY_INTERVAL;

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

        if (
          this.selectedClient &&
          this.selectedUsername &&
          !this.selectedDate
        ) {
          this.getWeeklyData();
        }
      });
      this.subscriptions.push(userSubscription); 
  }

  // render the weekly and monthly chart based on the condition
  onInsightRenderChart(selectedClient: string): void {
    if (
      selectedClient &&
      this.selectedUsername &&
      this.selectedInterval === WEEKLY_INTERVAL
    ) {
      this.getWeeklyData();
    }

    if (!this.selectedUsername || this.selectedUsername) {
      const userDataSubscription= this.dataService
        .getUsersByClientName(selectedClient)
        .subscribe((users) => {
          this.dataService.userDropdownData = users.map((user) => ({
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
        this.subscriptions.push(userDataSubscription);
    }
  }

  //load the chart based on the user selection
  onUserChange(): void {
    if (this.selectedUsername !== '') {
      if (this.selectedInterval == DAILY_INTERVAL) {
        this.getWeeklyData();
      }
      if (this.selectedInterval == WEEKLY_INTERVAL) {
        this.getWeeklyData();
        this.isScreenOverview = true;
      }
      if (this.selectedInterval ==  MONTHLY_INTERVAL) {
        this.fetchMonthlyChartData();
      }
    }
  }

  // load the chart based on the interval selection
  onIntervalChange(selectedInterval: string) {
    const interval = selectedInterval;
    if (this.isInterval) return;
    if (interval ===  MONTHLY_INTERVAL && this.selectedUsername) {
      this.fetchMonthlyChartData();
      this.isScreenOverview = true;
    } else if (interval === WEEKLY_INTERVAL && this.selectedUsername) {
      this.getWeeklyData();
    } else if (this.selectedInterval === WEEKLY_INTERVAL) {
      this.datePicker.writeValue(null);
      this.isScreenOverview = true;
    } else if (this.selectedInterval === DAILY_INTERVAL) {
      this.isScreenOverview = false;
    }
  }

  // method to get the week data for the selected user
  getWeeklyData() {
    if (!this.selectedUsername) {
      return;
    } else {
      if (this.selectedUsername == '' || this.selectedUsername != '') {
        const weeklyDataSubscription=this.dataService.getWeeklyDataForUser(this.selectedUsername).subscribe(
          (weeklyData) => {
            if (weeklyData && weeklyData.length > 0) {
              const currentDate = new Date();
              const currentWeekStart =
                currentDate.getDate() - currentDate.getDay() + 1;
              const currentWeekEnd = currentWeekStart + 6;

              const currentWeekData = this.getCurrentWeekTotalData(
                currentWeekStart,
                currentWeekEnd
              );

              weeklyData.forEach((entry) => {
                const entryDate = new Date(entry.date);
                const dayIndex = entryDate.getDay();

                if (dayIndex >= 0 && dayIndex < 7) {
                  currentWeekData[dayIndex].totalCount = entry.totalCount;
                }
              });

              const dates = this.getDatesArrayForMonthlyAndDaily(
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
          },
          (error) => {
            this.toastr.error(error.error.error);

            this.isChartDataAvailable = false;
            this.noDataFound = true;
          }
        );
        this.subscriptions.push(weeklyDataSubscription);
      }
    }
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

    const monthlyDataSubscription=this.dataService.getMonthlyData(this.selectedUsername).subscribe(
      (monthlyData) => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const currentMonthData = monthlyData.filter((entry) => {
          const entryDate = new Date(entry.date);
          return (
            entryDate.getMonth() + 1 === currentMonth &&
            entryDate.getFullYear() === currentYear
          );
        });

        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);
        const dates = this.getDatesArrayForMonthlyAndDaily(startDate, endDate);

        const totalCounts = dates.map((date) => {
          const matchingEntry = currentMonthData.find(
            (entry) => entry.date === date
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
      },
      (error) => {
        this.isChartDataAvailable = false;
        this.toastr.error(error.error.error);
      }
    );
    this.subscriptions.push(monthlyDataSubscription);
  }

  getDatesArrayForMonthlyAndDaily(startDate: any, endDate: any) {
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
      return;
    }

    const userEventsSubscription=this.dataService
      .getUserEvents(this.selectedUsername, selectedDateForId)
      .subscribe(
        (userData) => {
          if (!userData) {
            this.toastr.error('Invalid response from API');
            return;
          }

          if (userData.totalCount === 0) {
            this.toastr.error('No data found for the specified date.');
          } else {
            this.userData = userData;
            const seriesData = [
              { name: 'Total Count', data: [userData.totalCount] },
            ];
            this.renderChart(seriesData, [selectedDateForId]);
          }
        },
        (error) => {
          if (error.status === 404) {
          }
          this.toastr.error(
            error.status === 404
              ? 'No data found for the specified date.'
              : 'Error fetching user events'
          );
        }
      );
      this.subscriptions.push(userEventsSubscription);
  }

  onDateChange(selectedDate: Date): void {
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
    const datesSubscription=this.dataService.getDatesByUserId(userId).subscribe((dates) => {
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
        text: 'Insight',

        style: { color: '#fff', fontSize: '14px', fontWeight: 'bold' },
      },
      xAxis: { categories: dates, labels: { style: { color: '#000000' } } },
      yAxis: {
        title: {
          text: 'Most Clicked Actions',
          style: {
            color: '#000000',
          },
        },
        labels: { format: '{text}' },
        gridLineColor: 'transparent',
        gridLineWidth: 0,
      },
      legend: {
        itemStyle: {
          color: '#000000',
        },
      },
      series: seriesData,
    };

    Highcharts.chart('container', options);
  }

  changeActiveTab(clickedTab: string) {
    this.selectedInterval = WEEKLY_INTERVAL;
    this.activeTab = clickedTab;
    this.loadSelectedTabData();
  }
  getObjectEntries(obj: any): any[] {
    return obj ? Object.entries(obj) : [];
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

}
