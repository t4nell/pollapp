import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'main-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(public router: Router) {}

  get logoSrc(): string {
    return this.router.url.startsWith('/survey/') ? 'logo_dark.png' : 'logo_orange.svg';
  }
}