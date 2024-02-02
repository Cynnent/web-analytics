import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { OrdersChartService } from '../../../@core/mock/orders-chart.service';
@Component({
  selector: 'ngx-echarts-bar',
  template: `
    <div echarts [options]="options" class="echart"></div>
  `,
})
export class EchartsBarComponent implements AfterViewInit, OnDestroy {
  options: any = {};
  themeSubscription: any;

  constructor(private theme: NbThemeService,private ordersChartService: OrdersChartService,) {
  }

  ngAfterViewInit() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const echarts: any = config.variables.echarts;

      const ordersChartData = this.ordersChartService.getOrdersChartData('week');

      this.options = {
        backgroundColor: echarts.bg,
        color: [colors.primaryLight],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: ordersChartData.chartLabel,
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            splitLine: {
              lineStyle: {
                color: echarts.splitLineColor,
              },
            },
            axisLabel: {
              formatter: (value: string) => {
                // Format the date as needed, assuming value is in "DD/MM/YYYY" format
                const [day, month, year] = value.split('/');
                return `${day}/${month}\n${year}`;
              },
              textStyle: {
                color: echarts.textColor,
              },
            },
            
            // {
            //   textStyle: {
            //     color: echarts.textColor,
            //   },
            // },
          },
        ],
        series: ordersChartData.linesData.map((lineData: number[], index: number) => ({
          name: `Line ${index + 1}`,
          type: 'bar',
          barWidth: '60%',
          data: lineData,
          itemStyle: {
            // Customize the appearance of the bars
            emphasis: {
              color: colors.primary, // You can set the color of the bars when emphasized (hovered)
              borderColor: colors.primaryLight, // You can set the border color of the bars when emphasized (hovered)
              borderWidth: 2, // You can set the border width of the bars when emphasized (hovered)
              shadowBlur: 5, // You can set the shadow blur of the bars when emphasized (hovered)
              shadowColor: 'rgba(0, 0, 0, 0.3)', // You can set the shadow color of the bars when emphasized (hovered)
            },
          },
          
        })),
        
        // [
        //   {
        //     name: 'Score',
        //     type: 'bar',
        //     barWidth: '60%',
        //     data: [10, 52, 200, 334, 390, 330, 220],
        //   },
        // ],
      };
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
