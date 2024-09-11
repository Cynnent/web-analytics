import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../shared/services/dashboard.service';
import { Table } from 'primeng/table';
import {
  ACTIVE_USER_BY_DEVICE,
  BROWSER_NAME,
  BROWSERNAME_KEY,
  BUTTON_KEY,
  BUTTON_NAME,
  CITIES,
  CITIES_KEY,
  COUNT,
  COUNT_KEY,
  COUNTRY,
  COUNTRY_KEY,
  COUNTS,
  DEVICE_NAME,
  DEVICENAME_KEY,
  MOST_CLICKED_ACTION,
  MOST_CLICKED_ACTIONS_LINK,
  MOST_USED_BROWSER_HEADING,
  MOST_USED_BROWSER_LINK,
  MOST_USED_COUNTRY_HEADING,
  MOST_USED_DEVICES_LINK,
  MOST_VIEWED_PAGES_HEADING,
  MOST_VIEWED_PAGES_LINK,
  PAGE_NAME,
  PAGENAME_KEY,
  PERCENTAGE,
  PERCENTAGE_KEY,
  PRIMARYTABLE,
  SECONDARYTABLE,
  USER_BY_COUNTRY_LINK,
  USER_COUNT,
} from '../../../shared/constants/const';
 
interface Column {
  field: string;
  header: string;
}
 
@Component({
  selector: 'app-table',
  templateUrl: './widget-component.html',
})
export class TableComponent implements OnInit {
  @ViewChild('widgetTable', { static: false }) widgetTable!: Table;
 
  serialNumbers: number[] = [];
  cols!: Column[];
  tableData: any = [];
 
  dataLength: number = 0;
 
  primaryHeader: string = '';
  primaryField: string = '';
  secondaryHeader: string = '';
  secondaryField: string = '';
  thirdHeader: string = '';
  thirdField: string = '';
  tableType: string = 'primaryTable';
  widgetHeading: string = '';
 
  loading: boolean = true;
 
  data: any;
 
  setHeaders(
    primaryHeader: string,
    primaryField: string,
    secondaryHeader: string,
    secondaryField: string,
    thirdHeader: string = '',
    thirdField: string = '',
  ) {
    this.primaryHeader = primaryHeader;
    this.primaryField = primaryField;
    this.secondaryHeader = secondaryHeader;
    this.secondaryField = secondaryField;
    this.thirdHeader = thirdHeader;
    this.thirdField = thirdField;
  }
 
  setTableType(tabletype: string) {
    this.tableType = tabletype;
  }
 
  constructor(
    public dataService: DataService,
  ) {
    if (this.dataService.widgetLink === MOST_VIEWED_PAGES_LINK) {
      this.widgetHeading = MOST_VIEWED_PAGES_HEADING;
      this.setHeaders(PAGE_NAME, PAGENAME_KEY, PERCENTAGE, PERCENTAGE_KEY);
      this.setTableType(PRIMARYTABLE);
    } else if (this.dataService.widgetLink == MOST_CLICKED_ACTIONS_LINK) {
      this.widgetHeading = MOST_CLICKED_ACTION;
      this.setHeaders(BUTTON_NAME, BUTTON_KEY, COUNT, COUNT_KEY);
      this.setTableType(PRIMARYTABLE);
    } else if (this.dataService.widgetLink == MOST_USED_DEVICES_LINK) {
      this.widgetHeading = ACTIVE_USER_BY_DEVICE;
      this.setHeaders(DEVICE_NAME, DEVICENAME_KEY, COUNT, COUNT_KEY);
      this.setTableType(PRIMARYTABLE);
    } else if (this.dataService.widgetLink == MOST_USED_BROWSER_LINK) {
      this.widgetHeading = MOST_USED_BROWSER_HEADING;
      this.setHeaders(BROWSER_NAME, BROWSERNAME_KEY, COUNT, COUNT_KEY);
      this.setTableType(PRIMARYTABLE);
    } else if (this.dataService.widgetLink == USER_BY_COUNTRY_LINK) {
      this.widgetHeading = MOST_USED_COUNTRY_HEADING;
      this.setHeaders(
        COUNTRY,
        COUNTRY_KEY,
        CITIES,
        CITIES_KEY,
        USER_COUNT,
        COUNTS,
      );
      this.setTableType(SECONDARYTABLE);
    }
  }
 
  handleInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.widgetTable.filterGlobal(value, 'contains');
  }
 
  ngOnInit(): void {
    this.dataService.emitSelectedClientTable(this.dataService.selectedClient)
   if(this.widgetHeading === MOST_CLICKED_ACTION){
    this.dataService.onMostClickedActionsTable((data) => {
      this.tableData = data
      this.loading = false
      this.fetchTableData()
    })
   }else if(this.widgetHeading === MOST_VIEWED_PAGES_HEADING){
    this.dataService.onMostViewedPageTable((data) => {
      this.tableData = data
      this.loading = false
      this.fetchTableData()
    })
   }else if(this.widgetHeading === ACTIVE_USER_BY_DEVICE){
    this.dataService.onDataUpdateTable((data) => {
      this.tableData = data
      this.loading = false
      this.fetchTableData()
    })
   }else if(this.widgetHeading === MOST_USED_BROWSER_HEADING){
      this.dataService.onBrowserCountsTable((data) => {
        this.tableData = data
        this.loading = false
        this.fetchTableData()
      })
   }else if(this.widgetHeading === MOST_USED_COUNTRY_HEADING){
      this.dataService.onMostUsedCountriesTable((data) => {
        this.tableData = data
        this.loading = false
        this.fetchTableData()
      })
      this.setTableType(SECONDARYTABLE);
   }else {
    console.log("not found")
   }
  }
 
  fetchTableData() {
      if (this.tableType === PRIMARYTABLE) {
        this.cols = [
          { field: 'serialNumber', header: 'Sl.No' },
          { field: this.primaryField, header: this.primaryHeader },
          { field: this.secondaryField, header: this.secondaryHeader },
        ];
      } else if (this.tableType === SECONDARYTABLE) {
        this.cols = [
          { field: 'serialNumber', header: 'Sl.No' },
          { field: this.primaryField, header: this.primaryHeader },
          { field: this.secondaryField, header: this.secondaryHeader },
          { field: this.thirdField, header: this.thirdHeader },
        ];
      }
  }
}