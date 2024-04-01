import {
  Component,
  OnDestroy,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import * as Highcharts from 'highcharts';
import { NbSelectComponent } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../services/data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { mapData } from '../../../../assets/data/mapData';
import { listOfCountryWithCode } from '../../../../assets/data/countryCodeMapping';
import * as _Highcharts from 'highcharts/highmaps';
import { Calendar } from 'primeng/calendar';
import HighchartsData from '@highcharts/map-collection/custom/world.topo.json';
import { SelectItem } from 'primeng/api';

interface MyObject {
  [key: string]: any;
  name?: string;
  lat?: number;
  lon?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  chartConstructor = 'mapChart';
  Highcharts: typeof _Highcharts = _Highcharts;
  chartOptions: Highcharts.Options | null = null;
  public dates: string[] = [];
  public clientNames: string[] = [];
  public selectedUsername: string;
  public screensList = [];
  public tabToggle: boolean = false;
  public activeTab = 'dashboard';
  public header = 'Top Performing Pages';
  apiData: any[] = [];
  date: Date | undefined;
  isLoading: boolean = true;
  userEventDates: { id: string; value: string }[] = [];
  screenData: { [key: string]: { [key: string]: number } } = {};
  alive: boolean = true;
  selectedClient: string = '';
  selectedDate: string = '';
  selectedDateForId: string = '';
  userDropdownData: { id: string; value: string }[] = [];
  defaultSelectedClient: string = '';
  deviceCounts: { deviceType: string; count: number }[] = [];
  mostViewedPages: any[] = [];
  mostClickedActions: any[] = [];
  selectedInterval: string = 'weekly';
  totalDeviceCount: number = 0;
  chartDisabled: boolean = false;
  isDisableViewedPages: boolean = false;
  ismapDisable: boolean = false;
  isInterval: boolean = false;
  isDisableClickedAction: boolean = false;
  showActionsTooltip = false;
  tooltipActions: string[] = [];
  tooltipTop = 0;
  tooltipLeft = 0;
  selectedScreen: any = null;
  isScreenOverview: boolean = true;

  intervalOptions: SelectItem[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  @ViewChild('userSelect') userSelect!: NbSelectComponent;
  @ViewChild('datePicker') datePicker!: Calendar;

  constructor(
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.selectedUsername = 'all';
  }

  ngOnInit(): void {
    this.spinner.show();
    this.selectedInterval = 'weekly';

    this.dataService.getAllClients().subscribe((clients) => {
      this.clientNames = clients;
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        if(this.activeTab=='dashboard')
        {
          this.onDashboardChange(this.clientNames[0]);
        }
        else{
          this.onInsightClientChange(this.defaultSelectedClient);
        }
        
        
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    });
  }

  loadSelectedTabData() {
    if (this.activeTab === 'dashboard') {
      setTimeout(() => {
        this.renderPieChart();
        this.renderBarChart();
        this.getMapComponent(this.defaultSelectedClient);
        this.loadMostUsedBrowsers(this.defaultSelectedClient);
        this.getDeviceData(this.defaultSelectedClient);
      }, 2000);
      if (this.chartDisabled) {
        this.enableChart();
      }
    } else if (
      this.activeTab === 'insights' &&
      this.selectedInterval === 'weekly'
    ) {
      this.onInsightClientChange(this.defaultSelectedClient)
      this.getWeeklyData();
    }
  }

  getDeviceData(selectedClient: string): void {
    this.dataService.getUsersData(selectedClient).subscribe((data) => {
      if (!data || data.length === 0) {
        this.removeChart('pieChartContainer');
        return;
      }
      const deviceCounts: { [key: string]: number } = data.reduce(
        (counts, entry) => {
          const deviceName = entry.DeviceName;
          if (deviceName) counts[deviceName] = (counts[deviceName] || 0) + 1;
          return counts;
        },
        {}
      );

      const deviceData = Object.entries(deviceCounts).map(
        ([deviceName, count]) => ({ name: deviceName, y: count })
      );

      this.totalDeviceCount = Object.values(deviceCounts).reduce(
        (total, count) => total + count,
        0
      );

      const pieChartOptions: Highcharts.Options = {
        credits: { enabled: false },
        chart: { type: 'pie', backgroundColor: 'transparent' },
        title: { text: '' },
        tooltip: { pointFormat: '{series.name}: <b>{point.y}</b>' },
        plotOptions: {
          pie: {
            innerSize: '80%',
            borderWidth: 0,
            depth: 10,
            dataLabels: {
              enabled: true,
              color: '#000000',
              style: { textOutline: 'none' },
            },
          },
        },
        colors: ['#052288', '#ffc107', '#BBC1D2'],
        series: [{ type: 'pie', name: 'Count', data: deviceData }],
      };

      Highcharts.chart('pieChartContainer', pieChartOptions);

      const totalCountElement = document.getElementById('total-count');
      if (totalCountElement)
        totalCountElement.innerText =
          'Total Device Count: ' + this.totalDeviceCount;
    });
  }

  removeChart(containerId: string) {
    const chartContainer = document.getElementById(containerId);
    if (chartContainer) {
      while (chartContainer.firstChild) {
        chartContainer.removeChild(chartContainer.firstChild);
      }
    }
  }

  onInsightClientChange(defaultSelectedClient: any): void {
    console.log(this.activeTab)
    
    
      this.dataService.getUsersByClientName(defaultSelectedClient).subscribe((users) => {
        this.dataService.userDropdownData = users.map((user) => ({
          id: user._id,
          value: user._id,
        }));
        this.selectedUsername = '';
        this.onDashboardClientChange(defaultSelectedClient);

        if(this.defaultSelectedClient!='' && this.selectedInterval=='daily')
        {
          this.selectedInterval='weekly';
          this.fetchMonthlyChartData()
        }
        if (this.selectedClient != '' && this.selectedInterval == 'monthly') {
          this.fetchMonthlyChartData();
        }
  
        if (this.selectedClient !== '' && this.selectedInterval == 'daily') {
          this.datePicker.writeValue(null);
          this.isScreenOverview = true;
          this.selectedInterval = 'weekly';
        }
        this.cdr.detectChanges();
      });
    
    
  }

  onDashboardChange(selectedClient: any): void {
    if (!this.selectedUsername || this.selectedUsername) {
      this.dataService
        .getUsersByClientName(selectedClient)
        .subscribe((users) => {
          this.renderPieChart();
          this.loadMostViewedPages(selectedClient);
          this.loadMostClickedActions(selectedClient);
          this.getDeviceData(selectedClient);
          this.loadMostUsedBrowsers(selectedClient);
          this.getMapComponent(this.defaultSelectedClient);
          this.renderBarChart();
        });
    }
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

  loadMostClickedActions(selectedClient: string): void {
    this.dataService.getMostClickedActions(selectedClient).subscribe((data) => {
      if (data && data.length > 0) {
        this.isDisableClickedAction = false;
        this.mostClickedActions = data;
        this.renderBarChart();
      } else {
        this.isDisableClickedAction = true;
      }
    });
  }

  loadMostViewedPages(selectedClient: string): void {
    this.dataService.getMostVisitedPages(selectedClient).subscribe((data) => {
      this.mostViewedPages = data;

      this.renderPieChart();
    });
  }

  onUserChange(): void {
    if (this.selectedUsername !== '') {
      this.datePicker.writeValue(null);
      if (this.selectedUsername != '' && this.selectedInterval == 'daily') {
        this.selectedInterval = 'weekly';
        this.getWeeklyData();
      }
      if (this.selectedUsername != '' && this.selectedInterval == 'weekly') {
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
        this.enableChart();
        this.isScreenOverview = true;
      }
      if (interval === 'weekly' && this.selectedUsername !== '') {
        this.getWeeklyData();
        this.disableChart();
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
              this.chartDisabled = false;
              this.renderChart(seriesData, dates);
            }
          },
          (error) => {
            this.toastr.error(error.error.error);
            this.disableChart();
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

    this.dataService
      .getMonthlyData(this.selectedUsername)
      .subscribe((monthlyData) => {
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

        this.renderChart(seriesData, dates);
      });
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
            this.disableChart();
            this.toastr.error('No data found for the specified date.');
          } else {
            this.enableChart();
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
          this.disableChart();
          this.toastr.error(
            error.status === 404
              ? 'No data found for the specified date.'
              : 'Error fetching user events'
          );
        }
      );
  }

  disableChart(): void {
    this.chartDisabled = true;
  }

  enableChart(): void {
    this.chartDisabled = false;
    setTimeout(() => {
      this.renderPieChart();
      this.renderBarChart();
      this.getMapComponent(this.selectedClient);
      this.getDeviceData(this.defaultSelectedClient);
    }, 2000);
  }

  onDateChange(selectedDate: Date): void {
    this.selectedDate = this.formatDate(selectedDate);
    this.getChartDataBYUserId(this.selectedDate);

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

  renderPieChart() {
    this.dataService
      .getMostVisitedPages(this.defaultSelectedClient)
      .subscribe((data) => {
        if (data && data.length > 0) {
          const filteredData = data.filter(
            (item) => !isNaN(parseFloat(item.percentage))
          );
          if (filteredData.length > 0) {
            const first5Data = filteredData.slice(0, 5);
            const colors = [
              '#052288',
              '#FFD500',
              '#BBC1D2',
              '#78787A',
              '#1aadce',
            ];

            const options: Highcharts.Options = {
              credits: { enabled: false },
              chart: {
                type: 'pie',
                height: 300,
                backgroundColor: 'transparent',
              },
              title: { text: '' },
              plotOptions: {
                pie: {
                  colors: colors,
                  borderWidth: 0,
                  dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: { textOutline: 'none', color: '#000000' },
                  },
                },
              },
              series: [
                {
                  type: 'pie',
                  data: first5Data.map(({ pageName, percentage }, index) => ({
                    name: pageName,
                    y: parseFloat(percentage),
                    color: colors[index],
                  })),
                },
              ],
              tooltip: {
                pointFormat: '<b>Most Viewed</b>: {point.percentage:.1f}%',
              },
            };

            Highcharts.chart('pie-chart-container', options);
          } else {
            this.isDisableViewedPages = true;
          }
        }
      });
  }

  loadMostUsedBrowsers(selectedClient: string): void {
    this.dataService.getMostUsedBrowsers(selectedClient).subscribe((data) => {
      const options: Highcharts.Options = {
        credits: { enabled: false },
        chart: {
          type: 'column',
          height: 300,
          backgroundColor: 'transparent',
        },
        title: {
          text: 'Most Used Browsers',
          style: { color: '#000000', fontSize: '0.9em' },
        },
        xAxis: {
          categories: data.map(({ browserName }) => browserName),
          labels: { style: { color: '#000000' } },
        },
        yAxis: {
          title: { text: 'Counts', style: { color: '#000000' } },
          labels: { style: { color: '#000000' } },
          gridLineColor: 'transparent',
          gridLineWidth: 0,
        },
        plotOptions: {
          column: { color:'#052288',borderWidth: 0, pointWidth: 12, borderRadius: 5 },
        },
        legend: { itemStyle: { color: '#000000' } },
        series: [
          {
            name: 'Counts',
            type: 'column',
            data: data.map(({ count }) => count),
          },
        ],
        tooltip: { pointFormat: '<b>Counts</b>: {point.y}' },
      };

      Highcharts.chart('most-used-browsers-chart-container', options);
    });
  }

  isSelected(screen: any): boolean {
    return this.selectedScreen === screen;
  }

  setSelected(screen: any) {
    this.selectedScreen = screen;
  }

  resetTooltip() {
    this.showActionsTooltip = false;
    this.tooltipActions = [];
    this.selectedScreen = null;
  }

  renderBarChart() {
    if (this.mostClickedActions.length > 0) {
      const first5Data = this.mostClickedActions.slice(0, 5);
      const colors = ['#052288'];
      const barFillColor = '#052288';

      const options: Highcharts.Options = {
        credits: { enabled: false },
        chart: {
          type: 'bar',
          height: 300,
          backgroundColor: 'transparent',
        },
        title: { text: '' },
        xAxis: {
          categories: first5Data.map(({ ButtonName }) => ButtonName),
          labels: { style: { color: '#000000' } },
        },
        yAxis: {
          title: { text: 'Total counts', style: { color: '#000000' } },
          labels: { style: { color: '#000000' } },
          gridLineColor: 'transparent',
          gridLineWidth: 0,
        },
        plotOptions: {
          bar: { color: barFillColor, borderWidth: 0 },
        },
        legend: { itemStyle: { color: '#000000' } },
        series: [
          {
            type: 'bar',
            name: 'Clicks',
            data: first5Data.map(({ count }) => count),
          },
        ],
        tooltip: { pointFormat: '<b>Clicks</b>: {point.y}' },
      };

      Highcharts.chart('bar-chart-container', options);
    }
  }

  getMapComponent(selectedClient: any) {
    if (!selectedClient) {
      this.ismapDisable = true;
      return;
    }

    this.ismapDisable = false;

    this.dataService
      .getlocationData(selectedClient)
      .subscribe((data: any[]) => {
        if (!data || data.length === 0) {
          this.ismapDisable = true;
          return;
        }

        const mapData = data.map((obj) => {
          const countryCode =
            listOfCountryWithCode[obj.country.toLowerCase().trim()] ||
            'not found';
          return {
            name: obj.country,
            color: '#666b7b',
            'hc-key': countryCode,
          };
        });

        const stringifiedArray = data.map((obj) => ({
          name: obj.cityName,
          lat: Number(obj.latitude),
          lon: Number(obj.longitude),
        }));

        this.chartOptions = {
          credits: { enabled: false },
          chart: {
            type: 'map',
            map: HighchartsData,
            backgroundColor: 'transparent',
          },
          title: { text: '', style: { color: '#000000' } },
          mapNavigation: {
            enabled: true,
            buttonOptions: { alignTo: 'spacingBox' },
          },
          legend: { enabled: true },
          colorAxis: {
            visible: false,
            minColor: '#BBC1D2',
            maxColor: '#BBC1D2',
          },
          tooltip: {
            formatter: function () {
              return this.point.name;
            },
          },
          series: [
            { type: 'map', allAreas: true, data: mapData },
            {
              type: 'mappoint',
              marker: {
                symbol:
                  'url(https://github.com/Cynnent/web-analytics/blob/main/src/assets/images/location.png?raw=true)',
                width: 18,
                height: 22,
              },
              data: stringifiedArray,
            },
          ],
        };
      });
  }

  changeActiveTab(clickedTab: string) {
    this.selectedInterval = 'weekly';
    this.activeTab = clickedTab;
    this.loadSelectedTabData();
  }

  ngAfterViewInit() {
    this.selectedUsername = 'all';
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
