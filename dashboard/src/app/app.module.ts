import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NbThemeModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NbCardModule, NbSelectModule, NbOptionModule } from '@nebular/theme';

// modules
import { RouterModule } from '@angular/router';

//services
import { DataService } from './modules/dashboard/services/data.service';

// Components
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { HeaderComponent } from './modules/core/header/header.component';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';
import { DashboardComponent } from './modules/dashboard/components/dashboard.component';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent,
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
    NbSelectModule,
    NbOptionModule,
    DropdownModule,
    NbThemeModule,
    RouterModule.forRoot(routes),
  ],
  providers: [DataService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  bootstrap: [AppComponent],
})
export class AppModule {}
