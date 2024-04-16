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
import { SelectedClientService } from '../../shared/shared.service';

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
  public clientNames = [];
  public selectedUsername: string='';
  public activeTab = 'dashboard';
  public header = 'Dashboard';
  apiData: any[] = [];
  weeklyData: any = [];
  date: Date | undefined;
  isLoading: boolean = true;
  noDataFound: boolean = false;
  userEventDates: { id: string; value: string }[] = [];
  screenData: { [key: string]: { [key: string]: number } } = {};
  alive: boolean = true;
  selectedClient: string = '';
  selectedDate: any;
  selectedDateForId: string = '';
  userDropdownData: { id: string; value: string }[] = [];
  defaultSelectedClient: string = '';
  deviceCounts: { deviceType: string; count: number }[] = [];
  mostViewedPages: any[] = [];
  mostClickedActions: any[] = [];
  selectedInterval: string = 'weekly';
  totalDeviceCount: number = 0;
  isChartDataAvailable: boolean = false;
  isDisableViewedPages: boolean = false;
  ismapDisable: boolean = false;
  isInterval: boolean = false;
  isDisableClickedAction: boolean = false;
  progressBars: any[] = [];
  selectedScreen: any = null;
  isScreenOverview: boolean = true;
  maxValue: number = 0;

  userData: any = [];

  intervalOptions: SelectItem[] = [
    // { label: 'Daily', value: 'daily' },
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
    private spinner: NgxSpinnerService,
    private selectedClientService: SelectedClientService
  ) {
   
  }

  ngOnInit(): void {
    this.spinner.show();
    this.selectedInterval = 'weekly';

    this.dataService.getAllClients().subscribe((clients: any) => {
      this.clientNames = clients;
      this.clientNames.splice(-2);
      // if(clients)
      //   {
      //     this.clientNames = clients.find((c:any)=>{
      //       return c.clientName == 'Appland' || c.clientName == 'web_analytics_gp'
      //     })
      //     // this.clientNames=[]
      //   }

      // for(let c of clients)
      //   {
      //     if(c["clientName"] == 'Appland' || c["clientName"] == 'web_analytics_gp')
      //       {
      //         this.clientNames.push(c)
      //       }
      //   }
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        if (this.activeTab == 'dashboard') {
          this.onDashboardChange(this.clientNames[0]);
          this.mostViwedCountry(this.defaultSelectedClient);
        } else {
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
        this.mostViwedCountry(this.defaultSelectedClient);
        this.loadMostUsedBrowsers(this.defaultSelectedClient);
        this.getDeviceData(this.defaultSelectedClient);
      }, 2000);
     
    }
    else if (this.activeTab === 'insights' && this.selectedInterval === 'weekly') {
      this.onInsightClientChange(this.defaultSelectedClient);
      // this.getWeeklyData();
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

        if (
          this.defaultSelectedClient != '' &&
          this.selectedInterval == 'daily'
        ) {
          this.selectedInterval = 'weekly';
          this.fetchMonthlyChartData();
        }
        if (this.selectedClient != '' && this.selectedInterval == 'monthly') {
          this.fetchMonthlyChartData();
        }

        if (this.selectedClient !== '' && this.selectedInterval == 'daily') {
          this.datePicker.writeValue(null);
          this.isScreenOverview = true;
          this.selectedInterval = 'weekly';
        }
      });

    if (
      this.selectedClient != '' &&
      this.selectedUsername != '' &&
      this.selectedDate == ''
    ) {
      this.getWeeklyData();
    }
  }

  onDashboardChange(selectedClient: any): void {
    console.log('Selected client:', selectedClient); // Debug output
    this.defaultSelectedClient = selectedClient; // Update defaultSelectedClient
    this.selectedClientService.setSelectedClient(selectedClient);
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
          this.mostViwedCountry(this.defaultSelectedClient);
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
      // this.datePicker.writeValue(null);
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
        // this.enableChart();
        this.isScreenOverview = true;
      }
      if (interval === 'weekly' && this.selectedUsername !== '') {
        this.getWeeklyData();
        // this.disableChart();
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
    //   this.isChartDataAvailable = true;
    // this.noDataFound = false;
    // if(this.isChartDataAvailable==false)
    //   {
    //     this.disableChart()
    //     this.noDataFound=true;
    //   }
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

              this.isChartDataAvailable = true;
              this.renderChart(seriesData, dates);
              this.noDataFound = false;
            }
          },
          (error) => {
            // this.disableChart();
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

        // this.disableChart();
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
            // this.disableChart();
            this.toastr.error('No data found for the specified date.');
          } else {
            // this.enableChart();
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
          // this.disableChart();
          this.toastr.error(
            error.status === 404
              ? 'No data found for the specified date.'
              : 'Error fetching user events'
          );
        }
      );
  }

  // disableChart(): void {

  //   // this.enableChart()
  //   this.isChartDataAvailable = true;
  // }

  // enableChart(): void {

  //   if(this.isChartDataAvailable!=false && this.noDataFound==false)
  //     {
  //       this.isChartDataAvailable=false;
  //       this.noDataFound=true;

  //     }
  //     if(this.isChartDataAvailable=true)
  //       {
  //         this.isChartDataAvailable=false;
  //         this.noDataFound=true;
  //       }

  //     // else{
  //     //   this.isChartDataAvailable = false;
  //     // }

  // }

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

  mostViwedCountry(selectedClient: any): void {
    this.dataService
      .getAccesedCountryCount(selectedClient)
      .subscribe((data: any[]) => {
        const maxValue = Math.max(...data.map((item) => item.value));
        const result = maxValue * 2;
        console.log(result);
        this.maxValue = result;
        this.progressBars = data;
      });
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
          text: '',
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
          column: {
            color: '#052288',
            borderWidth: 0,
            pointWidth: 12,
            borderRadius: 5,
          },
        },
        legend: { itemStyle: { color: '#000000' } },
        series: [
          {
            name: 'Browsers',
            type: 'column',
            data: data.map(({ count }) => count),
          },
        ],
        tooltip: { pointFormat: '<b>Counts</b>: {point.y}' },
      };

      Highcharts.chart('most-used-browsers-chart-container', options);
    });
  }

  // functions for widget tables

  onMostViewedPagesClick() {
    this.dataService.setLink('mostViewedPages');
    // this.dataService.getTableData(this.defaultSelectedClient).subscribe((res:any) => {
    //   console.log(res)
    //   this.data = res;
    //   // this.loading = false;
    // });
  }

  onMostClickedActionsClick() {
    this.dataService.setLink('mostClickedActions');
  }

  onActiveUserByDeviceClick() {
    this.dataService.setLink('mostUsedDevices');
  }

  onMostUsedCountriesClick() {
    this.dataService.setLink('usersByCountry');
  }

  onMostUsedBrowserClick() {
    this.dataService.setLink('mostUsedBrowsers');
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
