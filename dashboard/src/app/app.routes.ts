import { Routes } from '@angular/router';
import { SidebarComponent } from './modules/core/sidebar/sidebar.component';
import { HeaderComponent } from './modules/core/header/header.component';
import { AppComponent } from './app.component';

import { InsightsComponent } from './modules/insights/components/insights/insights.component';
import { widgetDetailsComponent } from './modules/dashboard/components/widget-details/widget-details.component.';
import { DashboardOverview } from './modules/dashboard/components/dashboard-overview/dashboard-overview.component';
import { GenerativeuiComponent } from './modules/generativeui/generativeui.component';
import { ShortlinkComponent } from './modules/shortlink/shortlink.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'app/dashboard',
    component: DashboardOverview,
  },
  {
    path: 'app/mostViewedPages',
    component: widgetDetailsComponent,
  },
  {
    path: 'app/mostClickedActions',
    component: widgetDetailsComponent,
  },
  {
    path: 'app/mostActiveUser',
    component: widgetDetailsComponent,
  },
  {
    path: 'app/mostUsedCountries',
    component: widgetDetailsComponent,
  },
  {
    path: 'app/mostUsedBrowsers',
    component: widgetDetailsComponent,
  },
  {
    path: 'app/insights',
    component: InsightsComponent,
  },
  {
    path: 'app/addons',
    children: [
      {
        path: '',
        redirectTo: 'genui',
        pathMatch: 'full',
      },
      {
        path: 'genui',
        component: GenerativeuiComponent,
      },
      {
        path: 'shortlink',
        component: ShortlinkComponent
      }
    ],
  },
];