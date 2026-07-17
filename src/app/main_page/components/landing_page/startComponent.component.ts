import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'start-component',
  standalone: true,
  templateUrl: './startComponent.component.html',
  styleUrl: './startComponent.component.scss',
})
export class StartComponent {
  currentImage = 'handy_image.png';

  constructor(private router: Router) {}

  goToNewSurvey() {
    this.router.navigate(['/new-survey']);
  }
}