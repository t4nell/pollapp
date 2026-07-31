import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Survey, Question } from '../shared/interfaces/survey.interface';
import { SurveyService } from '../shared/services/survey.service';

type AnswerInsert = { survey_id: number; question_id: number; option_index: number };
type StoredAnswer = { question_id: number; option_index: number };

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
  hasSubmitted = false;
  submitMessage = '';
  private submitMessageTimer: ReturnType<typeof setTimeout> | null = null;
  resultsByQuestion: Record<number, number[]> = {};
  totalAnswersByQuestion: Record<number, number> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    if (this.areOptionsDisabled()) return;

    const question = this.findQuestionById(questionId);
    if (!question) return;
    if (question.multiple) {
      this.toggleMultiChoice(questionId, optionIndex);
      return;
    }
    this.selectedOptions[questionId] = [optionIndex];
  }

  isSelected(questionId: number, optionIndex: number): boolean {
    return (this.selectedOptions[questionId] ?? []).includes(optionIndex);
  }

  areOptionsDisabled(): boolean {
    return this.isSubmitting || this.hasSubmitted || this.isSurveyExpired();
  }

  private showSubmitMessage(message: string) {
    this.submitMessage = message;
    this.clearSubmitMessageTimer();
    this.submitMessageTimer = setTimeout(() => this.clearSubmitMessage(), 3400);
  }

  async onCompleteSurvey() {
    if (!this.survey || this.hasSubmitted) return;

    const answersToSave = this.buildAnswersToSave(this.survey.id);
    if (answersToSave.length === 0) {
      this.showSubmitMessage('Please select at least one answer.');
      return;
    }

    await this.submitAnswers(answersToSave);
  }

  private async loadResults() {
    if (!this.survey) return;

    const answers = await this.surveyService.getAnswersBySurveyId(this.survey.id);
    const counts = this.createInitialCounts();
    const totals = this.createInitialTotals();
    this.applyAnswersToResults(answers, counts, totals);
    this.resultsByQuestion = counts;
    this.totalAnswersByQuestion = totals;
  }

  ngOnDestroy() {
    this.clearSubmitMessageTimer();
  }

  getResultPercent(questionId: number, optionIndex: number): number {
    const storedTotal = this.totalAnswersByQuestion[questionId] ?? 0;
    const storedCount = this.resultsByQuestion[questionId]?.[optionIndex] ?? 0;
    const previewOptions = this.hasSubmitted ? [] : this.selectedOptions[questionId] ?? [];
    const previewCount = previewOptions.includes(optionIndex) ? 1 : 0;

    return this.calculatePercent(
      storedCount + previewCount,
      storedTotal + previewOptions.length
    );
  }

  getOptionLetter(optionIndex: number): string {
    return `${String.fromCharCode(65 + optionIndex)}`;
  }

  hasAnyResults(): boolean {
    const hasStoredResults = Object.values(this.totalAnswersByQuestion).some((total) => total > 0);
    const hasPreviewSelection = !this.hasSubmitted
      && Object.values(this.selectedOptions).some((options) => options.length > 0);

    return hasStoredResults || hasPreviewSelection;
  }

  isSurveyExpired(): boolean {
    if (!this.survey?.end_data) return false;

    const endDate = new Date(this.survey.end_data);
    endDate.setHours(23, 59, 59, 999);

    return endDate.getTime() < Date.now();
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  private findQuestionById(questionId: number): Question | undefined {
    return this.questions.find((question) => question.id === questionId);
  }

  private toggleMultiChoice(questionId: number, optionIndex: number) {
    const current = this.selectedOptions[questionId] ?? [];
    const alreadySelected = current.includes(optionIndex);
    this.selectedOptions[questionId] = alreadySelected
      ? current.filter((index) => index !== optionIndex)
      : [...current, optionIndex];
  }

  private clearSubmitMessageTimer() {
    if (!this.submitMessageTimer) return;
    clearTimeout(this.submitMessageTimer);
    this.submitMessageTimer = null;
  }

  private clearSubmitMessage() {
    this.submitMessage = '';
    this.cdr.detectChanges();
  }

  private buildAnswersToSave(surveyId: number): AnswerInsert[] {
    return this.questions.flatMap((question) => this.buildQuestionAnswers(surveyId, question.id));
  }

  private buildQuestionAnswers(surveyId: number, questionId: number): AnswerInsert[] {
    const selected = this.selectedOptions[questionId] ?? [];
    return selected.map((optionIndex) => ({ survey_id: surveyId, question_id: questionId, option_index: optionIndex }));
  }

  private async submitAnswers(answersToSave: AnswerInsert[]) {
    this.isSubmitting = true;
    this.submitMessage = '';

    try {
      await this.saveAnswersWithTimeout(answersToSave);
      await this.loadResults();
      this.hasSubmitted = true;
      this.showSubmitMessage('Survey submitted successfully.');
    } catch (error) {
      console.error(error);
      this.showSubmitMessage('Failed to submit survey. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  private async saveAnswersWithTimeout(answersToSave: AnswerInsert[]) {
    await Promise.race([this.surveyService.saveAnswers(answersToSave), this.createTimeoutPromise()]);
  }

  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000));
  }

  private createInitialCounts(): Record<number, number[]> {
    const counts: Record<number, number[]> = {};
    for (const question of this.questions) {
      const optionCount = question.options?.length ?? 0;
      counts[question.id] = new Array(optionCount).fill(0);
    }
    return counts;
  }

  private createInitialTotals(): Record<number, number> {
    const totals: Record<number, number> = {};
    for (const question of this.questions) {
      totals[question.id] = 0;
    }
    return totals;
  }

  private applyAnswersToResults(
    answers: StoredAnswer[],
    counts: Record<number, number[]>,
    totals: Record<number, number>
  ) {
    for (const answer of answers) {
      if (!this.isValidAnswerIndex(counts, answer)) continue;
      counts[answer.question_id][answer.option_index] += 1;
      totals[answer.question_id] += 1;
    }
  }

  private isValidAnswerIndex(counts: Record<number, number[]>, answer: StoredAnswer): boolean {
    const questionCounts = counts[answer.question_id];
    if (!questionCounts) return false;
    const index = answer.option_index;
    return index >= 0 && index < questionCounts.length;
  }

  private calculatePercent(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }
}
