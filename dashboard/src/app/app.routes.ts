import { Routes } from '@angular/router';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';
import { HeaderComponent } from './modules/core/header/header.component';
import { AppComponent } from './app.component';
import { DashboardComponent } from './modules/dashboard/components/dashboard.component';

export const routes: Routes = [ 
  {
    path: '',
    component: DashboardComponent,
  },
];
