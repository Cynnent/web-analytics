import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.components.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public username: string = 'Cynnent';
  public userRole: string = 'Super Administrator';
  checked: boolean = true;

  constructor(private renderer: Renderer2) {
    this.toggleBodyClass();
  }

  toggleBodyClass() {
    if (this.checked) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }
}
