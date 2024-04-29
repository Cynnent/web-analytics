import { Routes } from '@angular/router';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';
import { HeaderComponent } from './modules/core/header/header.component';
import { AppComponent } from './app.component';
import { DashboardComponent } from './modules/dashboard/components/dashboard.component';
import { TableComponent } from './modules/shared/components/table/table.component';

export const routes: Routes = [ 
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'mostViewedPages',
    component: TableComponent,
  },
  {
    path: 'mostClickedActions',
    component: TableComponent,
  },
  {
    path: 'mostActiveUser',
    component: TableComponent,
  },
  {
    path: 'mostUsedCountries',
    component: TableComponent,
  },
  {
    path: 'mostUsedBrowsers',
    component: TableComponent,
  }
];
