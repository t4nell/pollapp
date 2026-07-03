import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Survey } from '../../../shared/interfaces/survey.interface';
import { SurveyService } from '../../../shared/services/survey.service';

@Component({
  selector: 'ending-soon-surveys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './endingSoonSurveys.component.html',
  styleUrl: './endingSoonSurveys.component.scss',
})
export class EndingSoonSurveys implements OnInit {
  surveys: Survey[] = [];

  constructor(private surveyService: SurveyService) {}

  async ngOnInit() {
    try {
      this.surveys = await this.surveyService.getEndingSoonSurveys();
    } catch (error) {
      console.error(error);
    }
  }

  daysRemaining(endDate: string): string {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    if (diff <= 0) return 'Ended';
    if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.ceil(diff / (1000 * 60 * 60));
      return `${hours} hours`;
    }
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24))} days`;
  }
}