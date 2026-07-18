import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'main-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(public router: Router) {}

  @HostBinding('class.survey-detail-header')
  get isSurveyDetail(): boolean {
    return this.router.url.startsWith('/survey/');
  }

  get logoSrc(): string {
    return this.isSurveyDetail ? 'logo_dark.png' : 'logo_orange.svg';
  }

  goToNewSurvey() {
    this.router.navigate(['/new-survey']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}