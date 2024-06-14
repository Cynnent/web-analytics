
export interface DeviceCount {
    deviceType: string;
    count: number;
  }
  
  export interface DeviceDataEntry {
    DeviceName: string;
  }
  
  export interface MostClickedAction {
    ButtonName: string;
    count: number;
  }
  
  export interface MostViewedPage {
    pageName: string;
    percentage: string;
  }
  
  export interface BrowserData {
    browserName: string;
    count: number;
  }
  
  export interface ProgressBar {
    id: string;
    label: string;
    value: number;
  }
  
  export interface MapLocation {
    country: string;
    cityName: string;
    latitude: string;
    longitude: string;
  }
  
  export interface UserSelectItem {
    id: string;
    value: string;
  }
  
  export interface WeeklyData {
    date: string;
    totalCount: number;
  }

  export interface Country {
    name: string;
    code: string;
  }
  export interface Offer {
    offer: string;
    link: string;
    _id?: string;
  }
  export interface Question {
    question: string;
    _id: string;
  }
  export interface Animation {
    animation: string;
    _id?: string;
  }