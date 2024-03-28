import { Component } from "@angular/core";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
  public activeLink: string = 'dashboard';

  changeActiveLink(clickedLink: string, e: Event) {
    e.preventDefault();
    this.activeLink = clickedLink;
  }
}
