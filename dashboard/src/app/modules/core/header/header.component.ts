import { Component } from "@angular/core";

@Component({
  selector: 'app-header',
  templateUrl: './header.components.html',
  styleUrl: './header.component.scss',
})

export class HeaderComponent {
  public username: string = 'Sundhar';
  public userRole: string = 'Super Administrator';
}
