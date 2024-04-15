import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap, catchError } from 'rxjs/operators';
interface UserResponse {
  _id: string;
  date: string;
  screens: { [key: string]: { [key: string]: number } };
  totalCount: number;
}

interface MapData {
  _id: string;
  clientName: string;
  latitude: string;
  longitude: string;
  country: string;
  cityName?: string;
  __v: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public mostVisitedPages: any[] = [];
  public mostClickedAction: any[] = [];
  public userDropdownData: { id: string; value: string }[] = [];
  public userEventDates: { id: string; value: string }[] = [];
  private apiUrl = 'https://webanalyticals.onrender.com/';

  constructor(private http: HttpClient) {}

  widgetLink: string = '';

  setLink(link: string) {
    this.widgetLink = link;
  }

  getUsersData(selectedClient: string): Observable<any[]> {
    const endpoint = `https://webanalyticals.onrender.com/getAllDeviceData/${selectedClient}`;
    return this.http.get<any[]>(endpoint);
  }

  getAllClients(): Observable<string[]> {
    return this.http
      .get<any[]>('https://webanalyticals.onrender.com/getAllClients')
      .pipe(map((response) => response.map((client) => client.clientName)));
  }

  getUsersByClientName(selectedClient: string): Observable<{ _id: string }[]> {
    return this.http
      .get<UserResponse[]>(
        `https://webanalyticals.onrender.com/getUsersByClientName/${selectedClient}`
      )
      .pipe(map((response) => response.map((user) => ({ _id: user._id }))));
  }

  getMonthlyData(selectedUserId: string): Observable<any[]> {
    const endpoint = `${this.apiUrl}getMonthlyData/${selectedUserId}`;
    return this.http.get<any[]>(endpoint).pipe(
      catchError((error) => {
        console.error('Error in getMonthlyData:', error);
        throw error;
      })
    );
  }
  getAccesedCountryCount(selectedClient: string): Observable<MapData[]> {
    const endpoint = `https://webanalyticals.onrender.com/accesedCountCountry/${selectedClient}`;
    console.log('API Endpoint:', endpoint);
    return this.http.get<MapData[]>(endpoint).pipe(
      catchError((error) => {
        console.error('Error in getAccesedCountryCount:', error);
        throw error;
      })
    );
  }

  getMostUsedBrowsers(selectedClient: string): Observable<any[]> {
    const endpoint = `https://webanalyticals.onrender.com/mostUsedBrowsers/${selectedClient}`;
    return this.http.get<any[]>(endpoint).pipe(
      catchError((error) => {
        console.error('Error in getMostUsedBrowsers:', error);
        throw error;
      })
    );
  }

  getWeeklyDataForUser(selectedUserId: string): Observable<any[]> {
    const endpoint = `${this.apiUrl}getWeeklyData/${selectedUserId}`;
    return this.http.get<any[]>(endpoint).pipe(
      catchError((error) => {
        console.error('Error in getWeeklyDataForUser:', error);
        throw error;
      })
    );
  }

  getDatesByUserId(
    userId: string
  ): Observable<{ id: string; value: string }[]> {
    return this.http
      .get<UserResponse[]>(
        `https://webanalyticals.onrender.com/getDates/${userId}`
      )
      .pipe(
        map((response) =>
          response.map((item) => ({ id: item.date, value: item.date }))
        )
      );
  }

  getlocationData(selectedClient: string): Observable<MapData[]> {
    const endpoint = `https://webanalyticals.onrender.com/getAllMapData/${selectedClient}`;
    console.log('API Endpoint:', endpoint);
    return this.http.get<MapData[]>(endpoint).pipe(
      catchError((error) => {
        console.error('Error in getlocationData:', error);
        throw error;
      })
    );
  }

  getUserEvents(
    selectedUsername: string,
    selectedDateForId: string
  ): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `https://webanalyticals.onrender.com/getUserEvents/${selectedUsername}/${selectedDateForId}`
    );
  }

  getMostVisitedPages(clientName: string): Observable<any[]> {
    const endpoint = `${this.apiUrl}mostViewedPages/${clientName}`;
    return this.http.get<any[]>(endpoint).pipe(
      map((data) => {
        this.mostVisitedPages = data;
        return data;
      })
    );
  }

  getMostClickedActions(clientName: string): Observable<any[]> {
    const endpoint = `${this.apiUrl}mostClickedActions/${clientName}`;
    return this.http.get<any[]>(endpoint).pipe(
      map((data) => {
        this.mostClickedAction = data;
        return data;
      })
    );
  }

  getTableData(): Observable<any> {
    return this.http.get(
      `https://webanalyticals.onrender.com/${this.widgetLink}/{selectedClient}`
    );
  }
}
