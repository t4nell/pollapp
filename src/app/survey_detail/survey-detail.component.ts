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
  resultsByQuestion: Record<number, number[]> = {};
  totalAnswersByQuestion: Record<number, number> = {};

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
      await this.loadResults();
      this.cdr.detectChanges();
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
      await this.loadResults();
      this.showSubmitMessage('Survey submitted successfully.');
    } catch (error) {
      console.error(error);
      this.showSubmitMessage('Failed to submit survey. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  private async loadResults() {
    if (!this.survey) return;

    const answers = await this.surveyService.getAnswersBySurveyId(this.survey.id);

    const counts: Record<number, number[]> = {};
    const totals: Record<number, number> = {};

    for (const question of this.questions) {
      const optionCount = question.options?.length ?? 0;
      counts[question.id] = new Array(optionCount).fill(0);
      totals[question.id] = 0;
    }

    for (const answer of answers) {
      const questionCounts = counts[answer.question_id];
      if (!questionCounts) continue;
      if (answer.option_index < 0 || answer.option_index >= questionCounts.length) continue;

      questionCounts[answer.option_index] += 1;
      totals[answer.question_id] += 1;
    }

    this.resultsByQuestion = counts;
    this.totalAnswersByQuestion = totals;
  }

  ngOnDestroy() {
    if (this.submitMessageTimer) {
      clearTimeout(this.submitMessageTimer);
    }
  }

  getResultPercent(questionId: number, optionIndex: number): number {
    const total = this.totalAnswersByQuestion[questionId] ?? 0;
    if (total === 0) return 0;

    const count = this.resultsByQuestion[questionId]?.[optionIndex] ?? 0;
    return Math.round((count / total) * 100);
  }

  getOptionLetter(optionIndex: number): string {
    return `${String.fromCharCode(65 + optionIndex)}`;
  }

  hasAnyResults(): boolean {
    return Object.values(this.totalAnswersByQuestion).some((total) => total > 0);
  }
}
