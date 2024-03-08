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

  @ViewChild("ordersChart", { static: true }) ordersChart: OrdersChartComponent;
  @ViewChild("userSelect") userSelect: NbSelectComponent;
  @ViewChild("profitChart", { static: true }) profitChart: ProfitChartComponent;

  apiData: any[] = [];
  constructor(private cdr: ChangeDetectorRef, public dataService: DataService) {
    this.selectedUsername = "all";
  }

  loadSelectedTabData(tabName: string) {
    tabName === "dashboard"
      ? (this.tabToggle = false)
      : (this.tabToggle = true);

    if (tabName == "insights") {
      this.loadChartData();
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
    this.dataService.getDatesByUserId(userId).subscribe((dates) => {
      this.userEventDates = dates;
      this.selectedDate = dates[0].id;
      this.loadChartData();

      if (dates.length > 0) {
        this.selectedDate = dates[0].id;
        this.loadChartData();
      }

      this.cdr.detectChanges();
    });
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

  ngAfterViewInit() {
    this.selectedUsername = "all";
    this.loadChartData();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
