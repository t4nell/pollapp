import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../../supabase';

@Component({
  selector: 'all-surveys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allSurveys.component.html',
  styleUrls: ['./allSurveys.component.scss'],
})


export class AllSurveys implements OnInit {
    surveys: any[] = [];

  constructor(private supabaseService: Supabase) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.supabase
      .from('survey')
      .select('*');

    if (error) {
      console.error(error);
    } else {
      this.surveys = data;
      console.log(data);
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