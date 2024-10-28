import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { userResponse } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Properties to store data fetched from the server
  public mostClickedAction: { id: string; value: string }[] = [];
  public userDropdownData: { id: string; value: string }[] = [];
  public userEventDates: { id: string; value: string }[] = [];
  public selectedClient: string = 'web_analytics_gp';
  static widgetLink: string;
  static getTableData: any;

  private socket: Socket; // Socket.io client instance
  private apiUrl = 'http://localhost:5000'; // Base URL for API endpoints
  private baseURL = 'https://web-analytics.onrender.com';
  widgetLink: string = '';

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Constructor initializes HTTP client and sets up socket connection
   * @param http - Angular's HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl);
    this.setupSocketListeners();
  }

  generateShortLink(longUrl: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/createUrl`, { longUrl });
  }

  /**
   * Emits the selected client name to the server via socket
   * @param clientName - Name of the client to emit
   */
  emitSelectedClient(clientName: string): void {
    this.selectedClient = clientName;
    this.socket.emit('clientName', clientName);
  }

  /**
   * Emits the selected client name to the server via socket
   * @param clientName - Name of the client to emit
   */
  emitSelectedClientTable(clientName: string) {
    this.socket.emit('clientNameTable', clientName);
  }

  /**
   * Emits the active tab status to the server via socket
   * @param value - Boolean indicating the active tab status
   */
  emitActiveTab(value: boolean) {
    this.socket.emit('activeTab', value);
  }

  /**
   * Listens for 'ClientNamesOverview' events from the server and executes the callback
   * @param callback - Function to handle the incoming client names data
   */
  public onOverviewClientnames(callback: (data: any) => void): void {
    this.socket.on('ClientNamesOverview', callback);
  }

  /**
   * Listens for 'DeviceData' events from the server and executes the callback
   * @param callback - Function to handle incoming device data
   */
  public onDataUpdate(callback: (data: any) => void): void {
    this.socket.on('DeviceData', callback);
  }

  /**
   * Listens for 'DeviceDataTable' events from the server and executes the callback
   * @param callback - Function to handle incoming device data for the table
   */
  public onDataUpdateTable(callback: (data: any) => void): void {
    this.socket.on('DeviceDataTable', callback);
  }

  /**
   * Listens for 'mostViewedPage' events from the server and executes the callback
   * @param callback - Function to handle incoming data for most viewed pages
   */
  public onMostViewedPage(callback: (data: any) => void): void {
    this.socket.on('mostViewedPage', callback);
  }

  /**
   * Listens for 'mostViewedPageTable' events from the server and executes the callback
   * @param callback - Function to handle incoming data for the most viewed pages table
   */
  public onMostViewedPageTable(callback: (data: any) => void): void {
    this.socket.on('mostViewedPageTable', callback);
  }

  /**
   * Listens for 'mostClicked' events from the server and executes the callback
   * @param callback - Function to handle incoming data for most clicked actions
   */
  public onMostClickedActions(callback: (data: any) => void): void {
    this.socket.on('mostClicked', callback);
  }

  /**
   * Listens for 'mostClickedTable' events from the server and executes the callback
   * @param callback - Function to handle incoming data for the most clicked actions table
   */
  public onMostClickedActionsTable(callback: (data: any) => void): void {
    this.socket.on('mostClickedTable', callback);
  }

  /**
   * Listens for 'MostUsedCountries' events from the server and executes the callback
   * @param callback - Function to handle incoming data for most used countries
   */
  public onMostUsedCountries(callback: (data: any) => void): void {
    this.socket.on('MostUsedCountries', callback);
  }

  /**
   * Listens for 'MostUsedCountriesTable' events from the server and executes the callback
   * @param callback - Function to handle incoming data for the most used countries table
   */
  public onMostUsedCountriesTable(callback: (data: any) => void): void {
    this.socket.on('MostUsedCountriesTable', callback);
  }

  /**
   * Listens for 'CountryCounts' events from the server and executes the callback
   * @param callback - Function to handle incoming country count data
   */
  public onCountryCounts(callback: (data: any) => void): void {
    this.socket.on('CountryCounts', callback);
  }

  /**
   * Listens for 'browserCounts' events from the server and executes the callback
   * @param callback - Function to handle incoming browser count data
   */
  public onBrowserCounts(callback: (data: any) => void): void {
    this.socket.on('browserCounts', callback);
  }

  /**
   * Listens for 'browserCountsTable' events from the server and executes the callback
   * @param callback - Function to handle incoming data for browser counts table
   */
  public onBrowserCountsTable(callback: (data: any) => void): void {
    this.socket.on('browserCountsTable', callback);
  }

  /**
   * Emits user events data for insights based on user ID and date
   * @param userId - ID of the user
   * @param date - Date for which to fetch user events
   */
  emitInsightsUserEvents(userId: string, date: string): void {
    const data = {
      userId: userId,
      date: date,
    };
    this.socket.emit('getUserEvents', data);
  }

  /**
   * Emits the selected client name for insights to the server via socket
   * @param clientName - Name of the client
   */
  emitInsightsSelectedClient(clientName: string): void {
    this.socket.emit('insightsClientName', clientName);
  }

  /**
   * Emits the selected client's monthly data for insights
   * @param clientName - Name of the client
   */
  emitInsightSelectedClientMonthly(clientName: string): void {
    this.socket.emit('insightsSelectedUserMonthly', clientName);
  }

  /**
   * Emits the selected username for insights to the server via socket
   * @param selectedUser - Name of the selected user
   */
  emitSelectedUsername(selectedUser: string): void {
    this.socket.emit('insightsSelectedUser', selectedUser);
  }

  /**
   * Listens for 'ClientNames' events from the server and executes the callback
   * @param callback - Function to handle incoming client names data
   */
  public onInsightsClientNames(callback: (data: any) => void): void {
    this.socket.on('ClientNamesInsights', callback);
  }

  /**
   * Listens for 'InsightsUserId' events from the server and executes the callback
   * @param callback - Function to handle incoming user ID data
   */

  public onInsightsUserId(callback: (data: any) => void): void {
    this.socket.on('InsightsUserId', callback);
  }

  /**
   * Listens for 'weeklyData' events from the server and executes the callback
   * @param callback - Function to handle incoming weekly data
   */
  public onInsightWeeklyData(callback: (data: any) => void): void {
    this.socket.on('weeklyData', callback);
  }

  /**
   * Listens for 'weeklyDataError' events from the server and executes the callback
   * @param callback - Function to handle incoming errors for weekly data
   */
  public onInsightWeeklyDataError(callback: (data: any) => void): void {
    this.socket.once('weeklyDataError', callback);
  }

  /**
   * Listens for 'monthlyData' events from the server and executes the callback
   * @param callback - Function to handle incoming monthly data
   */
  public onInsightMonthlyData(callback: (data: any) => void): void {
    this.socket.on('monthlyData', callback);
  }

  /**
   * Listens for 'monthlyDataError' events from the server and executes the callback
   * @param callback - Function to handle incoming errors for monthly data
   */
  public onInsightMonthlyDataError(callback: (data: any) => void): void {
    this.socket.on('monthlyDataError', callback);
  }

  /**
   * Listens for 'userEventsError' events from the server and executes the callback
   * @param callback - Function to handle incoming errors for user events
   */
  public onInsightUserEventsError(callback: (data: any) => void): void {
    this.socket.on('userEventsError', callback);
  }

  /**
   * Listens for 'userEvents' events from the server and executes the callback
   * @param callback - Function to handle incoming user events data
   */
  public onInsightUserEvents(callback: (data: any) => void): void {
    this.socket.on('userEvents', callback);
  }

  setLink(link: string) {
    this.widgetLink = link;
  }

  //Fetch all clients from the DB
  getAllClients(): Observable<string[]> {
    return this.http
      .get<any[]>(`${this.baseURL}/getAllClients`)
      .pipe(map((response) => response.map((client) => client.clientName)));
  }

  /**
   * Fetch dates by user ID
   * @param userId - The user ID
   */
  getDatesByUserId(
    userId: string
  ): Observable<{ id: string; value: string }[]> {
    return this.http
      .get<userResponse[]>(`${this.baseURL}/getDates/${userId}`)
      .pipe(
        map((response) =>
          response.map((item) => ({ id: item.date, value: item.date }))
        )
      );
  }

  /**
   * Fetch table data for a specific client
   * @param clientName - The client name
   */
  getTableData(clientName: string): Observable<any> {
    return this.http.get(`${this.baseURL}/${this.widgetLink}/${clientName}`);
  }
}
