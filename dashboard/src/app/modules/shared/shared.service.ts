import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedClientService {
  private selectedClientSubject = new BehaviorSubject<string>('');
  selectedClient$ = this.selectedClientSubject.asObservable();

  setSelectedClient(defaultSelectedClient: string) {
    this.selectedClientSubject.next(defaultSelectedClient);
  }

  getSelectedClient(): string {
    return this.selectedClientSubject.value;
  }
}
