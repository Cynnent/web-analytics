import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
interface UserResponse {
  _id: string;
  date: string;
  screens: { [key: string]: { [key: string]: number } };
  totalCount: number;
}
@Injectable({
  providedIn: "root",
})
export class DataService {
  public userDropdownData: { id: string; value: string }[] = [];
  public userEventDates: { id: string; value: string }[] = [];
  constructor(private http: HttpClient) {}

  getAllClients(): Observable<string[]> {
    return this.http
      .get<any[]>("https://webanalyticals.onrender.com/getAllClients")
      .pipe(map((response) => response.map((client) => client.clientName)));
  }

  getUsersByClientName(selectedClient: string): Observable<{ _id: string }[]> {
    return this.http
      .get<UserResponse[]>(
        `https://webanalyticals.onrender.com/getUsersByClientName/${selectedClient}`
      )
      .pipe(map((response) => response.map((user) => ({ _id: user._id }))));
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

  getUserEvents(
    selectedUsername: string,
    selectedDate: string
  ): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `https://webanalyticals.onrender.com/getUserEvents/${selectedUsername}/${selectedDate}`
    );
  }
}
