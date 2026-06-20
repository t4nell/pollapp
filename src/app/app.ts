import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { StartComponent } from "./main_page/components/landing_page/startComponent.component";
import { YourSurveys } from "./main_page/components/your_surveys/yourSurveys.component";
import { AllSurveys } from "./main_page/components/all_surveys/allSurveys.component";
import { Supabase } from "./supabase";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, StartComponent, YourSurveys, AllSurveys],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('pollapp');
  dbServise = inject(Supabase);
}
