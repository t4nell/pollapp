import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { StartComponent } from "./main_page/components/landing_page/startComponent.component";
import { YourSurveys } from "./main_page/components/your_surveys/yourSurveys.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, StartComponent, YourSurveys],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('pollapp');
}
