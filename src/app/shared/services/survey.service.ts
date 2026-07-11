import { Injectable } from '@angular/core';
import { Supabase } from '../../supabase';
import { Survey, Question } from '../interfaces/survey.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  constructor(private supabase: Supabase) {}

  async getAllSurveys(): Promise<Survey[]> {
    const { data, error } = await this.supabase.supabase
      .from('surveys')
      .select('*');

    if (error) throw error;
    return data;
  }

  async getSurveyById(id: number): Promise<Survey> {
    const { data, error } = await this.supabase.supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getEndingSoonSurveys(): Promise<Survey[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase.supabase
      .from('surveys')
      .select('*')
      .gte('end_data', today)
      .order('end_data', { ascending: true })
      .limit(3);

    if (error) throw error;
    return data;
  }

  async getQuestionsBySurveyId(surveyId: number): Promise<Question[]> {
    const { data, error } = await this.supabase.supabase
      .from('question')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data;
  }

  async saveAnswers(
    answersToSave: Array<{ survey_id: number; question_id: number; option_index: number }>
  ): Promise<void> {
    if (answersToSave.length === 0) return;

    const { error } = await this.supabase.supabase
      .from('answer')
      .insert(answersToSave);

    if (error) throw error;
  }

  async getAnswersBySurveyId(
    surveyId: number ): Promise<Array<{ question_id: number; option_index: number }>> {

    const { data, error } = await this.supabase.supabase
      .from('answer')
      .select('question_id, option_index')
      .eq('survey_id', surveyId);

    if (error) throw error;
    return data ?? [];
  }
};
