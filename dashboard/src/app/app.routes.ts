import { Routes } from '@angular/router';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';
import { HeaderComponent } from './modules/core/header/header.component';
import { AppComponent } from './app.component';

import { InsightComponent } from './modules/dashboard/components/insight/insight/dashboard-insight.component';
import { TableComponent } from './modules/dashboard/components/table/table.component';

export const routes: Routes = [ 
  {
    path: '',
    component: InsightComponent,
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
