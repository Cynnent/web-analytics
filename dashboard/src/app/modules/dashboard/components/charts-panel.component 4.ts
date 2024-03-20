import {
  Component,
  OnDestroy,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from "@angular/core";
import * as Highcharts from "highcharts";
import { NbSelectComponent } from "@nebular/theme";
import { OrdersChartComponent } from "./charts/orders-chart.component";
import { ProfitChartComponent } from "./charts/profit-chart.component";
import { ToastrService } from "ngx-toastr";
import { DataService } from "./data.service";
import { mapData } from "../../../../assets/data/mapData";
import * as _Highcharts from "highcharts/highmaps";
import { Calendar } from "primeng/calendar";
import HighchartsData from "@highcharts/map-collection/custom/world.topo.json";

@Component({
  selector: "ngx-ecommerce-charts",
  styleUrls: ["./charts-panel.component.scss"],
  templateUrl: "./charts-panel.component.html",
})
export class ECommerceChartsPanelComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() latitude: number;
  @Input() longitude: number;
  chartConstructor = "mapChart";
  Highcharts: typeof _Highcharts = _Highcharts;
  chartOptions: Highcharts.Options = null;
  public dates: string[] = [];
  public clientNames: string[] = [];
  public selectedUsername: string | undefined;
  date: Date | undefined;
  public tabToggle: boolean = false;
  selectedInterval: string = "weekly";
  tabName: string;
  alive: boolean = true;
  selectedClient: string;
  selectedDate: string = "";
  selectedDateForId: string = "";
  totalCount: number;
  userDropdownData: { id: string; value: string }[] = [];
  defaultSelectedClient: string;
  deviceCounts: { deviceType: string; count: number }[] = [];
  mostViewedPages: any[] = [];
  mostClickedActions: any[] = [];
  totalDeviceCount: number = 0;
  chartDisabled: boolean = false;
  mapDisable: boolean = false;
  isInterval: boolean = false;

  @ViewChild("ordersChart", { static: true }) ordersChart: OrdersChartComponent;
  @ViewChild("userSelect") userSelect: NbSelectComponent;
  @ViewChild("profitChart", { static: true }) profitChart: ProfitChartComponent;
  @ViewChild("datePicker") datePicker: Calendar;

  apiData: any[] = [];
  constructor(
    private cdr: ChangeDetectorRef,
    public dataService: DataService,
    private toastr: ToastrService
  ) {
    this.selectedUsername = "all";
  }

  ngOnInit(): void {
    this.getMapComponent(this.selectedClient);
    this.renderPieChart();
    this.renderBarChart();

    this.dataService.getAllClients().subscribe((clients) => {
      this.clientNames = clients;
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        this.onDashboardClientChange(this.clientNames[0]);
      }
    });
  }

  loadSelectedTabData(tabName) {
    if (tabName === "dashboard") {
      this.tabToggle = false;
      setTimeout(() => {
        this.renderPieChart();
        this.renderBarChart();
        this.getMapComponent(this.defaultSelectedClient);
        this.getDeviceData(this.defaultSelectedClient);
      }, 2000);
      if (this.chartDisabled) {
        this.enableChart();
      }
    } else if (tabName === "insights") {
      this.tabToggle = true;
      if (this.selectedUsername !== "" && this.selectedInterval === "weekly") {
        this.getWeeklyData();
      }
      if (
        this.selectedUsername != "" &&
        this.selectedClient != "" &&
        this.selectedInterval === "monthly"
      ) {
        this.selectedInterval = "weekly";
        this.getWeeklyData();
      }
    }
  }

  getDeviceData(selectedClient: string): void {
    this.dataService.getUsersData(selectedClient).subscribe((data) => {
      if (data && data.length > 0) {
        const deviceCounts: { [key: string]: number } = data.reduce(
          (counts, entry) => {
            const deviceName = entry.DeviceName;
            if (deviceName) {
              counts[deviceName] = (counts[deviceName] || 0) + 1;
            }
            return counts;
          },
          {}
        );

        const deviceData = Object.entries(deviceCounts).map(
          ([deviceName, count]: [string, number]) => ({
            name: deviceName,
            y: count,
          })
        );

        this.totalDeviceCount = Object.values(deviceCounts).reduce(
          (total, count) => total + count,
          0
        );

        const pieChartOptions: Highcharts.Options = {
          credits: { enabled: false },
          chart: {
            type: "pie",
            backgroundColor: "transparent",
          },
          title: {
            text: "Active User by Device",
            style: {
              color: "#ffffff",
              fontSize: "0.9em",
            },
          },
          tooltip: {
            pointFormat: "{series.name}: <b>{point.y}</b>",
          },
          plotOptions: {
            pie: {
              innerSize: "80%",
              borderWidth: 0,
              depth: 10,
              dataLabels: {
                enabled: true,
                color: "#ffffff",
                style: {
                  textOutline: "none",
                },
              },
            },
          },
          series: [
            {
              type: "pie",
              name: "Count",
              data: deviceData.map((item) => [item.name, item.y]),
            },
          ],
        };

        Highcharts.chart("pieChartContainer", pieChartOptions);

        const totalCountElement = document.getElementById("total-count");
        if (totalCountElement) {
          totalCountElement.innerText =
            "Total Device Count: " + this.totalDeviceCount;
        }
      } else {
        this.removeChart("pieChartContainer");
      }
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

  onInsightClientChange(selectedClient): void {
    this.dataService.getUsersByClientName(selectedClient).subscribe((users) => {
      this.dataService.userDropdownData = users.map((user) => ({
        id: user._id,
        value: user._id,
      }));
      this.onDashboardClientChange(selectedClient);

      if (this.selectedClient != "" && this.selectedInterval == "weekly") {
        this.getWeeklyData();
      } else {
        this.fetchMonthlyChartData();
      }

      if (this.selectedClient !== "") {
        this.datePicker.writeValue(null);
      }
      this.cdr.detectChanges();
    });
  }

  onDashboardClientChange(selectedClient): void {
    let selectedClientId = selectedClient;
    console.log(selectedClient);
    this.dataService
      .getUsersByClientName(selectedClientId)
      .subscribe((users) => {
        this.dataService.userDropdownData = users.map((user) => ({
          id: user._id,
          value: user._id,
        }));

        const defaultUser = this.dataService.userDropdownData[0];
        this.selectedUsername = defaultUser.id;
        this.loadMostViewedPages(selectedClient);
        this.loadMostClickedActions(selectedClient);
        this.getDeviceData(selectedClient);
        this.getMapComponent(this.defaultSelectedClient);
        this.renderBarChart();
        this.cdr.detectChanges();
      });
  }

  loadMostClickedActions(selectedClient: string): void {
    this.dataService.getMostClickedActions(selectedClient).subscribe((data) => {
      this.mostClickedActions = data;

      this.renderBarChart();
    });
  }

  loadMostViewedPages(selectedClient: string): void {
    this.dataService.getMostVisitedPages(selectedClient).subscribe((data) => {
      this.mostViewedPages = data;

      this.renderPieChart();
    });
  }

  onUserChange(): void {
    if (this.selectedUsername !== "") {
      this.datePicker.writeValue(null);
      if (this.selectedUsername != "" && this.selectedInterval == "daily") {
        this.selectedInterval = "weekly";
        this.getWeeklyData();
      }
      if (this.selectedUsername != "" && this.selectedInterval == "weekly") {
        this.getWeeklyData();
        this.disableChart();
      }
      if (this.selectedInterval == "monthly") {
        this.fetchMonthlyChartData();
      }
    }
  }

  onIntervalChange(selectedInterval: string) {
    const interval = selectedInterval;
    if (!(this.isInterval === true)) {
      if (interval === "monthly" && this.selectedUsername !== "") {
        this.fetchMonthlyChartData();
        this.enableChart();
      }
      if (interval === "weekly" && this.selectedUsername !== "") {
        this.getWeeklyData();
        this.disableChart();
      }
    }
  }

  getWeeklyData() {
    if (!this.selectedUsername) {
      return;
    } else {
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
                type: "line",
                data: currentWeekData.map((entry) => entry.totalCount),
              },
            ];

            this.renderChart(seriesData, dates);
          } else {
            this.toastr.error("No user data found for the current week");
          }
        },
        (error) => {
          this.toastr.error(error.error.error);
        }
      );
    }
  }

  getCurrentWeekTotalData(start, end) {
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
            type: "line",
            data: totalCounts,
          },
        ];

        this.renderChart(seriesData, dates);
      });
  }

  getDatesArrayForMonthlyAndDaily(startDate, endDate) {
    const datesArray = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      datesArray.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
  }

  getChartDataBYUserId(selectedDateForId): void {
    if (!this.selectedUsername || !selectedDateForId) {
      return;
    }

    this.dataService
      .getUserEvents(this.selectedUsername, selectedDateForId)
      .subscribe(
        (userData) => {
          if (!userData) {
            this.toastr.error("Invalid response from API");
            return;
          }

          if (userData.totalCount === 0) {
            this.disableChart();
            this.toastr.error("No data found for the specified date.");
          } else {
            this.enableChart();
            const seriesData = [
              { name: "Total Count", data: [userData.totalCount] },
            ];
            this.renderChart(seriesData, [selectedDateForId]);
          }
        },
        (error) => {
          if (error.status === 404) {
          } else {
            console.error("Error fetching user events", error);
          }
          this.disableChart();
          this.toastr.error(
            error.status === 404
              ? "No data found for the specified date."
              : "Error fetching user events"
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

    if (this.selectedUsername !== "" && this.selectedDate !== "") {
      // this.getChartDataBYUserId(this.selectedDate);
      if (this.selectedDate != "") {
        this.selectedInterval = "daily";
      }
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  renderChart(seriesData, dates) {
    const options = {
      credits: { enabled: false },
      chart: { type: "line", backgroundColor: "transparent" },

      title: {
        text: "Insight",

        style: { color: "#fff", fontSize: "14px", fontWeight: "bold" },
      },
      xAxis: { categories: dates, labels: { style: { color: "#ffffff" } } },
      yAxis: {
        title: {
          text: "Most Clicked Actions",
          style: {
            color: "#ffffff",
          },
        },
        labels: { format: "{text}" },
        gridLineColor: "transparent",
        gridLineWidth: 0,
      },
      legend: {
        itemStyle: {
          color: "#ffffff",
        },
      },
      series: seriesData,
    };

    Highcharts.chart("container", options);
  }

  renderPieChart() {
    this.dataService
      .getMostVisitedPages(this.defaultSelectedClient)
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.mostViewedPages = data;
          if (this.mostViewedPages.length > 0) {
            const totalViews = this.mostViewedPages.reduce(
              (total, item) => total + item.count,
              0
            );
            const first5Data = this.mostViewedPages.slice(0, 4);
            const colors = [
              "#052288",
              "#FFD500",
              "#BBC1D2",
              "#78787A",
              "#1aadce",
            ];
            const options: Highcharts.Options = {
              credits: { enabled: false },
              chart: {
                type: "pie",
                height: 300,
                backgroundColor: "transparent",
              },
              title: {
                text: "Most Viewed Pages",
                style: {
                  color: "white",
                  fontSize: "0.9em",
                },
              },
              plotOptions: {
                pie: {
                  colors: colors,
                  borderWidth: 0,
                  dataLabels: {
                    enabled: true,
                    format: "<b>{point.name}</b>: {point.percentage:.1f}%",
                    style: {
                      textOutline: "none",
                      color: "white",
                    },
                  },
                },
              },
              series: [
                {
                  type: "pie",
                  data: first5Data.map(({ pageName, count }, index) => ({
                    name: pageName,
                    y: (count / totalViews) * 100,
                    color: colors[index],
                  })),
                },
              ],
              tooltip: {
                pointFormat: "<b>Most Viewed</b>: {point.percentage:.1f}%",
              },
            };

            Highcharts.chart("pie-chart-container", options);
          } else {
            this.removeChart("pie-chart-container");
          }
        }
      });
  }

  renderBarChart() {
    if (this.mostClickedActions.length > 0) {
      const totalViews = this.mostClickedActions.reduce(
        (total, item) => total + item.count,
        0
      );
      const colors = ["#052288", "#FFD500", "#BBC1D2", "#78787A", "#1aadce"];
      const first5Data = this.mostClickedActions.slice(0, 5);
      const options: Highcharts.Options = {
        credits: { enabled: false },
        chart: {
          type: "bar",
          height: 300,
          backgroundColor: "transparent",
        },
        title: {
          text: "Most Clicked Actions",
          style: {
            color: "#ffffff",
            fontSize: "0.9em",
          },
        },
        xAxis: {
          categories: first5Data.map(({ ButtonName }) => ButtonName),
          labels: {
            style: {
              color: "#ffffff",
            },
          },
        },
        yAxis: {
          title: {
            text: "Total counts",
            style: {
              color: "#ffffff",
            },
          },
          labels: {
            style: {
              color: "#ffffff",
            },
          },
          gridLineColor: "transparent",
          gridLineWidth: 0,
        },
        plotOptions: {
          bar: {
            colors: colors,
            borderWidth: 0,
          },
        },
        legend: {
          itemStyle: {
            color: "#ffffff",
          },
        },
        series: [
          {
            type: "bar",
            name: "Clicks",
            data: first5Data.map(({ count }) => count),
          },
        ],
        tooltip: {
          pointFormat: "<b>Clicks</b>:{point.y}",
        },
      };

      Highcharts.chart("bar-chart-container", options);
    }
  }

  getMapComponent(selectedClient) {
    console.log("after selection of Selected client:", selectedClient);
    if (selectedClient) {
      this.mapDisable = false;
      this.dataService.getlocationData(selectedClient).subscribe((data) => {
        if (data && data.length > 0) {
          const modifiedArray = data.map((obj) => ({
            name: obj.cityName,
            lat: Number(obj.latitude),
            lon: Number(obj.longitude),
          }));

          const stringifiedArray = modifiedArray.map((obj) => {
            let newObj = {};
            for (const key in obj) {
              newObj[key] = obj[key];
            }
            return newObj;
          });
          if (stringifiedArray != undefined) {
            this.chartOptions = {
              credits: { enabled: false },
              chart: {
                type: "map",
                map: HighchartsData,
                backgroundColor: "transparent",
              },
              title: {
                text: null,
                style: {
                  color: "#ffffff",
                },
              },
              mapNavigation: {
                enabled: true,
                buttonOptions: {
                  alignTo: "spacingBox",
                },
              },
              legend: {
                enabled: true,
              },
              colorAxis: {
                visible: false,
                minColor: "#C5C6C7",
                maxColor: "#C5C6C7",
              },
              series: [
                {
                  name: "Random data",
                  states: {
                    hover: {
                      color: "#6E6F71",
                    },
                  },
                  dataLabels: {
                    enabled: false,
                    format: "{point.name}",
                  },
                  allAreas: false,
                  data: mapData,
                } as Highcharts.SeriesMapOptions,
                {
                  type: "mappoint",
                  name: "Canada cities",
                  marker: {
                    radius: 5,
                    fillColor: "#FFFF00",
                  },

                  data: stringifiedArray,
                  dataLabels: {
                    color: "#ffff",
                    style: {
                      textOutline: "none",
                    },
                  },
                },
              ],
            };
          }
        } else {
          this.mapDisable = true;
        }
      });
    }
  }

  ngAfterViewInit() {
    this.selectedUsername = "all";
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
