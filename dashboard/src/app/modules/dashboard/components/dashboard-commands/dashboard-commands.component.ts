import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DataService } from '../../../shared/services/dashboard.service';
import { DashboardCommandService } from '../../../shared/services/dashboardcommand.service';
import {
  Country,
  Offer,
  Question,
  Animation,
} from '../../../shared/interfaces/interfaces';

@Component({
  selector: 'app-dashboard-commands',
  templateUrl: './dashboard-commands.component.html',
  styleUrl: './dashboard-commands.component.css',
})
export class DashboardCommandsComponent {
  countries!: Country[];
  selectedCountries!: Country[];
  clientNames = [];
  selectedOffers: Offer[] = [];
  selectedQuestion!: Question;
  animations: Animation[] = [];
  offers: Offer[] = [];
  questions: Question[] = [];

  visible: boolean = false;
  questionDialogVisible: boolean = false;
  animationDialogVisible: boolean = false;
  showTextarea: boolean[] = [true];
  isTextareaActive: boolean = false;
  offerDialogVisible: boolean = false;
  showMinusIcon: boolean[] = [false];
  loading: boolean = false;

  defaultSelectedClient: string = '';
  selectedAnimation: string = '';
  value!: string;

  formGroup!: FormGroup;

  offerTextInputs: { value: string }[] = [{ value: '' }];
  questionTextInputs: { value: string }[] = [{ value: '' }];
  linkTextInputs: { value: string }[] = [{ value: '' }];
  animationTextInputs: { value: string }[] = [{ value: '' }];

  constructor(
    public dataService: DataService,
    public dashboardCommandService: DashboardCommandService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      text: new FormControl<string | null>(null),
    });

    this.dataService.getAllClients().subscribe((clients: any) => {
      this.clientNames = clients;
      this.clientNames.splice(-2);
      if (this.clientNames && this.clientNames.length > 0) {
        this.defaultSelectedClient = this.clientNames[0];
        this.fetchDataForClient(this.defaultSelectedClient);
      }
    });
  }

  fetchDataForClient(clientName: string) {
    this.dashboardCommandService
      .getOffersForClient(clientName)
      .subscribe((offers: Offer[]) => {
        this.offers = offers;

        // Fetch selected offers for the specific client from your API
        this.dashboardCommandService
          .getSelectedOffersForClient(clientName)
          .subscribe((selectedOffers: Offer[]) => {
            // Loop through each offer
            this.offers.forEach((offer) => {
              // Check if the offer is selected for the client
              const isSelected = selectedOffers.some(
                (selectedOffer) => selectedOffer.offer === offer.offer,
              );
              // If selected, mark the offer as selected
              if (isSelected) {
                this.selectedOffers.push(offer);
              }
            });
          });
      });

    this.dashboardCommandService
      .getQuestionForClient(clientName)
      .subscribe((questions: Question[]) => {
        this.questions = questions;
      });

    this.dashboardCommandService
      .getAnimationForClient(clientName)
      .subscribe((animations: Animation[]) => {
        this.animations = animations;
      });
  }

  closeTextarea(index: number) {
    this.showTextarea[index] = false;
  }

  clientChange(event: any): void {
    this.selectedOffers = [];
    this.selectedAnimation = '';
    this.fetchDataForClient(this.defaultSelectedClient);
  }

  appendNewText(type: string): void {
    switch (type) {
      case 'offer':
        this.offerTextInputs.push({ value: '' });
        this.linkTextInputs.push({ value: '' });
        this.showMinusIcon.push(true);
        this.showTextarea.push(true);
        break;
      case 'question':
        this.questionTextInputs.push({ value: '' });
        this.showMinusIcon.push(true);
        break;
      case 'animation':
        this.animationTextInputs.push({ value: '' });
        this.showMinusIcon.push(true);
        break;
      default:
        break;
    }
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

  addOffer() {
    const newOffers = this.offerTextInputs.map((input, i) => ({
      offer: input.value,
      link: this.linkTextInputs[i].value,
    }));

    this.dashboardCommandService
      .postOfferData(this.defaultSelectedClient, newOffers)
      .subscribe(
        (response) => {
          const updatedOffers = [...this.offers, ...newOffers];
          this.offers = updatedOffers;

          this.offerTextInputs.forEach((input) => (input.value = ''));
          this.linkTextInputs.forEach((input) => (input.value = ''));

          this.offerDialogVisible = false;
        },
        (error) => {
          console.error('Error occurred while sending offer data:', error);
        },
      );
  }

  toggleDialog(dialog: string): void {
    switch (dialog) {
      case 'offer':
        this.offerDialogVisible = !this.offerDialogVisible;
        if (!this.offerDialogVisible) {
          this.offerTextInputs = [{ value: '' }];
          this.showMinusIcon = [false];
        }
        break;
      case 'question':
        this.questionDialogVisible = !this.questionDialogVisible;
        if (!this.questionDialogVisible) {
          this.questionTextInputs = [{ value: '' }];
          this.showMinusIcon = [false];
        }
        break;
      case 'animation':
        this.animationDialogVisible = !this.animationDialogVisible;
        if (!this.animationDialogVisible) {
          this.animationTextInputs = [{ value: '' }];
          this.showMinusIcon = [false];
        }
        break;
      case 'cancel':
        this.offerDialogVisible = false;
        this.questionDialogVisible = false;
        this.animationDialogVisible = false;
        this.offerTextInputs = [{ value: '' }];
        this.questionTextInputs = [{ value: '' }];
        this.animationTextInputs = [{ value: '' }];
        this.showMinusIcon = [false];
        break;
      default:
        break;
    }
  }

  submitData() {
    const data = {
      questions: this.selectedQuestion
        ? [{ question: this.selectedQuestion.question }]
        : [],
      offers: Array.isArray(this.selectedOffers)
        ? this.selectedOffers.map((offer) => ({
            offer: offer.offer,
            link: offer.link,
          }))
        : [],
      animations: [this.selectedAnimation],
    };

    this.http
      .post(
        `https://webanalyticals.onrender.com/chatBot/submitData/${this.defaultSelectedClient}`,
        data,
      )
      .subscribe(
        (response) => {
          const message =
            (response as { message: string }).message || 'Success';
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: message,
            width: '15rem',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              popup: 'my-swal',
            },
          });
        },
        (error) => {
          console.error('Error occurred while submitting data:', error);
        },
      );
  }

  resetInputs() {
    this.selectedOffers = [];
    this.selectedQuestion = undefined!;
    this.selectedAnimation = '';
  }

  onTextareaLinkInput(event: any) {
    this.isTextareaActive = event.target.value.trim() !== '';
  }

  sendAnimationQuestion(type: string): void {
    let valuesArray: string[] = [];
    let postData: any[] = [];

    switch (type) {
      case 'animation':
        valuesArray = this.animationTextInputs.map((input) => input.value);
        postData = valuesArray.map((value) => ({ animation: value }));
        break;

      case 'question':
        valuesArray = this.questionTextInputs.map((input) => input.value);
        postData = valuesArray.map((value) => ({ question: value }));
        break;

      default:
        return;
    }

    const postMethod =
      type === 'animation' ? 'postAnimationData' : 'postQuestionData';

    this.dashboardCommandService[postMethod](
      this.defaultSelectedClient,
      postData,
    ).subscribe(
      (response: any) => {
        if (
          type === 'question' &&
          response.message === 'Questions Added Successfully'
        ) {
          this.fetchUpdatedQuestions();
        } else if (type === 'animation') {
          console.error('response success:', response);
          this.animations = [...this.animations, ...postData];
          this.animationTextInputs.forEach((input) => (input.value = ''));
          this.animationDialogVisible = false;
        } else {
          console.error('Unexpected response:', response);
        }

        if (type === 'question') {
          this.questionTextInputs.forEach((input) => (input.value = ''));
          this.questionDialogVisible = false;
        }
      },
      (error) => {
        console.error(`Error occurred while sending ${type} data:`, error);
      },
    );
  }

  fetchUpdatedQuestions() {
    this.dashboardCommandService
      .getQuestionForClient(this.defaultSelectedClient)
      .subscribe(
        (updatedQuestions: Question[]) => {
          this.questions = updatedQuestions;
        },
        (error) => {
          console.error(
            'Error occurred while fetching updated questions:',
            error,
          );
        },
      );
  }

  clearInput(index: number, type: string): void {
    switch (type) {
      case 'offer':
        this.offerTextInputs.splice(index, 1);
        this.linkTextInputs.splice(index, 1);
        this.showTextarea.splice(index, 1);
        break;
      case 'question':
        this.questionTextInputs.splice(index, 1);
        break;
      case 'animation':
        this.animationTextInputs.splice(index, 1);
        break;
      default:
        break;
    }
    this.showMinusIcon.splice(index, 1);
  }
}
