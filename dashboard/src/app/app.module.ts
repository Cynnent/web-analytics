import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NbThemeModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { NbCardModule, NbSelectModule, NbOptionModule } from '@nebular/theme';

// modules
import { RouterModule } from '@angular/router';

//services
import { DataService } from './modules/shared/services/dashboard.service';
import { DashboardCommandService } from './modules/shared/services/dashboardcommand.service';

// Components
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { HeaderComponent } from './modules/core/header/header.component';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';

// import {DashboardOverviewComponent} from './modules/dashboard/overview/dashboard-overview'
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { HighchartsChartModule } from 'highcharts-angular';
import { InsightComponent } from './modules/dashboard/components/dashboard-insight/dashboard-insight.component';
import { DashboardOverviewComponent } from './modules/dashboard/components/dashboard-overview/dashboard-overview.component';
import { DashboardCommandsComponent } from './modules/dashboard/components/dashboard-commands/dashboard-commands.component';
import { TableComponent } from './modules/dashboard/components/widget-details/widget-detail';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardOverviewComponent,
    DashboardCommandsComponent,
    InsightComponent,
    TableComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    CalendarModule,
    NgxSpinnerModule,
    CardModule,
    NbCardModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    DialogModule,
    NbSelectModule,
    NbOptionModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    NbThemeModule,
    RouterModule.forRoot(routes),
  ],
  providers: [DataService, DashboardCommandService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  bootstrap: [AppComponent],
})
export class AppModule {}
