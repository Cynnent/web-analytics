import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
  declarations: [],
  imports: [CommonModule, ButtonModule, InputSwitchModule],
  exports: [ButtonModule, InputSwitchModule],
})
export class SharedModule {}
