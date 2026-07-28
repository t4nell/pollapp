import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { UiStateService } from '../../shared/services/ui-state.service';

@Component({
  selector: 'main-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(public router: Router, private uiState: UiStateService) {}

  @HostBinding('class.survey-detail-header')
  get isSurveyDetail(): boolean {
    return this.router.url.startsWith('/survey/');
  }

  get logoSrc(): string {
    return this.isSurveyDetail ? 'logo_dark.png' : 'logo_orange.svg';
  }

  goToNewSurvey() {
    this.uiState.openNewSurvey();
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}