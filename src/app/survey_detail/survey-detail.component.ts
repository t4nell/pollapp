import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class SurveyDetailComponent implements OnInit, OnDestroy {
  survey: Survey | null = null;
  questions: Question[] = [];
  selectedOptions: { [questionId: number]: number[] } = {};
  isSubmitting = false;
  submitMessage = '';
  private submitMessageTimer: ReturnType<typeof setTimeout> | null = null;

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
    const question = this.questions.find((q) => q.id === questionId);

    if (!question) return;

    const current = this.selectedOptions[questionId] ?? [];

    if (question.multiple) {
      const alreadySelected = current.includes(optionIndex);

      this.selectedOptions[questionId] = alreadySelected
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
    } else {
      this.selectedOptions[questionId] = [optionIndex];
    }

    this.cdr.detectChanges();
  }

  isSelected(questionId: number, optionIndex: number): boolean {
    return (this.selectedOptions[questionId] ?? []).includes(optionIndex);
  }

  private showSubmitMessage(message: string) {
    this.submitMessage = message;

    if (this.submitMessageTimer) {
      clearTimeout(this.submitMessageTimer);
    }

    this.submitMessageTimer = setTimeout(() => {
      this.submitMessage = '';
      this.cdr.detectChanges();
    }, 3400);
  }

  async onCompleteSurvey() {
    if (!this.survey) return;

    const answersToSave: Array<{ survey_id: number; question_id: number; option_index: number }> = [];

    for (const question of this.questions) {
      const selected = this.selectedOptions[question.id] ?? [];

      for (const optionIndex of selected) {
        answersToSave.push({
          survey_id: this.survey.id,
          question_id: question.id,
          option_index: optionIndex,
        });
      }
    }

    if (answersToSave.length === 0) {
      this.showSubmitMessage('Please select at least one answer.');
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';

    try {
      await this.surveyService.saveAnswers(answersToSave);
      this.showSubmitMessage('Survey submitted successfully.');
    } catch (error) {
      console.error(error);
      this.showSubmitMessage('Failed to submit survey. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.submitMessageTimer) {
      clearTimeout(this.submitMessageTimer);
    }
  }
}
