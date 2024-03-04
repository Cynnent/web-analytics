import {
  Component,
  OnDestroy,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import * as Highcharts from "highcharts";
import { NbSelectComponent } from "@nebular/theme";
import { OrdersChartComponent } from "./charts/orders-chart.component";
import { ProfitChartComponent } from "./charts/profit-chart.component";
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
  public dates: string[] = [];
  alive: boolean = true;
  currentDate: string = new Date().toISOString().split("T")[0];
  searchInput: string = "";
  filteredUsernames: string[] = [];
  filteredApiData = [];
  uniqueUsernames: string[] = [];
  clientList: string[] = [];
  selectedInterval: string = "daily";
  period: string = "week";
  searchUsername: string = "";
  fromDate: string = "";
  toDate: string = "";
  selectedUsername: any = "all";
  selectedIntervalOption: string;
  clientNames: string[] = [];
  filteredData: any[] = [];
  allDates: string[] = [];
  selectedClient: string = "all";
  selectedDate: string = "";
  totalCount: number;
  selectedUserScreenData: any;
  screenLabels: string[] = [];
  userList: { id: number; value: string }[] = [];
  public screensList = [];
  objUser: { id: number; value: string }[] = [];
  userEventDates: string[] = [];
  isAllClients: boolean = false;
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
    private cdr: ChangeDetectorRef,
    private dataService: DataService
  ) {
    this.selectedUsername = "all";
  }

  ngOnInit() {
    this.selectedInterval = "weekly";
    this.selectedUsername = "all";
    this.isAllClients = true;
    this.clientNames = this.getClientNames();
    this.getData();
    this.cdr.detectChanges();
    this.populateClientNames();
    this.onClientChange(this.selectedClient);
    this.filteredUsernames = this.uniqueUsernames;
    this.resetTooltip();
  }

  ngAfterViewInit() {
    this.selectedUsername = "all";
    this.cdr.detectChanges();
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

    return weekDates;
  }

  updateHighChart() {
    let options: Highcharts.Options;

    switch (this.selectedInterval) {
      case "weekly":
        options = this.getWeeklyOptions();
        break;
      case "monthly":
        options = this.getMonthlyOptions();
        break;
      case "daily":
        options = this.getDailyOptions();
        break;
      default:
        return;
    }

    if (Highcharts.charts && Highcharts.charts[0]) {
      Highcharts.charts[0].update(options);
    } else {
      Highcharts.chart("container", options);
    }
  }

  getWeeklyOptions(): Highcharts.Options {
    const weekDates = this.logCurrentWeekDates();
    const totalCounts = this.getTotalCountsForSelectedUser(
      this.selectedUsername
    );

    return {
      credits: {
        enabled: false,
      },

      chart: { type: "line" },
      title: { text: "Weekly Data" },
      xAxis: {
        categories: weekDates,
        labels: { style: { color: "#000000" } },
        type: "datetime",
      },
      yAxis: {
        title: {
          text: "Most Clicked Actions",
        },
        labels: {
          format: "{text}",
        },
      },
      series: [
        { name: this.selectedUsername, type: "line", data: totalCounts },
      ],
    };
  }

  getMonthlyOptions(): Highcharts.Options {
    const monthDates = this.logCurrentMonthDates();
    const totalCounts = this.getTotalCountsForSelectedUserByMonth(
      this.selectedUsername
    );

    return {
      credits: {
        enabled: false,
      },
      chart: { type: "line" },
      title: { text: "Monthly Data" },
      xAxis: {
        categories: monthDates,
        labels: { style: { color: "#000000" } },
        type: "datetime",
      },
      yAxis: {
        title: {
          text: "Most Clicked Actions",
        },
        labels: {
          format: "{text}",
        },
      },
      series: [
        { name: this.selectedUsername, type: "line", data: totalCounts },
      ],
    };
  }

  getDailyOptions(): Highcharts.Options {
    const currentDateData = this.getCurrentDateData();
    const totalCount = currentDateData
      ? currentDateData.userEvents.find(
          (event) => event.date === this.currentDate
        )?.totalCount || 0
      : 0;

    return {
      credits: {
        enabled: false,
      },
      chart: { type: "line" },
      title: { text: "Daily Data" },
      xAxis: {
        categories: [this.currentDate],
        labels: { style: { color: "#000000" } },
        type: "datetime",
      },
      yAxis: {
        title: {
          text: "Most Clicked Actions",
        },
        labels: {
          format: "{text}",
        },
      },
      series: [
        { name: this.selectedUsername, type: "line", data: [totalCount] },
      ],
    };
  }

  getCurrentDateData(): any {
    return this.apiData.find(
      (entry) =>
        entry.userInfo[0].clientName === this.selectedClient &&
        entry.userInfo[0].userName === this.selectedUsername &&
        entry.userEvents.some((event) => event.date === this.currentDate)
    );
  }

  logCurrentMonthDates() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const monthDates = [];
    let currentDate = new Date(firstDayOfMonth);

    while (currentDate < lastDayOfMonth) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      monthDates.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return monthDates;
  }

  getTotalCountsForSelectedUserByMonth(selectedUser: string): number[] {
    const userData = this.apiData.find(
      (user) => user.userInfo[0]?.userName === selectedUser
    );
    if (!userData) return [];

    const countsMap: Record<string, number> = {};
    userData.userEvents.forEach((event) => {
      const date: string = event.date;
      const totalCount: number = event.totalCount || 0;
      countsMap[date] = (countsMap[date] || 0) + totalCount;
    });

    const monthDates: string[] = this.logCurrentMonthDates();

    const totalCounts: number[] = monthDates.map(
      (date) => countsMap[date] || 0
    );

    return totalCounts;
  }

  getTotalCountsForSelectedUser(selectedUser: string): number[] {
    const userEvents = this.apiData
      .filter((user) => user.userInfo[0]?.userName === selectedUser)
      .map((user) => user.userEvents)
      .reduce((acc, val) => acc.concat(val), [])
      .reduce((countsMap: Record<string, number>, event) => {
        const date = event.date;
        const totalCount = event.totalCount || 0;
        countsMap[date] = (countsMap[date] || 0) + totalCount;
        return countsMap;
      }, {});

    const weekDates = this.logCurrentWeekDates();
    const totalCounts = weekDates.map((date) => userEvents[date] || 0);

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
      for (const userData of filteredData) {
        const userEvents = userData.userEvents;
        for (const event of userEvents) {
          const eventDate = new Date(event.date);
          if (
            eventDate.getFullYear() === currentDate.getFullYear() &&
            eventDate.getMonth() === currentDate.getMonth() &&
            eventDate.getDate() === currentDate.getDate()
          ) {
            totalCountForDay += event.totalCount;
          }
        }
      }
      totalCountsForWeek.push(totalCountForDay);
    }

    return totalCountsForWeek;
  }

  onIntervalChange() {
    if (
      this.selectedInterval === "weekly" ||
      this.selectedInterval == "monthly"
    ) {
      this.selectedInterval = "daily";
    }
  }

  onChangeByIntervalSelection(selectedIntervalOption: string) {
    const clientName = this.selectedClient;
    const interval = this.selectedInterval;

    if (selectedIntervalOption === "daily") {
      this.selectedInterval = selectedIntervalOption;
    } else {
      this.selectedDate = "";
    }

    if (this.selectedUsername !== "all") {
      this.selectedInterval = selectedIntervalOption;
      this.updateHighChart();
    } else {
      const filteredData = this.apiData.filter(
        (e) => e.userInfo[0].clientName == this.selectedClient
      );

      filteredData.forEach((e, i) => {
        let userName = e.userInfo[0].userName;
        let objUser = { id: i, value: userName };
        this.userList.push(objUser);
      });

      if (
        this.selectedInterval !== "monthly" &&
        this.selectedInterval !== "daily"
      ) {
        this.selectedInterval = "weekly";
        this.updateHighChart();
      }

      if (
        interval === "daily" ||
        interval === "weekly" ||
        interval === "monthly"
      ) {
        this.getAndDisplayEventsForClient(clientName, interval);
      }
    }
  }

  renderWeeklyChartForSelectedUsername(username: string) {
    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === username
    );

    if (userData) {
      const userEventsMap = new Map(
        userData.userEvents.map((event) => [event.date, event.totalCount])
      );
      const dates = this.getCurrentWeekStartDate();
      const seriesData: Highcharts.SeriesLineOptions[] = [];

      dates.forEach((date) => {
        const totalCount = userEventsMap.get(date) || 0;
        seriesData.push({
          name: username,
          type: "line",
          data: [totalCount],
        });
      });

      this.renderChart(seriesData, dates);
    }
  }

  getData() {
    if (this.selectedInterval === "weekly") {
      this.dataService.getDataForUser().subscribe((apiData) => {
        this.apiData = apiData;
        this.populateClientNames();
        this.cdr.detectChanges();
      });
    }
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
      }
    }

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
    const seriesData = [
      {
        name: this.selectedUsername,
        type: "line",
        data: [totalCount],
      },
    ];

    const dates = [this.selectedDate];
    this.renderChart(seriesData, dates);
  }

  renderChart(seriesData, dates) {
    const options: Highcharts.Options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "line",
      },
      title: {
        text: "Insight",
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
        title: {
          text: "Most Clicked Actions",
        },
        labels: {
          format: "{text}",
        },
      },
      series: seriesData,
    };

    Highcharts.chart("container", options);
  }

  getScreenDataForSelectedUserAndDate(): any {
    this.screensList = [];
    if (this.selectedUsername.value) {
      this.selectedUsername = this.selectedUsername.value;
    }
    this.apiData.forEach((e, i) => {
      if (e.userInfo[0].userName.trim() == this.selectedUsername.trim()) {
        e.userEvents.forEach((u, i) => {
          if (u.date.trim() == this.selectedDate) {
            for (const [key, value] of Object.entries(u)) {
              if (key.trim() !== "date" && key.trim() !== "totalCount") {
                let objscreen = { pageName: key, actions: [] };
                if (typeof value == "object") {
                  for (const [key, v] of Object.entries(value)) {
                    let action = { key: key, value: v };
                    objscreen.actions.push(action);
                  }
                }

                this.screensList.push(objscreen);
              }
            }
          }
        });
      }
    });

    return this.screensList;
    
  }

  extractUserEventDates() {
    if (!this.selectedUsername) {
      this.userEventDates = [];
      return;
    }

    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === this.selectedUsername
    );
    this.userEventDates = userData
      ? [...new Set(userData.userEvents.map((event) => event.date))].filter(
          (date): date is string => typeof date === "string"
        )
      : [];
  }

  onUserSelected(selectedUsername: any) {
    if (this.selectedUsername != "" && this.selectedDate != "") {
      this.selectedDate = "";
    }
    if (
      this.selectedInterval === "weekly" ||
      this.selectedInterval === "daily" ||
      this.selectedInterval === "monthly"
    ) {
      this.selectedUsername = selectedUsername;
      this.filterUserData();

      if (selectedUsername === "all") {
        this.selectedDate = "";
        this.getData();
        if (selectedUsername == "all") {
          this.updateSelectedUserData(selectedUsername);
        }
      } else {
        this.updateSelectedUserData(selectedUsername);
      }
    } else {
      this.cdr.detectChanges();
    }
  }

  updateSelectedUserData(selectedUsername: any) {
    this.selectedUsername = selectedUsername;
    this.cdr.detectChanges();
    this.onChangeByIntervalSelection(this.selectedInterval);
    this.selectedUserScreenData = this.getScreenDataForSelectedUserAndDate();
    this.extractUserEventDates();
    this.selectedUserScreenData = null;

    const userData = this.apiData.find(
      (data) => data.userInfo[0].userName === this.selectedUsername
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

  filterUserData() {
    this.filteredData = this.apiData.filter((entry) => {
      return (
        entry.userInfo[0].userName === this.selectedUsername &&
        entry.userEvents.some((event) => {
          return event.date >= this.fromDate && event.date <= this.toDate;
        })
      );
    });

    this.cdr.detectChanges();
  }

  getClientNames(): string[] {
    const clientNamesSet = new Set<string>();

    if (Array.isArray(this.apiData)) {
      this.apiData.forEach((data) => {
        data.userInfo.forEach((userInfo) => {
          clientNamesSet.add(userInfo.clientName);
        });
      });
    }

    const clientNames = Array.from(clientNamesSet);

    if (clientNames.length > 0 && this.isAllClients) {
      this.selectedIntervalOption = clientNames[0];
      this.onClientChange(clientNames[0]);
      this.isAllClients = false;
    }

    return clientNames;
  }

  populateClientNames() {
    this.clientNames = this.getClientNames();
  }

  onClientChange(newValue: string) {
    this.userList = [];
    const clientName = newValue;
    if (this.selectedClient !== "") {
      this.selectedDate = "";
      if (this.selectedUsername !== "all") {
        this.selectedUsername = "all";
      } else {
        this.selectedInterval = "weekly";
      }
    }

    const filteredData = this.apiData.filter(
      (e) => e.userInfo[0].clientName === newValue
    );

    this.userList = filteredData.map((e, i) => {
      const userName = e.userInfo[0].userName;
      return { id: i, value: userName };
    });

    if (
      this.selectedInterval !== "monthly" &&
      this.selectedInterval !== "weekly"
    ) {
      this.selectedInterval = "weekly";
      this.updateHighChart();
    } else {
      this.getAndDisplayEventsForClient(clientName, this.selectedInterval);
    }

    if (this.selectedInterval === "monthly" && newValue) {
      this.getAndDisplayEventsForClient(newValue, this.selectedInterval);
    }

    this.selectedClient = newValue;
  }

  getAndDisplayEventsForMonthly(clientName) {
    const filteredUserEvents = this.filterUserEventsForCurrentMonth(clientName);
    const dates = this.getCurrentMonthDates();

    const seriesData = filteredUserEvents.map((user) => {
      const dataPoints = dates.map((date) => user.dateWiseCounts[date] || 0);
      return {
        name: user.userName,
        type: "line",
        data: dataPoints,
      };
    });

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
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const dates = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      dates.push(`${year}-${month + 1}-${i.toString().padStart(2, "0")}`);
    }
    return dates;
  }

  filterUserEventsForCurrentWeek(clientName) {
    const currentWeekStartDate = this.getCurrentWeekStartDate();

    const filteredData = [];

    this.apiData.forEach((user) => {
      const userInfo = user.userInfo.find(
        (info) => info.clientName === clientName
      );
      if (!userInfo) return;

      const userEvents = user.userEvents;
      const dateWiseCounts = {};

      currentWeekStartDate.forEach((date) => {
        dateWiseCounts[date] = 0;
      });

      userEvents.forEach((event) => {
        const eventDate = new Date(event.date).toISOString().slice(0, 10);
        if (dateWiseCounts.hasOwnProperty(eventDate)) {
          dateWiseCounts[eventDate] += event.totalCount;
        }
      });

      filteredData.push({
        userName: userInfo.userName.trim(),
        dateWiseCounts: dateWiseCounts,
      });
    });

    return filteredData;
  }

  filterUserEventsForCurrentMonth(clientName) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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

          const dateWiseCounts = {};

          dates.forEach((date) => {
            dateWiseCounts[date] = 0;
          });

          userEvents.forEach((event) => {
            const eventDate = new Date(event.date).toISOString().slice(0, 10);

            if (dateWiseCounts.hasOwnProperty(eventDate)) {
              dateWiseCounts[eventDate] += event.totalCount;
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
    let seriesData = [];
    let dates = [];
    let filteredUserEvents = [];

    if (interval === "daily") {
      const {
        dates: currentDate,
        usernames,
        totalCounts: userTotalCounts,
      } = this.getDateAndTotalCountForUsernames(clientName);
      dates = [currentDate];
      seriesData = usernames.map((username, index) => ({
        name: username,
        type: "line",
        data: [userTotalCounts[index]],
      }));
    } else if (interval === "weekly") {
      filteredUserEvents = this.filterUserEventsForCurrentWeek(clientName);
      dates = this.getCurrentWeekStartDate();
    } else if (interval === "monthly") {
      filteredUserEvents = this.filterUserEventsForCurrentMonth(clientName);
      dates = this.getCurrentMonthDates();
    } else {
      console.error("Invalid interval provided.");
      return;
    }

    if (interval === "weekly" || interval === "monthly") {
      filteredUserEvents.forEach((user) => {
        const dataPoints = dates.map((date) => user.dateWiseCounts[date] || 0);
        seriesData.push({
          name: user.userName,
          type: "line",
          data: dataPoints,
        });
      });
    }

    this.renderChart(seriesData, dates);
  }

  getDateAndTotalCountForUsernames(clientName) {
    const currentDate = new Date().toISOString().split("T")[0];
    const usernames = [];
    const totalCounts = [];

    this.apiData.forEach((entry) => {
      if (
        entry.userInfo &&
        entry.userInfo.length > 0 &&
        entry.userInfo[0].clientName === clientName
      ) {
        const username = entry.userInfo[0].userName;

        if (!usernames.includes(username)) {
          const totalCount = this.getTotalCountForUser(username, currentDate);
          usernames.push(username);
          totalCounts.push(totalCount);
        }
      }
    });

    return { dates: currentDate, usernames, totalCounts };
  }

  getTotalCountForUser(username, currentDate) {
    let totalCount = 0;

    this.apiData.forEach((entry) => {
      if (
        entry.userInfo &&
        entry.userInfo.length > 0 &&
        entry.userInfo[0].userName === username &&
        entry.userInfo[0].clientName === this.selectedClient
      ) {
        entry.userEvents.forEach((event) => {
          if (event.date === currentDate) {
            totalCount += event.totalCount;
          }
        });
      }
    });

    return totalCount;
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
