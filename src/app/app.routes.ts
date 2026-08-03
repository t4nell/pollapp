import { Routes } from '@angular/router';
import { MainPageComponent } from './main_page/mainPage.component';
import { SurveyDetailComponent } from './survey_detail/surveyDetail.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'survey/:id', component: SurveyDetailComponent },
];
