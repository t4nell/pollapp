import { Component, HostBinding, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { Supabase } from './supabase';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pollapp');
  dbService = inject(Supabase);
  router = inject(Router);

  @HostBinding('class.survey-detail-page')
  get isSurveyDetail(): boolean {
    return this.router.url.startsWith('/survey/');
  }
}
