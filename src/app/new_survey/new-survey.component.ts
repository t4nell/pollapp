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
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})

export class NewSurveyComponent implements OnDestroy {
  isCategoryOpen = false;
  publishSuccessMessage = signal('');
  maxAnswers = 6;
  maxQuestions = 6;
  private nextQuestionId = 1;
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
  publishError = '';
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

  removeQuestion(questionId: number) {
    if (this.questions.length <= 1) return;
    this.questions = this.questions.filter((question) => question.id !== questionId);
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

  removeAnswer(questionIndex: number, answerIndex: number) {
    const question = this.questions[questionIndex];
    if (question.answers.length <= 2) return;
    question.answers.splice(answerIndex, 1);
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
  }

  clearEndDate() {
    this.endDate = '';
  }

  clearDescription() {
    this.description = '';
  }

  async publishSurvey() {
    if (this.isPublishing) return;
    this.preparePublishAttempt();

    const validationError = this.getPublishValidationError();
    if (validationError) {
      this.publishError = validationError;
      return;
    }

    await this.executePublish();
  }

  private preparePublishAttempt() {
    this.publishError = '';
    this.publishSuccessMessage.set('');
    this.clearRedirectTimer();
  }

  private getPublishValidationError(): string | null {
    if (!this.surveyName.trim()) return 'Please enter a survey name.';
    if (!this.category) return 'Please select a category.';
    return this.validateQuestions();
  }

  private async executePublish() {
    this.isPublishing = true;
    let createdSurveyId: number | null = null;

    try {
      createdSurveyId = await this.createSurveyWithQuestions();
      this.handlePublishSuccess();
    } catch (error) {
      await this.handlePublishFailure(error, createdSurveyId);
    } finally {
      this.isPublishing = false;
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
      discription: this.description.trim(),
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
    this.publishSuccessMessage.set('Your survey is now published');
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
    console.error(error);
    this.publishError = 'Failed to publish survey.';
  }

  private async rollbackCreatedSurvey(createdSurveyId: number | null) {
    if (createdSurveyId === null) return;

    try {
      await this.surveyService.deleteSurveyById(createdSurveyId);
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
  }

  private validateQuestions(): string | null {
    for (let i = 0; i < this.questions.length; i++) {
      const error = this.getQuestionValidationError(this.questions[i], i + 1);
      if (error) return error;
    }
    return null;
  }

  private getQuestionValidationError(question: DraftQuestion, questionNumber: number): string | null {
    if (!question.text.trim()) return `Please enter text for question ${questionNumber}.`;
    if (this.getNonEmptyAnswers(question).length < 2) return `Question ${questionNumber} needs at least 2 answers.`;
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