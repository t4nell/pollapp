import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { StartComponent } from "./main_page/components/landing_page/startComponent.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, StartComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('pollapp');
}
