import { Injectable } from '@angular/core';
import { PeriodsService } from './periods.service';
import { OrdersChart, OrdersChartData } from '../data/orders-chart';
// import { jsonData } from '../../../jsonData';
@Injectable()
export class OrdersChartService extends OrdersChartData {

  private year = [
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
  ];

  private data = { };

  constructor(private period: PeriodsService) {
    super();
    this.data = {
      // week: this.getDataForWeekPeriod(),
      month: this.getDataForMonthPeriod(),
      year: this.getDataForYearPeriod(),
    };
  }

  // private getDataForWeekPeriod(): OrdersChart {

  //   const linesData: number[][] = [];

  //   jsonData.forEach((dataItem: any) => {
  //     const userEvents = dataItem.userEvents;
  //     if (userEvents) {
  //       const totalCountArray = userEvents.map((event: any) => event.totalCount);
  //       console.log(totalCountArray)
  //       linesData.push(totalCountArray);
  //       console.log(linesData)
  //     }
  //   });
  //   const weekLabels = this.period.getWeeks();

  //   return {
  //     chartLabel: this.getDataLabels(weekLabels.length, weekLabels),
  //     linesData: linesData,
  //   };
  // }

  // private getDataForWeekPeriod(): OrdersChart {
  //   const linesData: number[][] = [];
  //   const weekLabels = this.period.getWeeks(); 
  
  //   jsonData.forEach((dataItem: any) => {
  //     const userEvents = dataItem.userEvents;
  //     if (userEvents) {
  //       const totalCountArray: number[] = [];
  
  //       weekLabels.forEach((weekDate: string) => {
  //         const matchingEvent = userEvents.find((event: any) => event.date === weekDate);
  
  //         if (matchingEvent) {
  //           totalCountArray.push(matchingEvent.totalCount);
  //         } else {
  //           totalCountArray.push(0);
  //         }
  //       });
  
  //       linesData.push(totalCountArray);
  //     }
  //   });
  
  //   return {
  //     chartLabel: this.getDataLabels(weekLabels.length, weekLabels),
  //     linesData: linesData,
  //   };
  // }
  

  // private getDataForWeekPeriod(): OrdersChart {
  //   const linesData: number[][] = [];
  //   const weekLabels = this.period.getWeeks();
  
  //   jsonData.forEach((dataItem: any) => {
  //     const userEvents = dataItem.userEvents;
  //     if (userEvents) {
  //       const totalCountArray: number[] = [];
  
  //       weekLabels.forEach((weekDate: string) => {
  //         const matchingEvent = userEvents.find((event: any) => event.date === weekDate);
  
  //         if (matchingEvent) {
  //           totalCountArray.push(matchingEvent.totalCount);
  //         } else {
  //           totalCountArray.push(0);
  //         }
  //       });
  
  //       linesData.push(totalCountArray);
  //     }
  //   });
  
  //   return {
  //     chartLabel: this.getDataLabels(weekLabels.length, weekLabels),
  //     linesData: linesData.map((lineData: number[], index: number) => ({
  //       name: `Line ${index + 1}`,
  //       type: 'line',
  //       symbol: 'circle', // Set the symbol to circle (small point)
  //       symbolSize: 6, // Set the size of the circle
  //       data: lineData,
  //       itemStyle: {
  //         emphasis: {
  //           color: colors.primary, // You can set the color of the small point when emphasized (hovered)
  //         },
  //       },
  //     })),
  //   };
  // }
  

  private getDataForMonthPeriod(): OrdersChart {
    return {
      chartLabel: this.getDataLabels(47, this.period.getMonths()),
      linesData: [
        [
          5, 63, 113, 156, 194, 225,
          250, 270, 283, 289, 290,
          286, 277, 264, 244, 220,
          194, 171, 157, 151, 150,
          152, 155, 160, 166, 170,
          167, 153, 135, 115, 97,
          82, 71, 64, 63, 62, 61,
          62, 65, 73, 84, 102,
          127, 159, 203, 259, 333,
        ],
        [
          6, 83, 148, 200, 240,
          265, 273, 259, 211,
          122, 55, 30, 28, 36,
          50, 68, 88, 109, 129,
          146, 158, 163, 165,
          173, 187, 208, 236,
          271, 310, 346, 375,
          393, 400, 398, 387,
          368, 341, 309, 275,
          243, 220, 206, 202,
          207, 222, 247, 286, 348,
        ],
        [
          398, 348, 315, 292, 274,
          261, 251, 243, 237, 231,
          222, 209, 192, 172, 152,
          132, 116, 102, 90, 80, 71,
          64, 58, 53, 49, 48, 54, 66,
          84, 104, 125, 142, 156, 166,
          172, 174, 172, 167, 159, 149,
          136, 121, 105, 86, 67, 45, 22,
        ],
      ],
    };
  }

  private getDataForYearPeriod(): OrdersChart {
    return {
      chartLabel: this.getDataLabels(42, this.year),
      linesData: [
        [
          190, 269, 327, 366, 389, 398,
          396, 387, 375, 359, 343, 327,
          312, 298, 286, 276, 270, 268,
          265, 258, 247, 234, 220, 204,
          188, 172, 157, 142, 128, 116,
          106, 99, 95, 94, 92, 89, 84,
          77, 69, 60, 49, 36, 22,
        ],
        [
          265, 307, 337, 359, 375, 386,
          393, 397, 399, 397, 390, 379,
          365, 347, 326, 305, 282, 261,
          241, 223, 208, 197, 190, 187,
          185, 181, 172, 160, 145, 126,
          105, 82, 60, 40, 26, 19, 22,
          43, 82, 141, 220, 321,
        ],
        [
          9, 165, 236, 258, 244, 206,
          186, 189, 209, 239, 273, 307,
          339, 365, 385, 396, 398, 385,
          351, 300, 255, 221, 197, 181,
          170, 164, 162, 161, 159, 154,
          146, 135, 122, 108, 96, 87,
          83, 82, 82, 82, 82, 82, 82,
        ],
      ],
    };
  }

  getDataLabels(nPoints: number, labelsArray: string[]): string[] {
    const labelsArrayLength = labelsArray.length;
    const step = Math.round(nPoints / labelsArrayLength);

    return Array.from(Array(nPoints)).map((item, index) => {
      const dataIndex = Math.round(index / step);

      return index % step === 0 ? labelsArray[dataIndex] : '';
    });
  }

  getOrdersChartData(period: string): OrdersChart {
    return this.data[period];
  }
}
