import { Component } from '@angular/core';
import { UiStateService } from '../../../shared/services/ui-state.service';

@Component({
  selector: 'start-component',
  standalone: true,
  templateUrl: './startComponent.component.html',
  styleUrl: './startComponent.component.scss',
})
export class StartComponent {
  currentImage = 'handy_image.png';

  constructor(private uiState: UiStateService) {}

  goToNewSurvey() {
    this.uiState.openNewSurvey();
  }
}