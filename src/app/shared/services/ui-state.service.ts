import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  isNewSurveyOpen = signal(false);

  openNewSurvey() {
    this.isNewSurveyOpen.set(true);
  }

  closeNewSurvey() {
    this.isNewSurveyOpen.set(false);
  }
}