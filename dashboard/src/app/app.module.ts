import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';


// modules
import { RouterModule } from '@angular/router';

// Components
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { HeaderComponent } from './modules/core/header/header.component';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';
import { DashboardComponent } from './modules/dashboard/components/dashboard.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [AppComponent, HeaderComponent, SidebarComponent, DashboardComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    HttpClientModule,
    ToastrModule,
  ToastrModule.forRoot(),
    RouterModule.forRoot(routes),
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  bootstrap: [AppComponent],
})
export class AppModule {}