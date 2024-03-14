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
  public clientNames: string[] = [];
  public selectedUsername: string | undefined;
  public tabToggle: boolean = false;
  alive: boolean = true;
  selectedClient: string = "all";
  selectedDate: string = "";
  totalCount: number;
  userEventDates: { id: string; value: string }[] = [];
  userDropdownData: { id: string; value: string }[] = [];
  defaultSelectedClient: string;
  public screensList=[];
  deviceCounts: { deviceType: string, count: number }[] = [];
  totalDeviceCount: number = 0;
  screenData: { [key: string]: { [key: string]: number } } = {};
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
  constructor(private cdr: ChangeDetectorRef, public dataService: DataService) {
    this.selectedUsername = "all";
    this.getDeviceData();
  }

  loadSelectedTabData(tabName: string) {
    tabName === "dashboard"
      ? (this.tabToggle = false)
      : (this.tabToggle = true);

    if (tabName == "insights") {
      this.loadChartData();
    }else if(tabName == "dashboard"){
      this.getDeviceData()
    }
  }

  
  ngOnInit(): void {
    this.dataService.getAllClients().subscribe((clients) => {
      this.clientNames = clients;
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        this.onClientChange(this.clientNames[0]);
      }
    });
  }

  getDeviceData() {
    this.dataService.getUsersData().subscribe((data) => {
      const deviceCounts: { [key: string]: number } = data.reduce(
        (counts, entry) => {
          if (entry.DeviceName && entry.DeviceName) {
            counts[entry.DeviceName] = (counts[entry.DeviceName] || 0) + 1;
          } else {
            console.warn("Invalid entry:", entry);
          }
          return counts;
        },
        {}
      );

      const deviceData = Object.entries(deviceCounts).map(
        ([DeviceName, count]: [string, number]) => ({
          name: DeviceName,
          y: count,
        })
      );

      this.totalDeviceCount = Object.values(deviceCounts).reduce(
        (total, count) => total + count,
        0
      );

      Highcharts.chart("pieChartContainer", {
        chart: {
          type: "pie",
        },
        title: {
          text: "Active User by Device",
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.y}</b>",
        },
        plotOptions: {
          pie: {
            innerSize: "80%",
            depth: 10,
          },
        },
        credits: {
          enabled: false
      },
      colors: ['#052288', '#FFD500', '#BBC1D2'],
        series: [
          {
            type: "pie",
            name: "Count",
            data: deviceData.map((item) => [item.name, item.y]),
          },
        ],
      });

      document.getElementById("total-count").innerText =
        "Total Device Count: " + this.totalDeviceCount;
    });
  }
 

  
 

  onClientChange(selectedClient): void {
    this.dataService.getUsersByClientName(selectedClient).subscribe((users) => {
      this.dataService.userDropdownData = users.map((user) => ({
        id: user._id,
        value: user._id,
      }));

      const defaultUser = this.dataService.userDropdownData[0];
      this.selectedUsername = defaultUser.id;
      this.loadDatesForUser(defaultUser.id);
      this.selectedDate = this.userEventDates[0]?.id;
      this.loadChartData();
      this.cdr.detectChanges();
    });
  }
  onUserChange(): void {
    this.loadDatesForUser(this.selectedUsername);
    this.selectedDate = this.userEventDates[0]?.id;
    this.loadChartData();
  }

  loadDatesForUser(userId: string): void {
    // this.loadScreenContent();
    this.dataService.getDatesByUserId(userId).subscribe((dates) => {
      this.userEventDates = dates;
      this.selectedDate = dates[0].id;
      this.loadChartData();

      if (dates.length > 0) {
        this.selectedDate = dates[0].id;
        this.loadChartData();
      }
      this.loadScreenContent();

      this.cdr.detectChanges();
    });

    // this.loadScreenContent();
  }

  loadChartData(): void {
    if (this.selectedUsername && this.selectedDate) {
      this.dataService
        .getUserEvents(this.selectedUsername, this.selectedDate)
        .subscribe(
          (userData) => {
            this.totalCount = userData.totalCount;
            const seriesData = [
              { name: "Total Count", data: [userData.totalCount] },
            ];
            this.renderChart(seriesData, [userData.date]);
          },
          (error) => {
            console.error("Error fetching user events", error);
          }
        );
    } else {
      console.log(
        "Both selectedUsername and selectedDate are required to load the chart."
      );
    }
  }

  renderChart(seriesData, dates): void {
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

  
  loadScreenContent(): void {
    if (this.selectedUsername && this.selectedDate) {
      console.log("Calling getUserEvents with:", this.selectedUsername, this.selectedDate);
      this.dataService.getUserEvents(this.selectedUsername, this.selectedDate)
        .subscribe(
          (userData) => {
            console.log("userData received:", userData);
            this.screensList = [];
            for (const [pageName, actions] of Object.entries(userData.screens)) {
              let objscreen = { pageName: pageName, actions: [] };
              for (const [actionKey, actionValue] of Object.entries(actions)) {
                let action = { key: actionKey, value: actionValue };
                objscreen.actions.push(action);
              }
              this.screensList.push(objscreen);
            }
          },
          (error) => {
            console.error("Error fetching user events", error);
          },
          () => {
            console.log("Subscription completed"); 
          }
        );
    } else {
      console.log(
        "Both selectedUsername and selectedDate are required to load the content inside the screens."
      );
    }
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

  ngAfterViewInit() {
    this.selectedUsername = "all";
    this.loadChartData();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
