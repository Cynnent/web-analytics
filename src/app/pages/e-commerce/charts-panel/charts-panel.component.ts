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
import { DataService } from "./data.service";
import { interval, Subscription } from 'rxjs';
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
  searchInput: string = "";
  filteredUsernames: string[] = [];
  filteredApiData = [];
  uniqueUsernames: string[] = [];
  clientList: string[] = [];
  selectedInterval: string = "daily";
  chartPanelSummary: OrderProfitChartSummary[];
  period: string = "week";
  searchUsername: string = "";
  allDates: string[] = [];
  ordersChartData: OrdersChart;
  profitChartData: ProfitChart;
  dateSelected: boolean = false;
  fromDate: string = "";
  toDate: string = "";
  selectedUserIndex: number = 0;
  selectedScreenData: any;
  selectedUsername: any = "all";
  selectedOption: string;
  dateList: { id: number; value: string }[] = [];
  clientNames: string[] = [];
  screen1Data: any = {};
  screen2Data: any = {};
  screenLabels: string[] = [];
  filteredData: any[] = [];
  selectedClient: string = "all";
  selectedDate: string = "";
  totalCount: number;
  selectedUserScreenData: any;
  selectedUserButtonTotals: { label: string; total: number }[] = [];
  selectedUserButtonTotalsScreen1: { label: string; total: number }[] = [];
  userList: { id: number; value: string }[] = [];
  objUser: { id: number; value: string }[] = [];
  selectedUserButtonTotalsScreen2: { label: string; total: number }[] = [];
  userEventDates: string[] = [];

  showActionsTooltip = false;
  tooltipActions: string[] = [];
  tooltipTop = 0;
  tooltipLeft = 0;
  tooltipInterval$: Subscription;
  selectedScreen: any = null;


  @ViewChild("ordersChart", { static: true }) ordersChart: OrdersChartComponent;
  @ViewChild("userSelect") userSelect: NbSelectComponent;
  @ViewChild("profitChart", { static: true }) profitChart: ProfitChartComponent;

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
        if (!this.selectedUsername) {
          this.selectedUsername = this.uniqueUsernames[0];
        }
        this.updateHighChart();
      });
  }

  ngOnInit() {
    this.selectedInterval = "weekly";
    this.selectedUsername = "all";
    this.clientNames = this.getClientNames();
    this.extractScreenLabels();
    this.getData();
    this.updateCharts();
    this.populateClientNames();
    this.filteredUsernames = this.uniqueUsernames;
    this.resetTooltip();
    this.onChange(this.selectedClient);
  }

  ngAfterViewInit() {
    this.selectedUsername = "all";
    this.userSelect.selected = "all";
    this.userSelect.selected = "all";
    this.updateCharts();
    this.getOrdersChartData(this.period);
    this.getProfitChartData(this.period);
  }

  logCurrentWeekDates() {
    const today = new Date();
    const startOfWeek = new Date(today);

    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const formattedDate = currentDate.toISOString().split("T")[0];
      weekDates.push(formattedDate);
    }

    console.log("my week:", weekDates);
    return weekDates;
  }

  updateHighChart() {
    if (this.selectedInterval === "weekly") {
      const weekDates = this.logCurrentWeekDates();
      const totalCounts: number[] = this.getTotalCountsForSelectedUser(
        this.selectedUsername
      );
      const weeklyOptions: Highcharts.Options = {
        chart: {
          type: "line",
        },
        title: {
          text: "Weekly Data",
        },
        xAxis: {
          categories: weekDates,
          labels: {
            style: {
              color: "#000000",
            },
          },
          type: "datetime",
          title: {
            text: "Date",
          },
        },
        series: [
          {
            name: this.selectedUsername,
            type: "line",
            data: totalCounts,
          },
        ],
      };

      if (Highcharts.charts && Highcharts.charts[0]) {
        Highcharts.charts[0].update(weeklyOptions);
      } else {
        Highcharts.chart("container", weeklyOptions);
      }
    } else if (this.selectedInterval === "monthly") {
      const monthDates = this.logCurrentMonthDates();
      const totalCounts: number[] = this.getTotalCountsForSelectedUserByMonth(
        this.selectedUsername
      );
      const monthlyOptions: Highcharts.Options = {
        chart: {
          type: "line",
        },
        title: {
          text: "Monthly Data",
        },
        xAxis: {
          categories: monthDates,
          labels: {
            style: {
              color: "#000000",
            },
          },
          type: "datetime",
          title: {
            text: "Date",
          },
        },
        series: [
          {
            name: this.selectedUsername,
            type: "line",
            data: totalCounts,
          },
        ],
      };

      if (Highcharts.charts && Highcharts.charts[0]) {
        Highcharts.charts[0].update(monthlyOptions);
      } else {
        Highcharts.chart("container", monthlyOptions);
      }
    } else {
      // Handle daily interval...
    }
  }

  filterUsernames() {
    if (this.searchInput.trim() === "") {
      this.filteredUsernames = this.uniqueUsernames;
    } else {
      this.filteredUsernames = this.uniqueUsernames.filter((username) =>
        username.toLowerCase().includes(this.searchInput.trim().toLowerCase())
      );
    }
  }

  logCurrentMonthDates() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const monthDates = [];

    for (
      let currentDate = firstDayOfMonth;
      currentDate <= lastDayOfMonth;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      monthDates.push(formattedDate);
    }

    console.log("Current month dates:", monthDates);
    return monthDates;
  }

  getTotalCountsForSelectedUserByMonth(selectedUser: string): number[] {
    const userEvents: Record<string, number> = this.apiData
      .filter((user) => user.userInfo[0]?.userName === selectedUser)
      .map((user) => user.userEvents)
      .reduce((acc, events) => acc.concat(events), [])
      .reduce((countsMap: Record<string, number>, event) => {
        const date: string = event.date;
        const totalCount: number = event.totalCount || 0;
        countsMap[date] = (countsMap[date] || 0) + totalCount;
        return countsMap;
      }, {});

    const monthDates: string[] = this.logCurrentMonthDates();

    const totalCounts: number[] = monthDates.map(
      (date) => userEvents[date] || 0
    );

    return totalCounts;
  }

  onSearch() {
    if (this.searchUsername.trim() !== "") {
      this.filteredData = this.apiData.filter((entry) =>
        entry.userInfo[0].userName
          .toLowerCase()
          .includes(this.searchUsername.toLowerCase())
      );
    } else {
      this.filteredData = this.apiData; // Reset to show all data when search field is empty
    }
  }

  getTotalCountsForSelectedUser(selectedUser: string): number[] {
    const userEvents: Record<string, number> = this.apiData
      .filter((user) => user.userInfo[0]?.userName === selectedUser)
      .map((user) => user.userEvents)
      .reduce((acc, events) => acc.concat(events), [])
      .reduce((countsMap: Record<string, number>, event) => {
        const date: string = event.date;
        const totalCount: number = event.totalCount || 0;
        countsMap[date] = (countsMap[date] || 0) + totalCount;
        return countsMap;
      }, {});

    const weekDates: string[] = this.logCurrentWeekDates();

    const totalCounts: number[] = weekDates.map(
      (date) => userEvents[date] || 0
    );

    return totalCounts;
  }

  getTotalCountsForSelectedClient(
    clientName: string,
    weekStartDate: Date
  ): number[] {
    const filteredData = this.apiData.filter(
      (entry) => entry.userInfo[0].clientName === clientName
    );
    const totalCountsForWeek: number[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);

      let totalCountForDay = 0;

      filteredData.forEach((userData) => {
        const userEvents = userData.userEvents;
        userEvents.forEach((event) => {
          const eventDate = new Date(event.date);
          if (
            eventDate.getFullYear() === currentDate.getFullYear() &&
            eventDate.getMonth() === currentDate.getMonth() &&
            eventDate.getDate() === currentDate.getDate()
          ) {
            totalCountForDay += event.totalCount;
          }
        });
      });
      totalCountsForWeek.push(totalCountForDay);
    }

    return totalCountsForWeek;
  }

  onIntervalChange() {
    if (this.selectedInterval === "weekly" && this.dateSelected) {
      this.selectedInterval = "daily";
    }
  }

  onChangeByselection(selectedOption: string) {
    this.selectedInterval = selectedOption;
    this.updateHighChart();
    // this.showCurrentWeekData();
  }

  getData() {
    this.dataService.getDataForUser().subscribe((apiData) => {
      const filteredData = apiData.filter((entry) => {
        return (
          entry.userInfo[0].userName === this.selectedUsername &&
          entry.userEvents.some((event) => {
            return event.date >= this.fromDate && event.date <= this.toDate;
          })
        );
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

  onDateSelected(username: string, selectedDate: string) {
    this.selectedDate = selectedDate;
    this.selectedUserScreenData = this.getScreenDataForSelectedUserAndDate();
    const userData = this.apiData.find(
      (user) => user.userInfo[0].userName === username
    );
    if (userData) {
      const userEvents = userData.userEvents.find(
        (event) => event.date === selectedDate
      );
      if (userEvents) {
        const totalCount = userEvents.totalCount;
        this.updateHighchart(totalCount);
      } else {
        console.log("No events found for the selected date");
      }
    } else {
      console.log("User data not found");
    }

    this.dateSelected = true;
    this.onIntervalChange();
    this.resetTooltip();
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


toggleTooltip(event: MouseEvent, actions: any[]) {
  
  this.selectedScreen = null;

  
  if (this.tooltipInterval$) {
    this.tooltipInterval$.unsubscribe();
  }

 
  this.showActionsTooltip = true;
  this.tooltipActions = []; 
  this.tooltipTop = (event.target as HTMLElement).offsetTop + (event.target as HTMLElement).offsetHeight;
  this.tooltipLeft = (event.target as HTMLElement).offsetLeft + (event.target as HTMLElement).offsetWidth / 2;

  
  let index = 0;

  
  this.tooltipInterval$ = interval(500).subscribe(() => {
    
    this.tooltipActions.push(`${actions[index].key}: ${actions[index].value}`);
    
    
    index++;

    
    if (index === actions.length) {
      this.tooltipInterval$.unsubscribe();
    }
  });
}

  updateHighchart(totalCount: number) {
    console.log("my totalcount", totalCount);

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
      series: [
        {
          type: "line",
          data: [totalCount],
        },
      ],
    };

    Highcharts.chart("container", options);
  }

  renderChart(seriesData, dates) {
    console.log("series data", seriesData);
    console.log("dates", dates);

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

    console.log("high chart", Highcharts.charts[0]);
    console.log("high charts from nishi", Highcharts.charts);
    if (Highcharts.charts && Highcharts.charts[0]) {
      Highcharts.charts[0].update(options);
      console.log("highcharts welcome: ", Highcharts.charts[0].update(options));
    } else {
      console.log("i am coming inside else block!");
      Highcharts.chart("container", options);
    }
  }

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

  extractDates(apiData: { userEvents: any[] }[]) {
    const dates: string[][] = apiData.map((entry) =>
      entry.userEvents.map((event) => event.date)
    );
    const flattenedDates: string[] = [].concat(...dates);
    this.allDates = Array.from(new Set(flattenedDates));
    console.log("All dates:", this.allDates);
  }

  public screensList = [];
  getScreenDataForSelectedUserAndDate(): any {
    this.screensList = [];
    if (this.selectedUsername.value) {
      this.selectedUsername = this.selectedUsername.value;
    }
    this.apiData.forEach((e, i) => {
      if (e.userInfo[0].userName.trim() == this.selectedUsername.trim()) {
        console.log("e");

        e.userEvents.forEach((u, i) => {
          if (u.date.trim() == this.selectedDate) {
            console.log("f");

            for (const [key, value] of Object.entries(u)) {
              console.log("key", key);
              if (key.trim() !== "date" && key.trim() !== "totalCount") {
                let objscreen = { pageName: key, actions: [] };
                console.log(typeof value);
                if (typeof value == "object") {
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
    
  }

  processApiData(apiData: any[]) {
    this.uniqueUsernames = Array.from(
      new Set(apiData.map((data) => data.userInfo[0].userName))
    );
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
          const eventData = userEvents.find(
            (event: any) => event.date === date
          );
          dataPoints.push(eventData ? eventData.totalCount : 0);
        });

        seriesData.push({
          name: username,
          type: "line",
          data: dataPoints,
        });
      });

      console.log("dataPoints:", seriesData);

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

  extractUserEventDates() {
    if (!this.selectedUsername) {
      this.userEventDates = [];
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

  onUserSelected(selectedUsername: any) {
    this.selectedUsername = selectedUsername;
    this.filterUserData();
    if (selectedUsername === "all") {
      this.selectedDate = "";
      this.getData();
    } else {
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

  filterUserData() {
    this.filteredData = this.apiData.filter((entry) => {
      return (
        entry.userInfo[0].userName === this.selectedUsername &&
        entry.userEvents.some((event) => {
          return event.date >= this.fromDate && event.date <= this.toDate;
        })
      );
    });

    this.updateCharts();
  }

  calculateButtonTotalsForUser(selectedUsername: string, screenNumber: number) {
    const buttonTotals: { [key: string]: number } = {};
    console.log(selectedUsername);
    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === selectedUsername
    );

    console.log("existing user data" + this.apiData);
    console.log(" user data" + userData);

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
  //   const clientNames: string[] = [];
  //   if (Array.isArray(this.apiData)) {
  //     this.apiData.forEach((data) => {
  //       data.userInfo.forEach((userInfo) => {
  //         clientNames.push(userInfo.clientName);
  //       });
  //     });
  //   }

  //   console.log("names: ", clientNames);

  //   return clientNames;
  // }

  getClientNames(): string[] {
    const clientNamesSet: Set<string> = new Set(); // Using Set to automatically remove duplicates

    if (Array.isArray(this.apiData)) {
        this.apiData.forEach((data) => {
            data.userInfo.forEach((userInfo) => {
                clientNamesSet.add(userInfo.clientName); // Add each client name to the set
            });
        });
    }

    // Convert Set back to array
    const clientNames: string[] = Array.from(clientNamesSet);

    console.log("names: ", clientNames);

    return clientNames;
}


  populateClientNames() {
    this.clientNames = this.getClientNames();
  }

  onChange(newValue: string) {
    const filteredData = this.apiData.filter(
        (e) => e.userInfo[0].clientName == newValue
    );

    console.log("filtered data_>>>>",filteredData)

    filteredData.forEach((e, i) => {
        let userName = e.userInfo[0].userName;
        let objUser = { id: i, value: userName };
        this.userList.push(objUser);
        console.log("nishitha", objUser);
    });

    if (this.selectedInterval === 'weekly') {
        const clientName = newValue; // Assuming newValue is the client name
        const interval = this.selectedInterval; // Pass the interval
        this.getAndDisplayEventsForClient(clientName, interval);
    } else if (this.selectedInterval === 'monthly') {
        const clientName = newValue; // Assuming newValue is the client name
        this.getAndDisplayEventsForClient(clientName, this.selectedInterval); // Pass the interval
    }

    // Reset to weekly interval after filtering
    // this.selectedInterval = 'weekly';
}



getAndDisplayEventsForMonthly(clientName) {
  const filteredUserEvents = this.filterUserEventsForCurrentMonth(clientName);
  const dates = this.getCurrentMonthDates(); // Get the dates for the current month

  // Initialize an array to store series data
  const seriesData = [];

  // Iterate over each user
  filteredUserEvents.forEach((user) => {
      // Initialize an array to store data points for the current user
      const dataPoints = [];

      // Iterate over all dates in the specified range
      dates.forEach((date) => {
          // Get total count for the current date
          const totalCount = user.dateWiseCounts[date] || 0;
          dataPoints.push(totalCount); // Push total count to dataPoints array
      });

      // Push series data for the current user
      seriesData.push({
          name: user.userName,
          type: 'line',
          data: dataPoints,
      });
  });

  // Display the series data
  console.log(seriesData);
  this.renderChart(seriesData, dates);
}

  getCurrentWeekStartDate() {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const firstDayOfWeek = new Date(
      currentDate.setDate(
        currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
      )
    );
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  }

  getCurrentMonthDates() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const dates = [];

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        dates.push(date.toISOString().slice(0, 10));
    }

    return dates;
}

  filterUserEventsForCurrentWeek(clientName) {
    const currentWeekStartDate = this.getCurrentWeekStartDate();
    const endDate = new Date().toISOString().slice(0, 10);

    const filteredData = [];

    this.apiData.forEach((user) => {
      user.userInfo.forEach((userInfo) => {
        if (userInfo.clientName === clientName) {
          const userEvents = user.userEvents;

          // Initialize an object to store total counts for each date of the week
          const dateWiseCounts = {};

          // Iterate over all dates of the current week
          currentWeekStartDate.forEach((date) => {
            dateWiseCounts[date] = 0; // Initialize count to 0 for each date
          });

          // Iterate over user events and accumulate total counts for each date
          userEvents.forEach((event) => {
            const eventDate = new Date(event.date).toISOString().slice(0, 10);

            if (dateWiseCounts.hasOwnProperty(eventDate)) {
              dateWiseCounts[eventDate] += event.totalCount; // Accumulate total counts
            }
          });

          filteredData.push({
            userName: userInfo.userName.trim(),
            dateWiseCounts: dateWiseCounts,
          });
        }
      });
    });

    return filteredData;
  }

  filterUserEventsForCurrentMonth(clientName) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const dates = [];

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      dates.push(date.toISOString().slice(0, 10));
    }

    const filteredData = [];

    this.apiData.forEach((user) => {
      user.userInfo.forEach((userInfo) => {
        if (userInfo.clientName === clientName) {
          const userEvents = user.userEvents;

          // Initialize an object to store total counts for each date of the month
          const dateWiseCounts = {};

          // Iterate over all dates of the current month
          dates.forEach((date) => {
            dateWiseCounts[date] = 0; // Initialize count to 0 for each date
          });

          // Iterate over user events and accumulate total counts for each date
          userEvents.forEach((event) => {
            const eventDate = new Date(event.date).toISOString().slice(0, 10);

            if (dateWiseCounts.hasOwnProperty(eventDate)) {
              dateWiseCounts[eventDate] += event.totalCount; // Accumulate total counts
            }
          });

          filteredData.push({
            userName: userInfo.userName.trim(),
            dateWiseCounts: dateWiseCounts,
          });
        }
      });
    });

    return filteredData;
  }

  getAndDisplayEventsForClient(clientName, interval) {
    let filteredUserEvents = [];
    let dates = [];

    if (interval === "weekly") {
      filteredUserEvents = this.filterUserEventsForCurrentWeek(clientName);
      dates = this.getCurrentWeekStartDate(); // Get the dates for the current week
    } else if (interval === "monthly") {
      // Implement filtering and date retrieval logic for monthly interval
      filteredUserEvents = this.filterUserEventsForCurrentMonth(clientName);
      dates = this.getCurrentMonthDates(); // Get the dates for the current month
    } else {
      console.error("Invalid interval provided.");
      return;
    }

    // Initialize an array to store series data
    const seriesData = [];

    // Iterate over each user
    filteredUserEvents.forEach((user) => {
      // Initialize an array to store data points for the current user
      const dataPoints = [];

      // Iterate over all dates in the specified range
      dates.forEach((date) => {
        // Get total count for the current date
        const totalCount = user.dateWiseCounts[date] || 0;
        dataPoints.push(totalCount); // Push total count to dataPoints array
      });

      // Push series data for the current user
      seriesData.push({
        name: user.userName,
        type: "line",
        data: dataPoints,
      });
    });

    // Display the series data
    console.log(seriesData);
    this.renderChart(seriesData, dates);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
