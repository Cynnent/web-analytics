import {
  Component,
  OnDestroy,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,

} from '@angular/core';
import * as Highcharts from 'highcharts';
import { NbSelectComponent } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../services/data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _Highcharts from 'highcharts/highmaps';
import { Calendar } from 'primeng/calendar';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  Highcharts: typeof _Highcharts = _Highcharts;
  dates: string[] = [];
  clientNames = [];
  selectedUsername: string = '';
  activeTab = 'dashboard';
  weeklyData: any = [];
  header = 'Dashboard';
  date: Date | undefined;
  noDataFound: boolean = false;
  isLoading: boolean = true;
  userEventDates: { id: string; value: string }[] = [];
  alive: boolean = true;
  selectedClient: string = '';
  selectedDate: any;
  selectedDateForId: string = '';
  userDropdownData: { id: string; value: string }[] = [];
  defaultSelectedClient: string = '';
  selectedInterval: string = 'weekly';
  isChartDataAvailable: boolean = false;
  isInterval: boolean = false;
  isScreenOverview: boolean = true;
  userData: any = [];

  intervalOptions: SelectItem[] = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  @ViewChild('userSelect') userSelect!: NbSelectComponent;
  @ViewChild('datePicker') datePicker!: Calendar;
  data: any;

  constructor(
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.selectedInterval = 'weekly';

    this.dataService.getAllClients().subscribe((clients: any) => {
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
  }

  loadSelectedTabData() {
    if (this.activeTab === 'insights' && this.selectedInterval === 'weekly') {
      this.onInsightClientChange(this.defaultSelectedClient);
    }
  }

  onInsightClientChange(defaultSelectedClient: any): void {
    this.userData = [];
  
    this.dataService
      .getUsersByClientName(defaultSelectedClient)
      .subscribe((users) => {
        this.userDropdownData = users.map((user, index) => ({
          id: user._id,
          value: `User ${index + 1}`,
        }));
        this.selectedUsername = '';
        this.onDashboardClientChange(defaultSelectedClient);
  
        const isDailyInterval = this.selectedInterval === 'daily';
        const isMonthlyInterval = this.selectedInterval === 'monthly';
  
        if (this.defaultSelectedClient && isDailyInterval) {
          this.selectedInterval = 'weekly';
          this.fetchMonthlyChartData();
          this.datePicker.writeValue(null);
          this.isScreenOverview = true;
        } else if (this.selectedClient && isMonthlyInterval) {
          this.fetchMonthlyChartData();
        } else if (this.selectedClient && isDailyInterval) {
          this.selectedInterval = 'weekly';
          this.datePicker.writeValue(null);
          this.isScreenOverview = true;
        }
  
        if (this.selectedClient && this.selectedUsername && !this.selectedDate) {
          this.getWeeklyData();
        }
      });
  }
  

  onDashboardClientChange(selectedClient: any): void {
    if (
      selectedClient &&
      this.selectedUsername &&
      this.selectedInterval === 'weekly'
    ) {
      this.getWeeklyData();
    }

    if (!this.selectedUsername || this.selectedUsername) {
      this.dataService
        .getUsersByClientName(selectedClient)
        .subscribe((users) => {
          this.dataService.userDropdownData = users.map((user) => ({
            id: user._id,
            value: user._id,
          }));
          this.selectedUsername = this.dataService.userDropdownData[0]?.id;

          if (
            selectedClient &&
            this.selectedInterval === 'weekly' &&
            this.selectedUsername
          ) {
            this.getWeeklyData();
          } else {
            this.fetchMonthlyChartData();
          }
        });
    }
  }

  onUserChange(): void {
    if (this.selectedUsername !== '') {
      if (this.selectedInterval == 'daily') {
        this.getWeeklyData();
      }
      if (this.selectedInterval == 'weekly') {
        this.getWeeklyData();
        this.isScreenOverview = true;
      }
      if (this.selectedInterval == 'monthly') {
        this.fetchMonthlyChartData();
      }
    }
  }

  onIntervalChange(selectedInterval: string) {
    const interval = selectedInterval;
    if (!(this.isInterval === true)) {
      if (interval === 'monthly' && this.selectedUsername !== '') {
        this.fetchMonthlyChartData();
        this.isScreenOverview = true;
      }
      if (interval === 'weekly' && this.selectedUsername !== '') {
        this.getWeeklyData();
      }
      if (this.selectedInterval == 'weekly') {
        this.datePicker.writeValue(null);
        this.isScreenOverview = true;
      }
      if (this.selectedInterval == 'daily') {
        this.isScreenOverview = false;
      }
    } 
  }

  getWeeklyData() {
    if (!this.selectedUsername) {
      return;
    } else {
      if (this.selectedUsername == '' || this.selectedUsername != '') {
        this.dataService.getWeeklyDataForUser(this.selectedUsername).subscribe(
          (weeklyData) => {
            if (weeklyData && weeklyData.length > 0) {
              const currentDate = new Date();
              const currentWeekStart = currentDate.getDate() - currentDate.getDay() + 1;
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
      }
    }
  }

  getCurrentWeekTotalData(start: any, end: any) {
    const currentWeekData = [];
    for (let i = start; i <= end; i++) {
      currentWeekData.push({
        totalCount: 0,
      });
    }
    return currentWeekData;
  }

  fetchMonthlyChartData() {
    if (!this.selectedUsername) {
      return;
    }

    this.dataService.getMonthlyData(this.selectedUsername).subscribe(
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

  getChartDataBYUserId(selectedDateForId: any): void {
    if (!this.selectedUsername || !selectedDateForId) {
      return;
    }

    this.dataService
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
          } else {
            console.error('Error fetching user events', error);
          }
          this.toastr.error(
            error.status === 404
              ? 'No data found for the specified date.'
              : 'Error fetching user events'
          );
        }
      );
  }

  onDateChange(selectedDate: Date): void {
    this.selectedDate = selectedDate;
    let selectedUserDate = this.formatDate(selectedDate);
    this.getChartDataBYUserId(selectedUserDate);

    if (this.selectedUsername !== '' && this.selectedDate !== '') {
      this.loadDatesForUser(this.selectedUsername);
      if (this.selectedDate != '') {
        this.selectedInterval = 'daily';
        this.isScreenOverview = false;
      }
    }
  }
  loadDatesForUser(userId: string): void {
    this.dataService.getDatesByUserId(userId).subscribe((dates) => {
      this.userEventDates = dates;
      this.cdr.detectChanges();
    });
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
    this.selectedInterval = 'weekly';
    this.activeTab = clickedTab;
    this.loadSelectedTabData();
  }
  getObjectEntries(obj: any): any[] {
    return obj ? Object.entries(obj) : [];
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
