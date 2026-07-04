import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Survey, Question } from '../shared/interfaces/survey.interface';
import { SurveyService } from '../shared/services/survey.service';

@Component({
  selector: 'survey-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-detail.component.html',
  styleUrl: './survey-detail.component.scss'
})
export class SurveyDetailComponent implements OnInit {
  survey: Survey | null = null;
  questions: Question[] = [];
  selectedOptions: { [questionId: number]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      [this.survey, this.questions] = await Promise.all([
        this.surveyService.getSurveyById(id),
        this.surveyService.getQuestionsBySurveyId(id),
      ]);
      this.cdr.detectChanges(); // ← Angular sagt: "Update die Ansicht jetzt!"
    } catch (error) {
      console.error(error);
    }
  }

  selectOption(questionId: number, optionIndex: number) {
    this.selectedOptions[questionId] = optionIndex;
    this.cdr.detectChanges();
  }

  isSelected(questionId: number, optionIndex: number): boolean {
    return this.selectedOptions[questionId] === optionIndex;
  }
}
