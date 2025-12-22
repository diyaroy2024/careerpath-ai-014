import { AssessmentAnswer, Career, UserProfile } from "@/types/career";
import { assessmentQuestions } from "@/data/questions";
import { careers } from "@/data/careers";

// Simple ML-inspired scoring algorithm using weighted matching
export function calculateCareerMatches(
  answers: AssessmentAnswer[],
  profile: UserProfile
): Career[] {
  const careerScores: Record<string, number> = {};
  
  // Initialize all career scores
  careers.forEach(career => {
    careerScores[career.id] = 0;
  });

  // Process each answer
  answers.forEach(answer => {
    const question = assessmentQuestions.find(q => q.id === answer.questionId);
    if (!question) return;

    const answerValue = answer.answer;
    
    // For scale questions (1-5), weight the careers based on response strength
    if (!question.options) {
      const weight = answerValue / 5; // Normalize to 0-1
      question.relatedCareers.forEach(careerId => {
        if (careerScores[careerId] !== undefined) {
          careerScores[careerId] += weight * 10; // Max 10 points per question
        }
      });
    } else {
      // For multiple choice questions, give full weight to the selected option's career
      const selectedCareer = question.relatedCareers[answerValue - 1];
      if (selectedCareer && careerScores[selectedCareer] !== undefined) {
        careerScores[selectedCareer] += 15; // Higher weight for direct selection
      }
    }
  });

  // Boost scores based on subject performance
  const subjectCareerMap: Record<string, string[]> = {
    "Mathematics": ["engineer", "ca", "game-developer", "ar-vr-designer"],
    "Physics": ["engineer", "game-developer", "ar-vr-designer"],
    "Chemistry": ["doctor", "engineer"],
    "Biology": ["doctor"],
    "Computer Science": ["ui-ux-designer", "game-developer", "ar-vr-designer", "motion-graphics"],
    "Art": ["graphic-designer", "illustrator", "fashion-designer", "interior-designer", "vfx-artist"],
    "English": ["creative-writer", "content-creator", "teacher"],
    "Economics": ["ca", "civil-servant"],
    "History": ["civil-servant", "teacher", "creative-writer"],
    "Geography": ["civil-servant", "sustainable-design"]
  };

  profile.subjects.forEach(subject => {
    const relatedCareers = subjectCareerMap[subject.subject];
    if (relatedCareers) {
      const performanceBonus = (subject.marks / 100) * 5; // Up to 5 bonus points
      relatedCareers.forEach(careerId => {
        if (careerScores[careerId] !== undefined) {
          careerScores[careerId] += performanceBonus;
        }
      });
    }
  });

  // Boost based on interests
  const interestCareerMap: Record<string, string[]> = {
    "Technology": ["engineer", "game-developer", "ui-ux-designer", "ar-vr-designer"],
    "Art & Design": ["graphic-designer", "illustrator", "fashion-designer", "interior-designer"],
    "Writing": ["creative-writer", "content-creator"],
    "Science": ["doctor", "engineer"],
    "Business": ["ca", "product-designer"],
    "Teaching": ["teacher"],
    "Social Work": ["civil-servant", "teacher"],
    "Gaming": ["game-developer", "vfx-artist"],
    "Film & Video": ["video-editor", "motion-graphics", "vfx-artist"],
    "Fashion": ["fashion-designer"]
  };

  const allInterests = profile.customInterest
    ? [...profile.interests, profile.customInterest]
    : profile.interests;

  allInterests.forEach(interest => {
    const relatedCareers = interestCareerMap[interest];
    if (relatedCareers) {
      relatedCareers.forEach(careerId => {
        if (careerScores[careerId] !== undefined) {
          careerScores[careerId] += 8; // Interest bonus
        }
      });
      return;
    }

    // If it's a custom interest (or an unmapped interest), do a lightweight keyword match
    const keyword = interest.trim().toLowerCase();
    if (!keyword) return;

    careers.forEach(career => {
      const matches =
        career.title.toLowerCase().includes(keyword) ||
        career.description.toLowerCase().includes(keyword) ||
        career.skills.some(s => s.toLowerCase().includes(keyword));

      if (matches) {
        careerScores[career.id] += 6; // slightly lower than mapped interest
      }
    });
  });

  // Calculate max possible score dynamically based on the user's actual inputs
  // This avoids artificially low percentages when the assessment has fewer questions/inputs.
  const maxQuestionScore = answers.reduce((sum, answer) => {
    const question = assessmentQuestions.find(q => q.id === answer.questionId);
    if (!question) return sum;

    // Scale questions: max 10 points; Multiple choice: max 15 points
    return sum + (question.options && question.options.length > 0 ? 15 : 10);
  }, 0);

  const maxSubjectsScore = (profile.subjects?.length || 0) * 5; // each subject can add up to 5
  const totalInterests = (profile.interests?.length || 0) + (profile.customInterest ? 1 : 0);
  const maxInterestsScore = totalInterests * 8; // each interest can add 8

  const maxPossibleScore = Math.max(1, maxQuestionScore + maxSubjectsScore + maxInterestsScore);

  // Create result with normalized scores
  const results = careers.map(career => ({
    ...career,
    matchScore: Math.min(99, Math.round((careerScores[career.id] / maxPossibleScore) * 100))
  }));

  // Sort by score and return top matches
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// K-Nearest Neighbors inspired recommendation
export function getRelatedCareers(careerId: string, topN: number = 3): Career[] {
  const targetCareer = careers.find(c => c.id === careerId);
  if (!targetCareer) return [];

  // Calculate similarity based on shared skills and category
  const similarityScores = careers
    .filter(c => c.id !== careerId)
    .map(career => {
      let similarity = 0;
      
      // Category match bonus
      if (career.category === targetCareer.category) {
        similarity += 30;
      }
      
      // Shared skills bonus
      const sharedSkills = career.skills.filter(skill => 
        targetCareer.skills.some(ts => ts.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(ts.toLowerCase()))
      );
      similarity += sharedSkills.length * 10;
      
      return { career, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN)
    .map(item => item.career);

  return similarityScores;
}
