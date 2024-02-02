import { Injectable } from '@angular/core';
// import { jsonData } from '../../../jsonData';
@Injectable()
export class PeriodsService {
  getYears() {
    return [
      '2010', '2011', '2012',
      '2013', '2014', '2015',
      '2016', '2017', '2018',
    ];
  }

  getMonths() {
    return [
      'Jan', 'Feb', 'Mar',
      'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec',
    ];
  }

  // getWeeks() {
  //   const allDates = jsonData.reduce((acc, item) => acc.concat(item.userEvents.map(event => event.date)), []);

  //   const sortedDates = allDates.sort((a, b) => {
  //       const dateA = new Date(a);
  //       const dateB = new Date(b);

  //       if (dateA.getMonth() !== dateB.getMonth()) {
  //           return dateA.getMonth() - dateB.getMonth();
  //       }

  //       return dateA.getDate() - dateB.getDate();
  //   });

  //   return sortedDates;
  // }
}
