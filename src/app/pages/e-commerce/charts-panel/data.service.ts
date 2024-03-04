import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataService {
  private apiData: any[] = [];

  constructor(private http: HttpClient) {
    this.getAllData().subscribe((data) => {
      this.apiData = data;
    });
  }

  getAllData(): Observable<any[]> {
    return this.http
      .get<any[]>("https://webanalyticals.onrender.com/getAllData")
      .pipe(
        map((data) => {
          this.apiData = data;
          return data;
        })
      );
  }

  getAllUsernames(): Observable<string[]> {
    return this.http
      .get<any[]>("https://webanalyticals.onrender.com/getAllData")
      .pipe(
        map((data) => {
          return data.map((item) => item.userInfo[0].userName);
        })
      );
  }

  getDataForUser(): Observable<any> {
    return this.http.get<any>("https://webanalyticals.onrender.com/getAllData");
  }

  getAllUsernamesAndDates(): Observable<
    { username: string; dates: string[] }[]
  > {
    return this.getAllData().pipe(
      map((data) => {
        return data.map((entry) => ({
          username: entry.userInfo[0].userName,
          dates: entry.userInfo.map((user) => user.dates),
        }));
      })
    );
  }

  getTotalCountForDate(selectedDate: string): number {
    let totalCount = 0;

    this.apiData.forEach((entry) => {
      entry.userEvents.forEach((event) => {
        if (event.date === selectedDate) {
          totalCount += event.totalCount;
        }
      });
    });

    return totalCount;
  }

  getClientNames(): string[] {
    return Array.from(
      new Set(this.apiData.map((data) => data.userInfo[0].clientName))
    );
  }
}
