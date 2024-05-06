import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { DataService } from '../../../../shared/services/data.service';
import { Country } from '../../../../shared/interfaces/interfaces';

@Component({
  selector: 'app-dashboard-commands',
  templateUrl: './dashboard-commands.component.html',
  styleUrl: './dashboard-commands.component.css',
})
export class DashboardCommandsComponent {
  countries!: Country[];
  selectedCountries!: Country[];
  clientNames = [];

  visible: boolean = false;
  questionDialogVisible: boolean = false;
  offerDialogVisible: boolean = false;
  showMinusIcon: boolean[] = [false];
  loading: boolean = false;

  defaultSelectedClient: string = '';
  value!: string;

  formGroup!: FormGroup;

  offerTextInputs: { value: string }[] = [{ value: '' }];
  questionTextInputs: { value: string }[] = [{ value: '' }];

  constructor(public dataService: DataService) {
    this.countries = [
      { name: '20 % off on mobile', code: 'AU' },
      { name: '10  off on laptop', code: 'BR' },
    ];
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      text: new FormControl<string | null>(null),
    });

    this.dataService.getAllClients().subscribe((clients: any) => {
      this.clientNames = clients;
      this.clientNames.splice(-2);
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
      }
    });
  }

  showDialog() {
    this.offerDialogVisible = true;
  }
  load() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
  showDialogQuestion() {
    this.questionDialogVisible = true;
  }
  hideDialog() {
    this.offerDialogVisible = false;
  }
  hideDialogQuestion() {
    this.questionDialogVisible = false;
  }
  addNewTextArea() {
    this.offerTextInputs.push({ value: '' });
    this.showMinusIcon.push(true);
  }

  addNewTextAreaforQuestion() {
    this.questionTextInputs.push({ value: '' });
    this.showMinusIcon.push(true);
  }

  submitAddOffer() {
    const valuesArray = this.offerTextInputs.map((input) => input.value);
    const offers = valuesArray.map((value) => ({ offer: value }));
    console.log(offers);
  }

  submitAddQuestion() {
    const valuesArray = this.questionTextInputs.map((input) => input.value);
    console.log(valuesArray);
  }

  removeTextArea(index: number) {
    this.offerTextInputs.splice(index, 1);
    this.showMinusIcon.splice(index, 1);
  }

  removeTextAreaQuestion(index: number) {
    this.questionTextInputs.splice(index, 1);
    this.showMinusIcon.splice(index, 1);
  }
}
