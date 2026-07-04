import { Component } from '@angular/core';
import { StartComponent } from './components/landing_page/startComponent.component';
import { EndingSoonSurveys } from './components/ending_soon_surveys/endingSoonSurveys.component';
import { AllSurveys } from './components/all_surveys/allSurveys.component';

@Component({
  selector: 'main-page',
  standalone: true,
  imports: [StartComponent, EndingSoonSurveys, AllSurveys],
  templateUrl: './main-page.component.html',
})
export class MainPageComponent {}
