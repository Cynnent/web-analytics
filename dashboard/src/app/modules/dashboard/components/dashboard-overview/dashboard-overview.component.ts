import {
  Component,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import * as Highcharts from 'highcharts';
import * as _Highcharts from 'highcharts/highmaps';
import HighchartsData from '@highcharts/map-collection/custom/world.topo.json';
import { NgxSpinnerService } from 'ngx-spinner';

import { DataService } from '../../../shared/services/dashboard.service';
import { listOfCountryWithCode } from '../../../../../assets/data/countryCodeMapping';
import {
  DeviceCount,
  MostClickedAction,
  MostViewedPage,
  ProgressBar,
} from '../../../shared/interfaces/interfaces';
import {
  DASHBOARD_TAB,
  MOST_CLICKED_ACTIONS_LINK,
  MOST_USED_BROWSER_LINK,
  MOST_USED_DEVICES_LINK,
  MOST_VIEWED_PAGES_LINK,
  USER_BY_COUNTRY_LINK,
  WEEKLY_INTERVAL,
} from '../../../shared/constants/const';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.css',
})
export class DashboardOverviewComponent implements OnDestroy, OnInit {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;

  mostDevicedata: any[] = [];
  mostViewedPagedata: any[] = [];
  mostUsedCountriesdata: any[] = [];
  browserCounts: any[] = [];
  countryCounts: any[] = [];

  totalDeviceCount: number = 0;
  maxValue: number = 0;

  mostViewedPages: MostViewedPage[] = [];
  mostClickedActions: MostClickedAction[] = [];
  clientNames: string[] = [];
  deviceCounts: DeviceCount[] = [];
  progressBars: ProgressBar[] = [];

  isDisableViewedPages: boolean = false;
  ismapDisable: boolean = false;
  isDisableClickedAction: boolean = false;

  selectedUsername: string = '';
  selectedClient: string = '';
  defaultSelectedClient: string = '';
  activeTab = 'dashboard';
  selectedInterval: string = WEEKLY_INTERVAL;

  chartConstructor = 'mapChart';
  Highcharts: typeof _Highcharts = _Highcharts;
  chartOptions: Highcharts.Options | null = null;
  subscriptions: Subscription[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    private spinner: NgxSpinnerService
  ) {}
  //Initializes the component and subscribes to data services.
  ngOnInit(): void {
    this.dataService.onDataUpdate((data) => {
      this.mostDevicedata = data;
      this.getDeviceData();
    });

    this.dataService.onMostViewedPage((data) => {
      this.mostViewedPagedata = data;
      this.renderPieChart();
    });

    this.dataService.onMostClickedActions((data) => {
      this.mostClickedActions = data;
      this.renderBarChart();
    });

    this.dataService.onMostUsedCountries((data) => {
      this.mostUsedCountriesdata = data;
      this.getMapComponent();
    });

    this.dataService.onCountryCounts((data) => {
      this.countryCounts = data;
      this.mostViwedCountry();
    });

    this.dataService.onBrowserCounts((data) => {
      this.browserCounts = data;
      this.loadMostUsedBrowsers();
    });

    this.selectedInterval = WEEKLY_INTERVAL;

    this.dataService.emitActiveTab(true);

    this.dataService.onOverviewClientnames((clients) => {
      this.clientNames = clients;
      if (
        this.clientNames &&
        this.clientNames.length > 0 &&
        this.defaultSelectedClient === ''
      ) {
        this.defaultSelectedClient = this.clientNames[0];
        this.dataService.emitSelectedClient(this.clientNames[0]);

        if (this.activeTab.toUpperCase() === DASHBOARD_TAB) {
          this.onDashboardChange(this.clientNames[0]);
          this.mostViwedCountry();
        }
      }
    });
  }

  // load all the widget when it changes the tab
  loadSelectedTabData() {
    if (this.activeTab.toUpperCase() === DASHBOARD_TAB) {
      setTimeout(() => {
        this.renderPieChart();
        this.renderBarChart();
        this.getMapComponent();
        this.mostViwedCountry();
        this.loadMostUsedBrowsers();
        this.getDeviceData();
      }, 2000);
    }
  }

  //Processes and loads device data for the pie chart.
  getDeviceData() {
    const deviceData = this.mostDevicedata
      .filter((entry) => entry.DeviceName)
      .map((entry) => ({
        name: entry.DeviceName,
        y: entry.count,
      }));

    this.totalDeviceCount = deviceData.reduce(
      (total, entry) => total + entry.y,
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
          animation: false,
          dataLabels: {
            enabled: true,
            color: '#000000',
            style: { textOutline: 'none' },
          },
        },
      },
      colors: ['#ffc107', '#052288', '#BBC1D2'],
      series: [{ type: 'pie', name: 'Count', data: deviceData }],
    };

    Highcharts.chart('pieChartContainer', pieChartOptions);

    const totalCountElement = document.getElementById('total-count');
    if (totalCountElement) {
      totalCountElement.innerText =
        'Total Device Count: ' + this.totalDeviceCount;
    }
  }

  /**
   * Handles dashboard change when a different client is selected.
   * @param selectedClient The client selected.
   */
  onDashboardChange(selectedClient: string) {
    this.defaultSelectedClient = selectedClient;
    this.dataService.emitSelectedClient(selectedClient);
    this.mostViwedCountry();
    this.loadMostUsedBrowsers();
    this.getMapComponent();
  }

  //Calculates and displays the most viewed country data.
  mostViwedCountry(): void {
    const maxValue = Math.max(...this.countryCounts.map((item) => item.value));
    const result = maxValue * 2;
    this.maxValue = result;
    this.progressBars = this.countryCounts;
  }

  //Renders the pie chart for most viewed pages.
  renderPieChart() {
    if (this.mostViewedPagedata && this.mostViewedPagedata.length > 0) {
      const filteredData = this.mostViewedPagedata.filter(
        (item: any) =>
          !isNaN(parseFloat(item.percentage)) && item.pageName.trim() !== ''
      );

      if (filteredData.length > 0) {
        const firstFiveData = filteredData.slice(0, 5);
        const colors = ['#052288', '#FFD500', '#BBC1D2', '#78787A', '#1aadce'];

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
              animation: false,
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
              data: firstFiveData.map(
                ({ pageName, percentage }: any, index: number) => ({
                  name: pageName,
                  y: parseFloat(percentage),
                  color: colors[index],
                })
              ),
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
  }

  //Loads and renders the chart for most used browsers.
  loadMostUsedBrowsers(): void {
    const options: Highcharts.Options = {
      credits: { enabled: false },
      chart: {
        animation: false,
        type: 'column',
        height: 300,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
        style: { color: '#000000', fontSize: '0.9em' },
      },
      xAxis: {
        categories: this.browserCounts.map(({ browserName }) => browserName),
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
          animation: false,
          name: 'Browsers',
          type: 'column',
          color: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 1,
              y2: 1,
            },
            stops: [
              [0, '#00FF00'], // Start color (green)
              [1, '#000000'], // End color (black)
            ],
          },
          data: this.browserCounts.map(({ count }) => count),
        },
      ],
      tooltip: { pointFormat: '<b>Counts</b>: {point.y}' },
    };

    Highcharts.chart('most-used-browsers-chart-container', options);
  }

  MostViewedPages() {
    this.dataService.setLink(MOST_VIEWED_PAGES_LINK);
  }

  MostClickedActions() {
    this.dataService.setLink(MOST_CLICKED_ACTIONS_LINK);
  }

  ActiveUserByDevice() {
    this.dataService.setLink(MOST_USED_DEVICES_LINK);
  }

  MostUsedCountries() {
    this.dataService.setLink(USER_BY_COUNTRY_LINK);
  }

  MostUsedBrowser() {
    this.dataService.setLink(MOST_USED_BROWSER_LINK);
  }

  renderBarChart() {
    if (this.mostClickedActions.length > 0) {
      const processedData = this.mostClickedActions.map((item) => ({
        ButtonName: item.ButtonName,
        count: Number(item.count),
      }));

      const firstFiveData = processedData.slice(0, 5);
      const barFillColor = '#052288';

      const options: Highcharts.Options = {
        credits: { enabled: false },
        chart: {
          animation: false,
          type: 'bar',
          height: 300,
          backgroundColor: 'transparent',
        },
        title: { text: '' },
        xAxis: {
          categories: firstFiveData.map(({ ButtonName }) => ButtonName),
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
            animation: false,
            type: 'bar',
            name: 'Clicks',
            color: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 1,
                y2: 1,
              },
              stops: [
                [0, '#6f269b'], // Start color (orange)
                [1, '#a14ed3'], // End color (light green)
              ],
            },
            data: firstFiveData.map(({ count }) => count),
          },
        ],
        tooltip: { pointFormat: '<b>Clicks</b>: {point.y}' },
      };

      Highcharts.chart('bar-chart-container', options);
    }
  }

  getMapComponent() {
    this.ismapDisable = false;

    if (
      !this.mostUsedCountriesdata ||
      this.mostUsedCountriesdata.length === 0
    ) {
      this.ismapDisable = true;
      return;
    }

    const data = this.mostUsedCountriesdata;

    const mapData = data.map((obj) => {
      const countryCode =
        listOfCountryWithCode[obj.country.toLowerCase().trim()] || 'not found';
      return {
        name: obj.country,
        color: '#666b7b',
        'hc-key': countryCode,
      };
    });

    const locationObj = data.map((obj) => ({
      name: obj.cityName,
      lat: Number(obj.latitude),
      lon: Number(obj.longitude),
    }));

    this.chartOptions = {
      credits: { enabled: false },
      chart: {
        animation: false,
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
          data: locationObj,
        },
      ],
    };
  }

  changeActiveTab(clickedTab: string) {
    this.selectedInterval = WEEKLY_INTERVAL;
    this.activeTab = clickedTab;
    this.loadSelectedTabData();
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
