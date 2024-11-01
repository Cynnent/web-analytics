import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreComponent } from './core.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CoreComponent, HeaderComponent],
  imports: [CommonModule, SharedModule],
  providers: [],
})
export class CoreModule {}
