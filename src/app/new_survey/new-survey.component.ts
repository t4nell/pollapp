import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class NewSurveyComponent {
  isCategoryOpen = false;

  maxQuestions = 6;
  maxAnswers = 6;
  private nextQuestionId = 1;

  questions: DraftQuestion[] = [
    {
      id: this.nextQuestionId++,
      text: '',
      multiple: false,
      answers: ['', ''],
      hasClickedAddAnswer: false,
    },
  ];

  constructor(private router: Router) {}

  surveyName = '';
  endDate = '';
  description = '';

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
}