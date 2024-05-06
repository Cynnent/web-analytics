import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { Table } from 'primeng/table';
import { SelectedClientService } from '../../../shared/shared.service';

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
  selectedClient: string = '';
  secondaryField: string = '';
  thirdHeader: string = '';
  thirdField: string = '';
  tableType: string = 'primaryTable';
  tableData: any=[];
  selectedClientName: string = '';
  widgetHeading: string = '';

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

  constructor(
    public dataService: DataService,
    private selectedClientService: SelectedClientService
  ) {
    console.log(this.dataService.widgetLink)
    if (this.dataService.widgetLink === 'mostViewedPages') {
      this.widgetHeading = 'Most Viewed Pages';
      this.setHeaders('Page Name', 'pageName', 'Percentage', 'percentage');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == 'mostClickedActions') {
      this.widgetHeading = 'Most Clicked Actions';
      this.setHeaders('Button Name', 'ButtonName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == 'mostUsedDevices') {
      this.widgetHeading='Active User by Device'
      this.setHeaders('Device Name', 'DeviceName', 'Count', 'count');
      this.setTableType('primaryTable');
    } else if (this.dataService.widgetLink == 'mostUsedBrowsers') {
      this.widgetHeading='Most Used Browsers'
      this.setHeaders('Browser Name', 'browserName', 'Count', 'count');
      this.setTableType('primaryTable');
    }
    else if (this.dataService.widgetLink == 'usersByCountry') {
      this.widgetHeading='Most Used Countries'
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
    this.selectedClientService.selectedClient$.subscribe((clientName) => {
      console.log('Selected client name:', clientName); 
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
      console.log(this.selectedClientName)
      this.dataService.getTableData(this.selectedClientName).subscribe(
        (data) => {
          this.tableData = data;
          this.loading = false;
          console.log('Table data:', this.tableData);
          // Further processing of the received data
        },
        (error) => {
          console.error('Error fetching table data:', error);
        }
      );
        console.log(this.tableType)
      if (this.tableType === 'primaryTable') {
        this.cols = [
          { field: 'serialNumber', header: 'Sl.No' },
          { field: this.primaryField, header: this.primaryHeader },
          { field: this.secondaryField, header: this.secondaryHeader },
        ];
        console.log(this.cols)

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

  // ngOnInit(): void {

  //   console.log(this.selectedClient)
  //   this.dataService.getTableData(this.selectedClient).subscribe((res:any) => {
  //     this.data = res;
  //     this.loading = false;
  //   });

  //   if (this.tableType === 'primaryTable') {
  //     this.cols = [
  //       { field: 'serialNumber', header: 'Sl.No' },
  //       { field: this.primaryField, header: this.primaryHeader },
  //       { field: this.secondaryField, header: this.secondaryHeader },
  //     ];
  //   } else if (this.tableType === 'secondaryTable') {
  //     this.cols = [
  //       { field: 'serialNumber', header: 'Sl.No' },
  //       { field: this.primaryField, header: this.primaryHeader },
  //       { field: this.secondaryField, header: this.secondaryHeader },
  //       { field: this.thirdField, header: this.thirdHeader },
  //     ];
  //   }
  // }
}
