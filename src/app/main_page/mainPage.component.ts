import { Component, OnDestroy, effect } from '@angular/core';
import { StartComponent } from './components/landing_page/startComponent.component';
import { EndingSoonSurveys } from './components/ending_soon_surveys/endingSoonSurveys.component';
import { AllSurveys } from './components/all_surveys/allSurveys.component';
import { NewSurveyComponent } from '../new_survey/newSurvey.component';
import { UiStateService } from '../shared/services/ui-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'main-page',
  standalone: true,
  imports: [CommonModule, StartComponent, EndingSoonSurveys, AllSurveys, NewSurveyComponent],
  templateUrl: './mainPage.component.html',
  styleUrl: './mainPage.component.scss',
})
export class MainPageComponent implements OnDestroy {
  constructor(public uiState: UiStateService) {
    effect(() => {
      if (this.uiState.isNewSurveyOpen()) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    });
  }

  closeOverlay() {
    this.uiState.closeNewSurvey();
  }

  ngOnDestroy() {
    document.body.classList.remove('no-scroll');
  }
}
