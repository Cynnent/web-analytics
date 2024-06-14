import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../shared/services/dashboard.service';
import { Table } from 'primeng/table';
import { SelectedClientService } from '../../../shared/shared.service';
import {
  ACTIVE_USER_BY_DEVICE,
  MOST_CLICKED_ACTION,
  MOST_CLICKED_ACTIONS_LINK,
  MOST_USED_BROWSER_HEADING,
  MOST_USED_BROWSER_LINK,
  MOST_USED_COUNTRY_HEADING,
  MOST_USED_DEVICES_LINK,
  MOST_VIEWED_PAGES_HEADING,
  MOST_VIEWED_PAGES_LINK,
  USER_BY_COUNTRY_LINK,
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
  @ViewChild('dt1', { static: false }) dt1!: Table;

  serialNumbers: number[] = [];
  cols!: Column[];
  tableData: any = [];

  dataLength: number = 0;

  primaryHeader: string = '';
  primaryField: string = '';
  secondaryHeader: string = '';
  selectedClient: string = '';
  secondaryField: string = '';
  thirdHeader: string = '';
  thirdField: string = '';
  tableType: string = 'primaryTable';
  selectedClientName: string = '';
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
    private selectedClientService: SelectedClientService,
  ) {
    console.log(this.dataService.widgetLink);
    if (this.dataService.widgetLink === MOST_VIEWED_PAGES_LINK) {
      this.widgetHeading = MOST_VIEWED_PAGES_HEADING;
      this.setHeaders('Page Name', 'pageName', 'Percentage', 'percentage');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == MOST_CLICKED_ACTIONS_LINK) {
      this.widgetHeading = MOST_CLICKED_ACTION;
      this.setHeaders('Button Name', 'ButtonName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == MOST_USED_DEVICES_LINK) {
      this.widgetHeading = ACTIVE_USER_BY_DEVICE;
      this.setHeaders('Device Name', 'DeviceName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == MOST_USED_BROWSER_LINK) {
      this.widgetHeading = MOST_USED_BROWSER_HEADING;
      this.setHeaders('Browser Name', 'browserName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == USER_BY_COUNTRY_LINK) {
      this.widgetHeading = MOST_USED_COUNTRY_HEADING;
      this.setHeaders(
        'Country',
        'country',
        'Cities',
        'cities',
        'User Count',
        'counts',
      );
      this.setTableType('secondaryTable');
    }
  }

  handleInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt1.filterGlobal(value, 'contains');
  }

  ngOnInit(): void {
    this.selectedClientService.selectedClient$.subscribe((clientName) => {
      if (clientName) {
        this.selectedClientName = clientName;
        this.fetchTableData();
      } else {
        console.warn('Selected client name is empty or undefined.');
      }
    });
  }

  fetchTableData() {
    if (this.selectedClientName) {
      console.log(this.selectedClientName);
      this.dataService.getTableData(this.selectedClientName).subscribe(
        (data) => {
          this.tableData = data;
          this.loading = false;
          // Further processing of the received data
        },
        (error) => {
          console.error('Error fetching table data:', error);
        },
      );
      console.log(this.tableType);
      if (this.tableType === 'primaryTable') {
        this.cols = [
          { field: 'serialNumber', header: 'Sl.No' },
          { field: this.primaryField, header: this.primaryHeader },
          { field: this.secondaryField, header: this.secondaryHeader },
        ];
        console.log(this.cols);
      } else if (this.tableType === 'secondaryTable') {
        this.cols = [
          { field: 'serialNumber', header: 'Sl.No' },
          { field: this.primaryField, header: this.primaryHeader },
          { field: this.secondaryField, header: this.secondaryHeader },
          { field: this.thirdField, header: this.thirdHeader },
        ];
      }
    }
  }
}
