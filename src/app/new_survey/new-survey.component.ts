import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';

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

  constructor (private router: Router, private surveyService: SurveyService) {}

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
    this.router.navigate(['/']);
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
    this.publishError = '';
    this.publishSuccessMessage.set('');
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
    let createdSurveyId: number | null = null;

    if (!this.surveyName.trim()) {
      this.publishError = 'Please enter a survey name.';
      return;
    }

    if (!this.category) {
      this.publishError = 'Please select a category.';
      return;
    }

    const questionValidationError = this.validateQuestions();
    if (questionValidationError) {
      this.publishError = questionValidationError;
      return;
    }

    this.isPublishing = true;

    try {
      const createdSurvey = await this.surveyService.createSurvey({
        name: this.surveyName.trim(),
        category: this.category,
        discription: this.description.trim(),
        end_data: this.endDate || null,
      });
      createdSurveyId = createdSurvey.id;

      const questionsToCreate = this.questions.map((question, index) => ({
        survey_id: createdSurvey.id,
        text: question.text.trim(),
        multiple: question.multiple,
        order: index + 1,
        options: question.answers
          .map((answer) => answer.trim())
          .filter((answer) => answer !== ''),
      }));

      await this.surveyService.createQuestions(questionsToCreate);
      this.publishSuccessMessage.set('Your survey is now published');

      if (this.successMessageTimer) {
        clearTimeout(this.successMessageTimer);
      }

      this.successMessageTimer = setTimeout(() => {
        this.publishSuccessMessage.set('');
      }, 3200);

      this.redirectTimer = setTimeout(() => {
        this.router.navigate(['/']);
      }, 1200);

      console.log('Created survey:', createdSurvey);
    } catch (error) {
      if (createdSurveyId !== null) {
        try {
          await this.surveyService.deleteSurveyById(createdSurveyId);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      console.error(error);
      this.publishError = 'Failed to publish survey.';
    } finally {
      this.isPublishing = false;
    }
  }

  private validateQuestions(): string | null {
    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      const questionNumber = i + 1;

      if (!question.text.trim()) {
        return `Please enter text for question ${questionNumber}.`;
      }

      const nonEmptyAnswers = question.answers.filter((answer) => answer.trim() !== '');

      if (nonEmptyAnswers.length < 2) {
        return `Question ${questionNumber} needs at least 2 answers.`;
      }
    }

    return null;
  }

  ngOnDestroy() {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }
}