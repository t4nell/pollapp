export interface Survey {
  id: number;
  created_at: string;
  name: string;
  category: string;
  discription: string;
  status: string;
  answerings: boolean;
  end_data: string;
}

export interface Question {
  id: number;
  survey_id: number;
  text: string;
  multiple: boolean;
  order: number;
  options: string[] | null;
}
