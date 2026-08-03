import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../shared/services/survey.service';
import { UiStateService } from '../shared/services/ui-state.service';

type DraftQuestion = {
  id: number;
  text: string;
  multiple: boolean;
  answers: string[];
  hasClickedAddAnswer: boolean;
};

@Component({
  selector: 'new-survey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newSurvey.component.html',
  styleUrl: './newSurvey.component.scss',
})

export class NewSurveyComponent implements OnDestroy {
  isCategoryOpen = false;
  showRequiredErrors = false;
  showEndDateValidationError = false;
  publishSuccessMessage = signal('');
  maxAnswers = 6;
  maxQuestions = 6;
  private nextQuestionId = 1;
  private whitespaceFields = new Set<string>();
  private successMessageTimer: ReturnType<typeof setTimeout> | null = null;
  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  questions: DraftQuestion[] = [
    {
      id: this.nextQuestionId++,
      text: '',
      multiple: false,
      answers: ['', ''],
      hasClickedAddAnswer: false,
    },
  ];

  constructor (private uiState: UiStateService, private surveyService: SurveyService) {}

  surveyName = '';
  category = '';
  endDate = '';
  description = '';
  isPublishing = false;

  addQuestion() {
    if (this.questions.length >= this.maxQuestions) return;

    this.questions.push({
      id: this.nextQuestionId++,
      text: '',
      multiple: false,
      answers: ['', ''],
      hasClickedAddAnswer: false,
    });
  }

  clearQuestionText(questionIndex: number, questionId: number) {
    const question = this.questions[questionIndex];
    if (!question) return;

    if (questionIndex === 0) {
      this.resetQuestionText(question, questionId);
      return;
    }
    this.questions.splice(questionIndex, 1);
  }

  private resetQuestionText(question: DraftQuestion, questionId: number) {
    question.text = '';
    this.clearWhitespaceError(this.getQuestionFieldKey(questionId));
  }

  trackByQuestion(_index: number, question: DraftQuestion): number {
    return question.id;
  }

  addAnswer(questionIndex: number) {
    const question = this.questions[questionIndex];
    question.hasClickedAddAnswer = true;

    if (!this.canAddAnswer(questionIndex)) return;
    question.answers.push('');
  }

  clearAnswerText(questionIndex: number, answerIndex: number) {
    const question = this.questions[questionIndex];
    if (!question) return;

    if (answerIndex < 2) {
      this.resetAnswerText(question, answerIndex);
      return;
    }
    question.answers.splice(answerIndex, 1);
  }

  private resetAnswerText(question: DraftQuestion, answerIndex: number) {
    question.answers[answerIndex] = '';
    this.clearWhitespaceError(this.getAnswerFieldKey(question.id, answerIndex));
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  get canAddQuestion(): boolean {
    return this.questions.length < this.maxQuestions;
  }

  canAddAnswer(questionIndex: number): boolean {
    return this.questions[questionIndex].answers.length < this.maxAnswers;
  }

  trackByAnswerIndex(index: number, _answer: string): number {
    return index;
  }

  onCancel() {
    this.uiState.closeNewSurvey();
  }

  clearSurveyName() {
    this.surveyName = '';
    this.clearWhitespaceError('surveyName');
  }

  clearEndDate() {
    this.endDate = '';
    this.showEndDateValidationError = false;
  }

  clearDescription() {
    this.description = '';
    this.clearWhitespaceError('description');
  }

  handleTextFieldBlur(event: FocusEvent, fieldKey: string, value: string) {
    this.updateWhitespaceError(fieldKey, value);
    this.handleFieldBlur(event);
  }

  private updateWhitespaceError(fieldKey: string, value: string) {
    if (this.hasOnlyWhitespace(value)) {
      this.whitespaceFields.add(fieldKey);
      return;
    }
    this.whitespaceFields.delete(fieldKey);
  }

  clearWhitespaceError(fieldKey: string) {
    this.whitespaceFields.delete(fieldKey);
  }

  hasWhitespaceError(fieldKey: string): boolean {
    return this.whitespaceFields.has(fieldKey);
  }

  handleFieldBlur(event: FocusEvent) {
    const currentField = event.currentTarget as HTMLElement | null;
    const nextFocusedElement = event.relatedTarget as Node | null;
    const overlay = currentField?.closest('.createSurveyCard');

    if (overlay && nextFocusedElement && overlay.contains(nextFocusedElement)) return;
    this.showRequiredErrors = true;
  }

  isSurveyNameInvalid(): boolean {
    return this.showRequiredErrors && !this.surveyName.trim();
  }

  isCategoryInvalid(): boolean {
    return this.showRequiredErrors && !this.category;
  }

  isEndDateInvalid(): boolean {
    return this.showEndDateValidationError && this.hasPastEndDate();
  }

  onEndDateInputChange(): void {
    this.showEndDateValidationError = false;
  }

  isQuestionInvalid(question: DraftQuestion): boolean {
    return this.showRequiredErrors && !question.text.trim();
  }

  getQuestionDialogMessage(question: DraftQuestion, questionIndex: number): string | null {
    if (this.hasWhitespaceError(this.getQuestionFieldKey(question.id))) return 'Spaces only are not allowed.';
    if (!this.showRequiredErrors) return null;
    if (!question.text.trim()) return `Please enter text for question ${questionIndex + 1}.`;

    return null;
  }

  getAnswerDialogMessage(question: DraftQuestion, questionIndex: number): string | null {
    if (!this.showRequiredErrors) return null;

    const firstTwoAnswersFilled = question.answers.slice(0, 2).every((answer) => answer.trim().length > 0);
    if (!firstTwoAnswersFilled) return `Please fill answers A and B for question ${questionIndex + 1}.`;

    return null;
  }

  getQuestionFieldKey(questionId: number): string {
    return `question-${questionId}`;
  }

  getAnswerFieldKey(questionId: number, answerIndex: number): string {
    return `answer-${questionId}-${answerIndex}`;
  }

  hasRequiredAnswerWhitespaceError(question: DraftQuestion): boolean {
    return [0, 1].some((answerIndex) =>
      this.hasWhitespaceError(this.getAnswerFieldKey(question.id, answerIndex))
    );
  }

  isAnswerInvalid(answer: string, answerIndex: number): boolean {
    return this.showRequiredErrors && answerIndex < 2 && !answer.trim();
  }

  get canPublish(): boolean {
    if (!this.surveyName.trim()) return false;
    if (!this.category) return false;
    if (this.hasOnlyWhitespace(this.description)) return false;

    return this.questions.every((question) => this.isQuestionPublishable(question));
  }

  async publishSurvey() {
    if (this.isPublishing) return;
    this.preparePublishAttempt();
    if (this.hasPublishValidationError()) return;
    await this.executePublish();
  }

  private preparePublishAttempt() {
    this.publishSuccessMessage.set('');
    this.clearRedirectTimer();
  }

  private getPublishValidationError(): string | null {
    if (!this.surveyName.trim()) return 'Please enter a survey name.';
    if (!this.category) return 'Please select a category.';
    if (this.hasOnlyWhitespace(this.description)) return 'Spaces only are not allowed.';
    if (this.showEndDateValidationError) return 'The end date cannot be in the past.';
    return this.validateQuestions();
  }

  private hasPublishValidationError(): boolean {
    this.showEndDateValidationError = this.hasPastEndDate();
    return this.getPublishValidationError() !== null;
  }

  private async executePublish() {
    this.isPublishing = true;
    try {
      await this.performPublish();
    } finally {
      this.isPublishing = false;
    }
  }

  private async performPublish() {
    let createdSurveyId: number | null = null;
    try {
      createdSurveyId = await this.createSurveyWithQuestions();
      this.handlePublishSuccess();
    } catch (error) {
      await this.handlePublishFailure(error, createdSurveyId);
    }
  }

  private async createSurveyWithQuestions(): Promise<number> {
    const survey = await this.surveyService.createSurvey(this.buildSurveyPayload());
    const questions = this.buildQuestionsPayload(survey.id);
    await this.surveyService.createQuestions(questions);
    return survey.id;
  }

  private buildSurveyPayload() {
    return {
      name: this.surveyName.trim(),
      category: this.category,
      description: this.description.trim(),
      end_data: this.endDate || null,
    };
  }

  private buildQuestionsPayload(surveyId: number) {
    return this.questions.map((question, index) => ({
      survey_id: surveyId,
      text: question.text.trim(),
      multiple: question.multiple,
      order: index + 1,
      options: this.getNonEmptyAnswers(question),
    }));
  }

  private getNonEmptyAnswers(question: DraftQuestion): string[] {
    return question.answers.map((answer) => answer.trim()).filter((answer) => answer !== '');
  }

  private handlePublishSuccess() {
    this.showPublishSuccessMessage();
    this.schedulePublishFollowUp();
  }

  private showPublishSuccessMessage() {
    this.publishSuccessMessage.set('Your survey is now published');
  }

  private schedulePublishFollowUp() {
    this.scheduleSuccessMessageClear();
    this.scheduleHomeRedirect();
  }

  private scheduleSuccessMessageClear() {
    this.clearSuccessMessageTimer();
    this.successMessageTimer = setTimeout(() => this.publishSuccessMessage.set(''), 3200);
  }

  private scheduleHomeRedirect() {
    this.redirectTimer = setTimeout(() => this.goToHome(), 1200);
  }

  private async handlePublishFailure(error: unknown, createdSurveyId: number | null) {
    await this.rollbackCreatedSurvey(createdSurveyId);
    this.logPublishError(error);
  }

  private logPublishError(error: unknown) {
    console.error(error);
  }

  private async rollbackCreatedSurvey(createdSurveyId: number | null) {
    if (createdSurveyId === null) return;

    try {
      await this.surveyService.deleteSurveyById(createdSurveyId);
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
  }

  private hasPastEndDate(): boolean {
    if (!this.endDate) return false;

    const selectedDate = new Date(this.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  }

  private validateQuestions(): string | null {
    for (let i = 0; i < this.questions.length; i++) {
      const error = this.getQuestionValidationError(this.questions[i], i + 1);
      if (error) return error;
    }
    return null;
  }

  private isQuestionPublishable(question: DraftQuestion): boolean {
    const hasQuestionText = question.text.trim().length > 0;
    const firstTwoAnswersFilled = question.answers.slice(0, 2).every((answer) => answer.trim().length > 0);
    const hasWhitespaceAnswer = question.answers.some((answer) => this.hasOnlyWhitespace(answer));
    return hasQuestionText && firstTwoAnswersFilled && !hasWhitespaceAnswer;
  }

  private hasOnlyWhitespace(value: string): boolean {
    return value.length > 0 && value.trim().length === 0;
  }

  private getQuestionValidationError(question: DraftQuestion, questionNumber: number): string | null {
    if (!question.text.trim()) return `Please enter text for question ${questionNumber}.`;
    if (!question.answers.slice(0, 2).every((answer) => answer.trim().length > 0)) {
      return `Question ${questionNumber} needs at least 2 answers.`;
    }
    if (question.answers.some((answer) => this.hasOnlyWhitespace(answer))) {
      return `Question ${questionNumber} contains an answer with spaces only.`;
    }
    return null;
  }

  private clearSuccessMessageTimer() {
    if (!this.successMessageTimer) return;
    clearTimeout(this.successMessageTimer);
    this.successMessageTimer = null;
  }

  private clearRedirectTimer() {
    if (!this.redirectTimer) return;
    clearTimeout(this.redirectTimer);
    this.redirectTimer = null;
  }

  ngOnDestroy() {
    this.clearSuccessMessageTimer();
    this.clearRedirectTimer();
  }

  goToHome() {
    this.uiState.closeNewSurvey();
  }
}