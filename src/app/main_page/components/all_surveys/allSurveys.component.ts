import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Survey } from '../../../shared/interfaces/survey.interface';
import { SurveyService } from '../../../shared/services/survey.service';
import { Router } from '@angular/router';

@Component({
  selector: 'all-surveys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allSurveys.component.html',
  styleUrls: ['./allSurveys.component.scss'],
})


export class AllSurveys implements OnInit {
    surveys: Survey[] = [];
    isSelectOpen = false;
    activeFilter: 'active' | 'past' | null = null;
    selectedCategory = '';

    get filteredSurveys(): Survey[] {
        return this.surveys.filter((survey) => this.matchesSurveyFilters(survey));
    }

    private matchesSurveyFilters(survey: Survey): boolean {
      return this.matchesCategory(survey) && this.matchesStatus(survey);
    }

    private matchesCategory(survey: Survey): boolean {
      return !this.selectedCategory || survey.category === this.selectedCategory;
    }

    private matchesStatus(survey: Survey): boolean {
      if (!this.activeFilter) return true;
      if (this.activeFilter === 'active') return this.isSurveyActive(survey.end_data);
      return !this.isSurveyActive(survey.end_data);
    }

    private isSurveyActive(endDate: string): boolean {
      const endOfDay = this.toEndOfDayTimestamp(endDate);
      return endOfDay >= this.getTodayStartTimestamp();
    }

    private toEndOfDayTimestamp(dateValue: string): number {
      const date = new Date(dateValue);
      date.setHours(23, 59, 59, 999);
      return date.getTime();
    }

    private getTodayStartTimestamp(): number {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today.getTime();
    }

    toggleFilter(filter: 'active' | 'past') {
      this.activeFilter = this.activeFilter === filter ? null : filter;
    }

    @HostListener('document:keydown.escape')
    onEscape() {
      this.isSelectOpen = false;
    }

    navigateToSurvey(id: number) {
      this.router.navigate(['/survey', id]);
    }

    isSurveyExpired(survey: Survey): boolean {
      if (!survey.end_data) return false;

      const endDate = new Date(survey.end_data);
      endDate.setHours(23, 59, 59, 999);

      return endDate.getTime() < Date.now();
    }

  constructor( private surveyService: SurveyService, private router: Router, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    try {
      this.surveys = await this.surveyService.getAllSurveys();
      this.cdr.detectChanges();
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