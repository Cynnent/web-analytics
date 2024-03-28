import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';

import { CoreComponent } from "./core.component";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

@NgModule({
  declarations: [CoreComponent, HeaderComponent, SidebarComponent],
  imports: [CommonModule],
  providers: [],
})

export class CoreModule {}