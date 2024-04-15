import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../dashboard/services/data.service';
import { Table } from 'primeng/table';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
})
export class TableComponent implements OnInit {
  @ViewChild('dt1', { static: false }) dt1!: Table;
  loading: boolean = true;
  data: any;
  dataLength: number = 0;
  serialNumbers: number[] = [];
  cols!: Column[];
  primaryHeader: string = '';
  primaryField: string = '';
  secondaryHeader: string = '';
  secondaryField: string = '';
  thirdHeader: string = '';
  thirdField: string = '';
  tableType: string = 'primaryTable';

  setHeaders(
    primaryHeader: string,
    primaryField: string,
    secondaryHeader: string,
    secondaryField: string,
    thirdHeader: string = '',
    thirdField: string = ''
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

  constructor(private tableConfigService: DataService) {
    if (this.tableConfigService.widgetLink === 'mostViewedPages') {
      this.setHeaders('Page Name', 'pageName', 'Percentage', 'percentage');
      this.setTableType('primaryTable');
    } else if (this.tableConfigService.widgetLink == 'mostClickedActions') {
      this.setHeaders('Button Name', 'ButtonName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.tableConfigService.widgetLink == 'mostUsedDevices') {
      this.setHeaders('Device Name', 'DeviceName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.tableConfigService.widgetLink == 'usersByCountry') {
      this.setHeaders(
        'Country',
        'country',
        'Cities',
        'cities',
        'User Count',
        'counts'
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
    this.tableConfigService.getTableData().subscribe((res) => {
      this.data = res;
      this.loading = false;
    });

    if (this.tableType === 'primaryTable') {
      this.cols = [
        { field: 'serialNumber', header: 'Sl.No' },
        { field: this.primaryField, header: this.primaryHeader },
        { field: this.secondaryField, header: this.secondaryHeader },
      ];
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
