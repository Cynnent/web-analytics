import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@NgModule({
  declarations: [],
  imports: [CommonModule, ButtonModule, InputSwitchModule, OverlayPanelModule],
  exports: [ButtonModule, InputSwitchModule, OverlayPanelModule],
})
export class SharedModule {}
