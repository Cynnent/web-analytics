import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Offer, Question, Animation } from './../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class DashboardCommandService {
  constructor(private http: HttpClient) {}

  getOffersForClient(clientName: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(
      `https://webanalyticals.onrender.com/chatBot/getOffers/${clientName}`
    );
  }

  getQuestionForClient(clientName: string): Observable<Question[]> {
    return this.http.get<Question[]>(
      `https://webanalyticals.onrender.com/chatBot/GetQuestions/${clientName}`
    );
  }

  getAnimationForClient(clientName: string): Observable<Animation[]> {
    return this.http.get<Animation[]>(
      `https://webanalyticals.onrender.com/chatBot/getAnimations/${clientName}`
    );
  }

  postOfferData(clientName: string, offers: any[]): Observable<any> {
    return this.http.post(
      `https://webanalyticals.onrender.com/chatBot/offers/${clientName}`,
      offers
    );
  }

  postQuestionData(
    clientName: string,
    questions: { question: string }[]
  ): Observable<Question[]> {
    return this.http.post<any>(
      `https://webanalyticals.onrender.com/chatBot/questions/${clientName}`,
      questions
    );
  }

  postAnimationData(clientName: string, animations: any[]): Observable<any> {
    return this.http.post(
      `https://webanalyticals.onrender.com/chatBot/animations/${clientName}`,
      animations
    );
  }

  getSelectedOffersForClient(clientName: string): Observable<Offer[]> {
    // Construct the URL to fetch submitted data for the specified client
    const url = `https://webanalyticals.onrender.com/chatBot/getSubmittedData/${clientName}`;
    // Make an HTTP GET request to fetch the submitted data for the client
    return this.http.get<any>(url).pipe(
      // Extract the offers from the response
      map((response: any) => response.offers)
    );
  }
}
