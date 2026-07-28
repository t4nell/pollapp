import { Routes } from '@angular/router';
import { MainPageComponent } from './main_page/main-page.component';
import { SurveyDetailComponent } from './survey_detail/survey-detail.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'survey/:id', component: SurveyDetailComponent },
];
