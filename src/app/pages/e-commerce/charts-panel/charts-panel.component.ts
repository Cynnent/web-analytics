import { Component, OnDestroy, ViewChild, OnInit } from "@angular/core";
import { takeWhile } from "rxjs/operators";
import * as Highcharts from "highcharts";
import { AfterViewInit } from "@angular/core";
import { NbSelectComponent } from "@nebular/theme";
import { OrdersChartComponent } from "./charts/orders-chart.component";
import { ProfitChartComponent } from "./charts/profit-chart.component";
import { OrdersChart } from "../../../@core/data/orders-chart";
import { ProfitChart } from "../../../@core/data/profit-chart";
import {
  OrderProfitChartSummary,
  OrdersProfitChartData,
} from "../../../@core/data/orders-profit-chart";
import { ChangeDetectorRef } from "@angular/core"; 
// import { jsonData } from '../../../../jsonData';
import { DataService } from "./data.service";

@Component({
  selector: "ngx-ecommerce-charts",
  styleUrls: ["./charts-panel.component.scss"],
  templateUrl: "./charts-panel.component.html",
})


export class ECommerceChartsPanelComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  buttonCounts: { label: string; total: number }[] = [];
  private alive = true;
  dates: string[] = [];
  uniqueUsernames: string[] = [];
  // selectedUsername: string;
  chartPanelSummary: OrderProfitChartSummary[];
  period: string = "week";
  allDates: string[] = [];
  ordersChartData: OrdersChart;
  profitChartData: ProfitChart;
  selectedUserIndex: number = 0;
  // buttonCounts: { label: string; total: number }[] = [];
  selectedScreenData: any;
  selectedUsername: string = "all";

  screen1Data: any = {};
  screen2Data: any = {};
  screenLabels: string[] = [];
  selectedDate: string = "";
  selectedUserScreenData: any;
  selectedUserButtonTotals: { label: string; total: number }[] = [];
  selectedUserButtonTotalsScreen1: { label: string; total: number }[] = [];
  selectedUserButtonTotalsScreen2: { label: string; total: number }[] = [];
  userEventDates: string[] = [];

  @ViewChild("ordersChart", { static: true }) ordersChart: OrdersChartComponent;
  @ViewChild("userSelect") userSelect: NbSelectComponent;
  @ViewChild("profitChart", { static: true }) profitChart: ProfitChartComponent;
  // jsonData = jsonData;
  apiData: any[];
  constructor(
    private ordersProfitChartService: OrdersProfitChartData,
    private cdr: ChangeDetectorRef,
    private dataService: DataService
  ) {
    this.selectedUsername = "all";

    this.ordersProfitChartService
      .getOrderProfitChartSummary()
      .pipe(takeWhile(() => this.alive))
      .subscribe((summary) => {
        this.chartPanelSummary = summary;
      });

    this.extractUniqueUsernames();
  }

  extractUniqueUsernames() {
    this.dataService
      .getAllUsernamesAndDates()
      .subscribe((userData: { username: string; dates: string[] }[]) => {
        this.uniqueUsernames = userData.map((user) => user.username);

        this.dates = userData[0]?.dates || [];

        this.selectedUsername = this.uniqueUsernames[0];
      });
  }

  ngOnInit() {
    // this.extractUniqueUsernames();a
    this.selectedUsername = "all"; 
    this.extractScreenLabels();
    this.getData();
    this.updateCharts();
  }

  ngAfterViewInit() {
    this.selectedUsername = "all"; // Set selectedUsername to "all" by default
    this.userSelect.selected = "all";       
    this.userSelect.selected = "all";
    this.updateCharts();
    this.getOrdersChartData(this.period);
    this.getProfitChartData(this.period);
  }

  // getData() {
  //   this.dataService.getAllData().subscribe((apiData) => {
  //     console.log("Api data:", apiData);
  //     this.apiData = apiData;
  //     this.processApiData(apiData);
  //     this.extractDates(apiData);
  //     this.filterOutDateAndTotalCountData();
  //     this.extractScreenLabels();
  //     this.updateCharts();
  //   });
  // }

  getData() {
    this.dataService.getDataForUser().subscribe((apiData) => {
      console.log("Api data:", apiData);
      this.apiData = apiData;
      this.processApiData(apiData);
      this.extractDates(apiData);
      this.filterOutDateAndTotalCountData();
      this.extractScreenLabels();
      this.updateCharts();
    });
  }
  

  

  // getData() {
  //   this.dataService.getAllData().subscribe((apiData) => {
  //     console.log("Api data:", apiData);
  //     this.apiData = apiData.map(entry => {
  //       // Exclude "date" and "totalCount" fields from each userEvent
  //       const filteredUserEvents = entry.userEvents.map(event => {
  //         const { date, totalCount, ...rest } = event;
  //         return rest;
  //       });
  //       return { ...entry, userEvents: filteredUserEvents };
  //     });
  //     this.processApiData(this.apiData);
  //     this.updateCharts();
  //     this.extractDates(apiData);
  //     this.filterOutDateAndTotalCountData();
  //     this.extractScreenLabels();
  //   });
  // }
  

  extractScreenLabels() {
    for (const entry of this.apiData) {
      for (const event of entry.userEvents) {
        for (const screenName of Object.keys(event)) {
          if (
            screenName.startsWith("screen") &&
            !this.screenLabels.includes(screenName)
          ) {
            this.screenLabels.push(screenName);
          }
          if (
            screenName !== "DATE Data" &&
            screenName !== "TOTALCOUNT Data" &&
            !screenName.startsWith("screen") &&
            !this.screenLabels.includes(screenName)
          ) {
            this.screenLabels.push(screenName);
          }
        }
      }
    }
    for (const entry of this.apiData) {
      for (const event of entry.userEvents) {
        for (const screenName of Object.keys(event)) {
          if (!this.screenLabels.includes(screenName)) {
            this.screenLabels.push(screenName);
          }
        }
      }
    }
  }

  getScreenData(
    screenLabel: string,
    selectedDate: string,
    selectedUsername: string
  ): any[] {
    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === selectedUsername
    );
    if (userData) {
      return userData.userEvents
        .filter((event) => event.date === selectedDate && event[screenLabel])
        .map((event) => event[screenLabel]);
    }
    return [];
  }

  extractDates(apiData: { userEvents: any[] }[]) {
    const dates: string[][] = apiData.map((entry) =>
      entry.userEvents.map((event) => event.date)
    );
    const flattenedDates: string[] = [].concat(...dates);
    this.allDates = Array.from(new Set(flattenedDates));
    console.log("All dates:", this.allDates);
  }

  onDateSelected(selectedDate: string) {
    this.selectedDate = selectedDate;
    this.selectedUserScreenData = this.getScreenDataForSelectedUserAndDate();
  }

   public screensList = [];
  getScreenDataForSelectedUserAndDate(): any {
    this.screensList = []

    this.apiData.forEach((e, i) => {
      if (
        e.userInfo[0].userName.trim() == this.selectedUsername.trim()
      ) {
        console.log('e');

        e.userEvents.forEach((u, i) => {
          if (u.date.trim() == this.selectedDate) {
            console.log('f');

            for (const [key, value] of Object.entries(u)) {
              console.log('key', key);
              if (key.trim() !== 'date' && key.trim() !== 'totalCount') {
                let objscreen = { pageName: key, actions: [] };
                // console.log(`${key}: ${value}`);
                console.log(typeof value);
                if (typeof value == 'object') {
                  for (const [key, v] of Object.entries(value)) {
                    let action = { key: key, value: v };
                    objscreen.actions.push(action);
                  }
                }

                this.screensList.push(objscreen);
                console.log(this.screensList);
              }
            }
          }
        });
      }
    });

    return this.screensList;
    // if (this.selectedUsername && this.selectedDate) {
    //   const userData = this.apiData.find(
    //     (data) => data.userInfo[0].userName === this.selectedUsername
    //   );
    //   if (userData) {
    //     const event = userData.userEvents.find(
    //       (event) => event.date === this.selectedDate
    //     );
    //     console.log("event", event)

    //     for (const [key, value] of Object.entries(event)) {
    //       if (key.trim() == 'date' || key.trim() == 'totalCount') {
    //           delete event.date || event.totalCount
    //       }
    //     }
    //     return event ? { ...event.screen1, ...event.screen2 } : null;
    //   }
    // }
    // return null;
  }

  getEventData(selectedDate: string) {
    const eventData = this.apiData.filter((entry: any) => {
      return entry.userEvents.some((event: any) => event.date === selectedDate);
    });

    this.screen1Data = {};
    this.screen2Data = {};

    eventData.forEach((entry: any) => {
      entry.userEvents.forEach((event: any) => {
        if (event.date === selectedDate) {
          this.screen1Data = { ...this.screen1Data, ...event.screen1 };
          this.screen2Data = { ...this.screen2Data, ...event.screen2 };
        }
      });
    });
  }

  processApiData(apiData: any[]) {
    this.uniqueUsernames = Array.from(
      new Set(apiData.map((data) => data.userInfo[0].userName))
    );
  }


  

  setPeriodAndGetChartData(value: string): void {
    if (this.period !== value) {
      this.period = value;
    }

    this.getOrdersChartData(value);
    this.getProfitChartData(value);
  }

  changeTab(selectedTab) {
    if (selectedTab.tabTitle === "Profit") {
      this.profitChart.resizeChart();
    } else {
      this.ordersChart.resizeChart();
    }
  }

  getOrdersChartData(period: string) {
    this.ordersProfitChartService
      .getOrdersChartData(period)
      .pipe(takeWhile(() => this.alive))
      .subscribe((ordersChartData) => {
        this.ordersChartData = ordersChartData;
        this.updateCharts();
      });
  }

  getProfitChartData(period: string) {
    this.ordersProfitChartService
      .getProfitChartData(period)
      .pipe(takeWhile(() => this.alive))
      .subscribe((profitChartData) => {
        this.profitChartData = profitChartData;
      });
  }

  // updateCharts() {
  //   const seriesData: Highcharts.SeriesLineOptions[] = [];
  //   const dates: string[] = [];

  //   const filteredUserData = this.apiData.filter((data) => {
  //     return (
  //       this.selectedUsername === "all" ||
  //       data.userInfo[0].userName === this.selectedUsername
  //     );
  //   });

  //   filteredUserData.forEach((userData: any, index: number) => {
  //     const userEvents = userData.userEvents;
  //     userEvents.forEach((event: any) => {
  //       const eventDate = event.date;
  //       if (!dates.includes(eventDate)) {
  //         dates.push(eventDate);
  //       }
  //     });
  //   });

  //   filteredUserData.forEach((userData: any, index: number) => {
  //     const userEvents = userData.userEvents;
  //     const username = userData.userInfo[0].userName;
  //     const dataPoints: number[] = [];

  //     dates.forEach((date) => {
  //       const eventData = userEvents.find((event: any) => event.date === date);
  //       dataPoints.push(eventData ? eventData.totalCount : 0);
  //     });

  //     seriesData.push({
  //       name: username,
  //       type: "line",
  //       data: dataPoints,
  //     });
  //   });

  //   this.cdr.detectChanges();

  //   const options: Highcharts.Options = {
  //     chart: {
  //       type: "line",
  //       // renderTo: "container",
  //       backgroundColor: "#2F3E57",
  //     },
  //     title: {
  //       text: "Total Counts",
  //       style: {
  //         color: "#000",
  //         fontSize: "14px",
  //         fontWeight: "bold",
  //       },
  //     },
  //     xAxis: {
  //       categories: dates,
  //       labels: {
  //         style: {
  //           color: "#ffffff",
  //         },
  //       },
  //     },
  //     yAxis: {
  //       gridLineWidth: 0,
  //       labels: {
  //         style: {
  //           color: "#ffffff",
  //         },
  //       },
  //     },
  //     series: seriesData,
  //   };

  //   Highcharts.chart("container", options);
  // }

  

  updateCharts() {
    const seriesData: Highcharts.SeriesLineOptions[] = [];
    const dates: string[] = [];
  
    let filteredUserData = this.apiData;
  
    if (this.selectedUsername !== "all") {
      filteredUserData = filteredUserData.filter(
        (data) => data.userInfo[0].userName === this.selectedUsername
      );
    }
  
    filteredUserData.forEach((userData: any, index: number) => {
      const userEvents = userData.userEvents;
      userEvents.forEach((event: any) => {
        const eventDate = event.date;
        if (!dates.includes(eventDate)) {
          dates.push(eventDate);
        }
      });
    });
  
    filteredUserData.forEach((userData: any, index: number) => {
      const userEvents = userData.userEvents;
      const username = userData.userInfo[0].userName;
      const dataPoints: number[] = [];
  
      dates.forEach((date) => {
        const eventData = userEvents.find((event: any) => event.date === date);
        dataPoints.push(eventData ? eventData.totalCount : 0);
      });
  
      seriesData.push({
        name: username,
        type: "line",
        data: dataPoints,
      });
    });
  
    this.cdr.detectChanges();
  
    const options: Highcharts.Options = {
      chart: {
        type: "line",
        backgroundColor: "#ffffff",
      },
      title: {
        text: "Total Counts",
        style: {
          color: "#000",
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
      xAxis: {
        categories: dates,
        labels: {
          style: {
            color: "#000000",
          },
        },
      },
      yAxis: {
        gridLineWidth: 0,
        labels: {
          style: {
            color: "#ffffff",
          },
        },
      },
      series: seriesData,
    };
  
    Highcharts.chart("container", options);
  }

  

  switchUser(userIndex: number) {
    if (userIndex >= 0 && userIndex < this.apiData.length) {
      this.selectedUserIndex = userIndex;
      this.updateCharts();
    }
  }

  extractUserEventDates() {
    if (!this.selectedUsername) {
      this.userEventDates = []; // Reset the dates array if no username is selected
      return;
    }

    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === this.selectedUsername
    );
    if (userData) {
      const dates: string[] = userData.userEvents.map((event) => event.date);
      this.userEventDates = Array.from(new Set(dates));
    } else {
      this.userEventDates = [];
    }
  }

  filterOutDateAndTotalCountData() {
    this.apiData = this.apiData.filter((entry) => {
      const userEvents = entry.userEvents;
      const dateDataIndex = userEvents.findIndex(
        (event) => event.date === "DATE Data"
      );
      const totalCountDataIndex = userEvents.findIndex(
        (event) => event.date === "TOTALCOUNT Data"
      );
      return dateDataIndex === -1 && totalCountDataIndex === -1;
    });
  }

  // onUserSelected(selectedUsername: string) {
  //   this.selectedUsername = selectedUsername;
  //   this.getData();
  //   this.calculateButtonTotalsForUser(selectedUsername, 1);
  //   this.calculateButtonTotalsForUser(selectedUsername, 2);
  //   this.cdr.detectChanges();
  //   this.updateCharts();
  //   this.selectedUserScreenData = this.getScreenDataForSelectedUserAndDate();
  //   this.extractUserEventDates();

  //   this.selectedUserScreenData = null;

  //   const userData = this.apiData.find(
  //     (data) => data.userInfo[0].userName === selectedUsername
  //   );

  //   if (userData) {
  //     const selectedDateEvents = userData.userEvents.filter(
  //       (event) => event.date === this.selectedDate
  //     );

  //     if (selectedDateEvents.length > 0) {
  //       this.selectedUserScreenData = selectedDateEvents[0];
  //     }
  //   }
  // }

 

  onUserSelected(selectedUsername: string) {
    
    this.selectedUsername = selectedUsername;

    
    // Check if "All Users" is selected
    if (selectedUsername === "all") {
      this.selectedDate = ''; // Reset selected date
    
      // Display charts for all users
      // this.selectedUsername = selectedUsername;
      this.getData();
      // Other actions as needed...
    } else {

      
      // Display charts for the selected user
      this.selectedUsername = selectedUsername;
      this.getData();
      this.calculateButtonTotalsForUser(selectedUsername, 1);
      this.calculateButtonTotalsForUser(selectedUsername, 2);
      this.cdr.detectChanges();
      this.updateCharts();
      this.selectedUserScreenData = this.getScreenDataForSelectedUserAndDate();
      this.extractUserEventDates();
  
      this.selectedUserScreenData = null;
  
      const userData = this.apiData.find(
        (data) => data.userInfo[0].userName === selectedUsername
      );
  
      if (userData) {
        const selectedDateEvents = userData.userEvents.filter(
          (event) => event.date === this.selectedDate
        );
  
        if (selectedDateEvents.length > 0) {
          this.selectedUserScreenData = selectedDateEvents[0];
        }
      }
    }
    this.updateCharts();
  }
  
  

  updateScreenDataCard() {
    this.buttonCounts = [];

    if (this.screen1Data) {
      Object.keys(this.screen1Data).forEach((property) => {
        this.buttonCounts.push({
          label: property,
          total: this.screen1Data[property],
        });
      });
    }

    if (this.screen2Data) {
      Object.keys(this.screen2Data).forEach((property) => {
        this.buttonCounts.push({
          label: property,
          total: this.screen2Data[property],
        });
      });
    }

    console.log("Button counts:", this.buttonCounts);
  }

  calculateButtonTotalsForUser(selectedUsername: string, screenNumber: number) {
    const buttonTotals: { [key: string]: number } = {};

    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === selectedUsername
    );

    if (userData) {
      const screenKey = `screen${screenNumber}`;
      for (const event of userData.userEvents) {
        if (event[screenKey]) {
          for (const property in event[screenKey]) {
            if (event[screenKey].hasOwnProperty(property)) {
              const isButtonOrLink =
                property.startsWith("btn_") || property.startsWith("link_");
              if (isButtonOrLink) {
                if (buttonTotals[property]) {
                  buttonTotals[property] += event[screenKey][property];
                } else {
                  buttonTotals[property] = event[screenKey][property];
                }
              }
            }
          }
        }
      }

      const buttonTotalsArray = Object.keys(buttonTotals).map((label) => ({
        label: label.replace(/_/g, " "),
        total: buttonTotals[label],
      }));

      console.log(
        `Button and Link Totals for ${selectedUsername} (Screen ${screenNumber}):`,
        buttonTotalsArray
      );

      if (screenNumber === 1) {
        this.selectedUserButtonTotalsScreen1 = buttonTotalsArray;
      } else if (screenNumber === 2) {
        this.selectedUserButtonTotalsScreen2 = buttonTotalsArray;
      }
    } else {
      console.error(`User not found: ${selectedUsername}`);
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
