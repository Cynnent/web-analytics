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
  clientList: string[] = [];
  selectedInterval: string = 'daily'; 
  // selectedUsername: string;
  chartPanelSummary: OrderProfitChartSummary[];
  period: string = "week";
  allDates: string[] = [];
  ordersChartData: OrdersChart;
  profitChartData: ProfitChart;
  fromDate: string = "";
  toDate: string = "";
  selectedUserIndex: number = 0;
  // buttonCounts: { label: string; total: number }[] = [];
  selectedScreenData: any;
  selectedUsername: any = "all";
  selectedOption: string;
  dateList: { id: number; value: string }[] = [];
  clientNames: string[] = [];
  screen1Data: any = {};
  screen2Data: any = {};
  screenLabels: string[] = [];
  filteredData: any[] = [];
  selectedClient: string = 'all';
  selectedDate: string = "";
  selectedUserScreenData: any;
  selectedUserButtonTotals: { label: string; total: number }[] = [];
  selectedUserButtonTotalsScreen1: { label: string; total: number }[] = [];
  userList: { id: number; value: string }[] = [];
  objUser: { id: number, value: string }[] = [];
  selectedUserButtonTotalsScreen2: { label: string; total: number }[] = [];
  userEventDates: string[] = [];

  @ViewChild("ordersChart", { static: true }) ordersChart: OrdersChartComponent;
  @ViewChild("userSelect") userSelect: NbSelectComponent;
  @ViewChild("profitChart", { static: true }) profitChart: ProfitChartComponent;
  // jsonData = jsonData;
  apiData: any[] = []; 
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
        if(!this.selectedUsername){
          this.selectedUsername = this.uniqueUsernames[0];
        }
        this.updateHighChart();
      });
  }

  ngOnInit() {
    this.selectedInterval = 'weekly';

    // Call onIntervalSelected to set the initial date range
  
    // this.extractUniqueUsernames();a
    this.selectedUsername = "all"; 
    this.clientNames = this.getClientNames(); 
    this.extractScreenLabels();
    this.getData();
    this.updateCharts();
    this.populateClientNames();
    // this.clientNames = this.getClientNames();
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
  //   this.dataService.getDataForUser().subscribe((apiData) => {
  //     console.log("Api data:", apiData);
  //     this.apiData = apiData;
  //     this.processApiData(apiData);
  //     this.extractDates(apiData);
  //     this.filterOutDateAndTotalCountData();
  //     this.extractScreenLabels();
  //     this.populateClientNames();
  //     this.updateCharts();
  //   });
  // }

  logCurrentWeekDates() {
    const today = new Date();
    const startOfWeek = new Date(today);

    // Set to the first day of the week (Monday in India)
    const dayOfWeek = startOfWeek.getDay();
    const diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Adjust for Monday being the start of the week
    startOfWeek.setDate(today.getDate() - diff);

    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      // Format date as a string (YYYY-MM-DD)
      const formattedDate = currentDate.toISOString().split('T')[0];
      weekDates.push(formattedDate);
    }

    console.log("my week:", weekDates);
    return weekDates;
}


  updateHighChart() {
    if (this.selectedInterval === 'weekly') {
      const weekDates = this.logCurrentWeekDates();
      const totalCounts: number[] = this.getTotalCountsForSelectedUser(this.selectedUsername);
      const weeklyOptions: Highcharts.Options = {
        chart: {
          type: 'line',
        },
        title: {
          text: 'Weekly Data',
        },
        xAxis: {
          categories: weekDates,
          labels: {
            style: {
              color: "#000000",
            },
          },
          type: 'datetime',
          title: {
            text: 'Date',
          },
        },
        series: [{
          name: this.selectedUsername,
          type: 'line',
          data: totalCounts,
        }],
      };

      if (Highcharts.charts && Highcharts.charts[0]) {
        Highcharts.charts[0].update(weeklyOptions);
      } else {
        Highcharts.chart('container', weeklyOptions);
      }
    } else if (this.selectedInterval === 'monthly') {
      const monthDates = this.logCurrentMonthDates();
      const totalCounts: number[] = this.getTotalCountsForSelectedUserByMonth(this.selectedUsername);
      const monthlyOptions: Highcharts.Options = {
        chart: {
          type: 'line',
        },
        title: {
          text: 'Monthly Data',
        },
        xAxis: {
          categories: monthDates,
          labels: {
            style: {
              color: "#000000",
            },
          },
          type: 'datetime',
          title: {
            text: 'Date',
          },
        },
        series: [{
          name: this.selectedUsername,
          type: 'line',
          data: totalCounts,
        }],
      };
  
      if (Highcharts.charts && Highcharts.charts[0]) {
        Highcharts.charts[0].update(monthlyOptions);
      } else {
        Highcharts.chart('container', monthlyOptions);
      }
    } else {
      // Handle daily interval...
    }
  }

  logCurrentMonthDates() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
    const monthDates = [];
  
    for (let currentDate = firstDayOfMonth; currentDate <= lastDayOfMonth; currentDate.setDate(currentDate.getDate() + 1)) {
      const formattedDate = currentDate.toISOString().split('T')[0];
      monthDates.push(formattedDate);
    }
  
    console.log("Current month dates:", monthDates);
    return monthDates;
  }

  getTotalCountsForSelectedUserByMonth(selectedUser: string): number[] {
    const userEvents: Record<string, number> = this.apiData
      .filter(user => user.userInfo[0]?.userName === selectedUser)
      .map(user => user.userEvents)
      .reduce((acc, events) => acc.concat(events), [])
      .reduce((countsMap: Record<string, number>, event) => {
        const date: string = event.date;
        const totalCount: number = event.totalCount || 0;
        countsMap[date] = (countsMap[date] || 0) + totalCount;
        return countsMap;
      }, {});
  
    const monthDates: string[] = this.logCurrentMonthDates();
  
    const totalCounts: number[] = monthDates.map(date => userEvents[date] || 0);
  
    return totalCounts;
  }

  getTotalCountsForSelectedUser(selectedUser: string): number[] {
    const userEvents: Record<string, number> = this.apiData
      .filter(user => user.userInfo[0]?.userName === selectedUser)
      .map(user => user.userEvents)
      .reduce((acc, events) => acc.concat(events), [])
      .reduce((countsMap: Record<string, number>, event) => {
        const date: string = event.date;
        const totalCount: number = event.totalCount || 0;
        countsMap[date] = (countsMap[date] || 0) + totalCount;
        return countsMap;
      }, {});
  
    const weekDates: string[] = this.logCurrentWeekDates();
  
    const totalCounts: number[] = weekDates.map(date => userEvents[date] || 0);
  
    return totalCounts;
  }
  

  

  onChangeByselection(selectedOption: string) {
    // Handle interval change
    this.selectedInterval = selectedOption;

    // Update Highcharts based on the selected interval
    this.updateHighChart();
  }

  getData() {
    this.dataService.getDataForUser().subscribe((apiData) => {
      // Filter data based on date range and selected user
      const filteredData = apiData.filter(entry => {
        return entry.userInfo[0].userName === this.selectedUsername &&
          entry.userEvents.some(event => {
            return event.date >= this.fromDate && event.date <= this.toDate;
          });
      });

      console.log("Filtered Api data:", filteredData);


      this.apiData = apiData;
      this.processApiData(filteredData);
      this.extractDates(filteredData);
      this.filterOutDateAndTotalCountData();
      this.extractScreenLabels();
      this.populateClientNames();
      this.updateCharts();
    });
  }
  
  onDateRangeChange() {
    this.getData();
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
    this.screensList = [];
    if(this.selectedUsername.value){
      this.selectedUsername = this.selectedUsername.value;
    }
    this.apiData.forEach((e, i) => {
      if (
        (e.userInfo[0].userName.trim() == this.selectedUsername.trim())
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

    if (Array.isArray(this.apiData)) {
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

 

  onUserSelected(selectedUsername: any) {
    
    this.selectedUsername = selectedUsername;
    this.filterUserData();
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
      this.calculateButtonTotalsForUser(selectedUsername.value, 1);
      this.calculateButtonTotalsForUser(selectedUsername.value, 2);
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

  updateUserList(newValue: string) {
    this.selectedUsername = ''; 
    this.selectedDate = ''; 
    this.userList = [];
  
    this.apiData.map((e, i) => {
      let userName =
        e.userInfo[0].clientName == newValue ? e.userInfo[0].userName : null;
      if (userName) {
        let objUser = { id: i, value: userName };
        this.userList.push(objUser);
        console.log('nishitha', objUser);
      }
    });
  
    this.selectedUsername = this.userList.length > 0 ? this.userList[0].value : '';
    this.onUserSelected(this.selectedUsername);
  }
  
  filterUserData() {
    this.filteredData = this.apiData.filter((entry) => {
      return entry.userInfo[0].userName === this.selectedUsername &&
        entry.userEvents.some((event) => {
          return event.date >= this.fromDate && event.date <= this.toDate;
        });
    });

    // Call your method to update the charts with the filtered data
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
    console.log(selectedUsername)
    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === selectedUsername
    );

    console.log("existing user data"+this.apiData);
    console.log(" user data"+userData);

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



  // getClientNames(): string[] {
  //   const clientNamesSet = new Set<string>();

  //   if (Array.isArray(this.apiData)) {
  //     this.apiData.forEach((data) => {
  //       data.userInfo.forEach((userInfo) => {
  //         clientNamesSet.add(userInfo.clientName);
  //       });
  //     });
  //   }

  //   return Array.from(clientNamesSet);
  // }

  getClientNames(): string[] {
    const clientNames: string[] = [];
  console.log("names: ",clientNames)
    if (Array.isArray(this.apiData)) {
      this.apiData.forEach((data) => {
        data.userInfo.forEach((userInfo) => {
          clientNames.push(userInfo.clientName);
        });
      });
    }
  
    return clientNames;
  }

  populateClientNames() {
    this.clientNames = this.getClientNames();
  }
  

  // onChange(newValue: string) {
  //   console.log(`Selected option: ${newValue}`);
  //   this.selectedOption = newValue;
  //   this.userList = [];
  //   this.dateList = [];
  
  //   // Filter data based on the selected client name
  //   const filteredData = this.apiData.filter(
  //     (e) => e.userInfo[0].clientName == newValue
  //   );
  
  //   filteredData.forEach((e, i) => {
  //     let userName = e.userInfo[0].userName;
  //     let objUser = { id: i, value: userName };
  //     this.userList.push(objUser);
  //     console.log('nishitha', objUser);
  //   });
  
  //   if (this.userList.length > 0) {
  //     this.selectedUsername = this.userList[0].value;
  //     this.onUserSelected(this.selectedUsername);
  //   } else {
  //     this.selectedUsername = ''; // Handle the case when there are no users for the selected client
  //   }
  // }


  onChange(newValue: string) {
    console.log(`Selected option: ${newValue}`);
    this.selectedOption = newValue;
    this.userList = [];
    this.dateList = [];
  
    // Filter data based on the selected client name
    const filteredData = this.apiData.filter(
      (e) => e.userInfo[0].clientName == newValue
    );
  
    filteredData.forEach((e, i) => {
      let userName = e.userInfo[0].userName;
      let objUser = { id: i, value: userName };
      this.userList.push(objUser);
      console.log('nishitha', objUser);
    });
  
    // Extract all usernames for the selected client
    const allUsernames = this.userList.map(user => user.value);
  
    // Set the selectedUsername to the first username in the list (if available)
    this.selectedUsername = allUsernames.length > 0 ? allUsernames[0] : '';
  
    // Trigger the user selection logic
    this.onUserSelected(this.selectedUsername);
  }
  
  
  
  
  

  // onChange(newValue: string) {
  //   console.log('onChange triggered with:', newValue);
  
  //   this.clientNames = this.getClientNames();
  
  //   console.log('Client names:', this.clientNames);
  
  //   if (!this.clientNames) {
  //     console.warn('Client names not yet populated.');
  //     return;
  //   }
  //   this.selectedOption = newValue;
  //   this.userList = [];
  //   this.dateList = [];
  //   this.clientList = []; // Add this line to store unique client names
  
  //   this.apiData.forEach((e, i) => {
  //     let userName =
  //       e.userInfo[0].clientName == newValue ? e.userInfo[0].userName : null;
  //     if (userName) {
  //       let objUser = { id: i, value: userName };
  //       this.userList.push(objUser);
  //     }
  //   });
  
  //   this.selectedUsername = this.userList.length > 0 ? this.userList[0].value : '';
  
  //   // Call updateUserList method explicitly
  //   this.updateUserList(newValue);
  // }
  
  ngOnDestroy() {
    this.alive = false;
  }
}
