import { Component, OnInit, HostListener } from '@angular/core';
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
        if (!this.selectedCategory) {
            return this.surveys;
        }
        return this.surveys.filter(
            (survey) => survey.category === this.selectedCategory
        );
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

  constructor(private surveyService: SurveyService, private router: Router) {}

  async ngOnInit() {
    try {
      this.surveys = await this.surveyService.getAllSurveys();
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log('Window resized');
  }
}