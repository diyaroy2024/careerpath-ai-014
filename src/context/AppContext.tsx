import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, AssessmentAnswer, Career, SavedCareer } from '@/types/career';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  assessmentAnswers: AssessmentAnswer[];
  setAssessmentAnswers: (answers: AssessmentAnswer[]) => void;
  addAnswer: (answer: AssessmentAnswer) => void;
  results: Career[];
  setResults: (results: Career[]) => void;
  savedCareers: SavedCareer[];
  saveCareer: (careerId: string) => void;
  removeSavedCareer: (id: string) => void;
  resetAssessment: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [results, setResults] = useState<Career[]>([]);
  const [savedCareers, setSavedCareers] = useState<SavedCareer[]>([]);

  const addAnswer = (answer: AssessmentAnswer) => {
    setAssessmentAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === answer.questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = answer;
        return updated;
      }
      return [...prev, answer];
    });
  };

  const saveCareer = (careerId: string) => {
    if (!savedCareers.some(sc => sc.careerId === careerId)) {
      setSavedCareers(prev => [
        ...prev,
        { id: crypto.randomUUID(), careerId, savedAt: new Date() }
      ]);
    }
  };

  const removeSavedCareer = (id: string) => {
    setSavedCareers(prev => prev.filter(sc => sc.id !== id));
  };

  const resetAssessment = () => {
    setAssessmentAnswers([]);
    setResults([]);
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      setUserProfile,
      assessmentAnswers,
      setAssessmentAnswers,
      addAnswer,
      results,
      setResults,
      savedCareers,
      saveCareer,
      removeSavedCareer,
      resetAssessment
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
