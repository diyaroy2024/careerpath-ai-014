export interface UserProfile {
  name: string;
  class: string;
  subjects: SubjectMark[];
  interests: string[];
  customInterest?: string;
}

export interface SubjectMark {
  subject: string;
  marks: number;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options?: string[];
  relatedCareers: string[];
}

export interface AssessmentAnswer {
  questionId: number;
  answer: number; // 1-5 scale or option index
}

export interface Career {
  id: string;
  title: string;
  description: string;
  matchScore: number;
  skills: string[];
  courses: string[];
  roadmap: string[];
  icon: string;
  category: string;
}

export interface SavedCareer {
  id: string;
  careerId: string;
  savedAt: Date;
}
