import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { InsightsComponent } from './components/insights/insights.component';

@NgModule({
  declarations: [InsightsComponent],
  imports: [CommonModule, SharedModule],
})
export class InsightsModule {}
