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

  // Custom interest keyword-to-career mappings (for "Others" description)
  const customInterestKeywords: Record<string, string[]> = {
    // Technology & Engineering
    "robotics": ["engineer", "game-developer", "ar-vr-designer"],
    "robot": ["engineer", "game-developer", "ar-vr-designer"],
    "ai": ["engineer", "game-developer", "ui-ux-designer"],
    "artificial intelligence": ["engineer", "game-developer", "ui-ux-designer"],
    "machine learning": ["engineer", "game-developer"],
    "coding": ["engineer", "game-developer", "ui-ux-designer"],
    "programming": ["engineer", "game-developer", "ui-ux-designer"],
    "software": ["engineer", "game-developer", "ui-ux-designer"],
    "app": ["engineer", "game-developer", "ui-ux-designer"],
    "web": ["engineer", "ui-ux-designer", "graphic-designer"],
    "cyber": ["engineer"],
    "hacking": ["engineer"],
    "electronics": ["engineer", "ar-vr-designer"],
    
    // Creative & Arts
    "music": ["content-creator", "video-editor", "motion-graphics"],
    "audio": ["content-creator", "video-editor", "motion-graphics"],
    "sound": ["video-editor", "motion-graphics", "vfx-artist"],
    "photography": ["graphic-designer", "content-creator", "video-editor"],
    "photo": ["graphic-designer", "content-creator", "video-editor"],
    "animation": ["motion-graphics", "vfx-artist", "game-developer"],
    "drawing": ["illustrator", "graphic-designer", "fashion-designer"],
    "painting": ["illustrator", "graphic-designer"],
    "sculpting": ["product-designer", "ar-vr-designer"],
    "3d": ["ar-vr-designer", "game-developer", "vfx-artist", "motion-graphics"],
    
    // Science & Research
    "astronomy": ["engineer", "doctor"],
    "space": ["engineer"],
    "research": ["doctor", "engineer"],
    "biology": ["doctor"],
    "chemistry": ["doctor", "engineer"],
    "physics": ["engineer"],
    "environment": ["sustainable-design", "engineer"],
    "sustainability": ["sustainable-design"],
    "green": ["sustainable-design"],
    "eco": ["sustainable-design"],
    
    // Media & Entertainment
    "youtube": ["content-creator", "video-editor"],
    "streaming": ["content-creator", "video-editor"],
    "podcast": ["content-creator", "creative-writer"],
    "blog": ["creative-writer", "content-creator"],
    "vlog": ["content-creator", "video-editor"],
    "social media": ["content-creator", "graphic-designer"],
    "influencer": ["content-creator", "video-editor"],
    "cinema": ["video-editor", "vfx-artist", "motion-graphics"],
    "movie": ["video-editor", "vfx-artist", "motion-graphics"],
    "film": ["video-editor", "vfx-artist", "motion-graphics"],
    
    // Business & Finance
    "startup": ["ca", "product-designer", "engineer"],
    "entrepreneur": ["ca", "product-designer"],
    "marketing": ["content-creator", "graphic-designer"],
    "finance": ["ca"],
    "investment": ["ca"],
    "stock": ["ca"],
    "trading": ["ca"],
    
    // Other specialized
    "architecture": ["interior-designer", "ar-vr-designer", "sustainable-design"],
    "interior": ["interior-designer"],
    "cars": ["product-designer", "engineer"],
    "automobile": ["product-designer", "engineer"],
    "sports": ["content-creator", "video-editor"],
    "fitness": ["content-creator"],
    "cooking": ["content-creator", "product-designer"],
    "food": ["content-creator", "product-designer"],
    "travel": ["content-creator", "creative-writer"],
  };

  // Process standard interests first
  profile.interests.forEach(interest => {
    const relatedCareers = interestCareerMap[interest];
    if (relatedCareers) {
      relatedCareers.forEach(careerId => {
        if (careerScores[careerId] !== undefined) {
          careerScores[careerId] += 8; // Interest bonus
        }
      });
    }
  });

  // Process custom interest with higher weightage (when "Others" is selected)
  if (profile.customInterest) {
    const customInput = profile.customInterest.trim().toLowerCase();
    let matchedKeywords = 0;
    
    // Check against keyword mappings
    Object.entries(customInterestKeywords).forEach(([keyword, relatedCareers]) => {
      if (customInput.includes(keyword)) {
        matchedKeywords++;
        relatedCareers.forEach(careerId => {
          if (careerScores[careerId] !== undefined) {
            careerScores[careerId] += 10; // Higher weight for specific custom interest match
          }
        });
      }
    });
    
    // If no keyword matched, do a broader career description match
    if (matchedKeywords === 0 && customInput.length > 2) {
      careers.forEach(career => {
        const matches =
          career.title.toLowerCase().includes(customInput) ||
          career.description.toLowerCase().includes(customInput) ||
          career.skills.some(s => s.toLowerCase().includes(customInput)) ||
          career.courses.some(c => c.toLowerCase().includes(customInput));

        if (matches) {
          careerScores[career.id] += 8; // Same weight as mapped interest for full description match
        }
      });
    }
  }

  // Calculate max possible score dynamically based on the user's actual inputs
  // This avoids artificially low percentages when the assessment has fewer questions/inputs.
  const maxQuestionScore = answers.reduce((sum, answer) => {
    const question = assessmentQuestions.find(q => q.id === answer.questionId);
    if (!question) return sum;

    // Scale questions: max 10 points; Multiple choice: max 15 points
    return sum + (question.options && question.options.length > 0 ? 15 : 10);
  }, 0);

  const maxSubjectsScore = (profile.subjects?.length || 0) * 5; // each subject can add up to 5
  const maxInterestsScore = (profile.interests?.length || 0) * 8; // each interest can add 8
  const maxCustomInterestScore = profile.customInterest ? 10 : 0; // custom interest can add up to 10

  const maxPossibleScore = Math.max(1, maxQuestionScore + maxSubjectsScore + maxInterestsScore + maxCustomInterestScore);

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
