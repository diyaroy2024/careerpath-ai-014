import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  interests: string[];
  preferredSubjects: string[];
  educationLevel: string;
}

interface AssessmentAnswer {
  questionId: string;
  answer: string;
  relatedCareers: string[];
}

interface Career {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  courses: string[];
  roadmap: string[];
  icon: string;
}

interface CareerVector {
  careerId: string;
  features: number[];
}

// Feature categories for vectorization
const SKILL_CATEGORIES = [
  'programming', 'data', 'design', 'communication', 'leadership',
  'analytical', 'creative', 'technical', 'research', 'healthcare'
];

const INTEREST_CATEGORIES = [
  'technology', 'science', 'arts', 'business', 'healthcare',
  'education', 'engineering', 'social', 'environment', 'finance'
];

// Convert profile and answers to feature vector
function createUserVector(profile: UserProfile, answers: AssessmentAnswer[]): number[] {
  const features: number[] = [];
  
  // Skill preference features (10 dimensions)
  SKILL_CATEGORIES.forEach(skill => {
    const hasInterest = profile.interests.some(i => 
      i.toLowerCase().includes(skill) || skill.includes(i.toLowerCase())
    );
    const hasSubject = profile.preferredSubjects.some(s => 
      s.toLowerCase().includes(skill) || skill.includes(s.toLowerCase())
    );
    features.push(hasInterest ? 1 : 0);
    features.push(hasSubject ? 0.8 : 0);
  });
  
  // Interest category features (10 dimensions)
  INTEREST_CATEGORIES.forEach(category => {
    const matchCount = profile.interests.filter(i => 
      i.toLowerCase().includes(category) || category.includes(i.toLowerCase())
    ).length;
    features.push(Math.min(matchCount / 3, 1));
  });
  
  // Answer-based features
  const careerMentions: Record<string, number> = {};
  answers.forEach(answer => {
    answer.relatedCareers.forEach(career => {
      careerMentions[career] = (careerMentions[career] || 0) + 1;
    });
  });
  
  // Education level feature
  const educationLevels: Record<string, number> = {
    'high_school': 0.25,
    'bachelors': 0.5,
    'masters': 0.75,
    'phd': 1.0
  };
  features.push(educationLevels[profile.educationLevel] || 0.5);
  
  return features;
}

// Convert career to feature vector
function createCareerVector(career: Career): number[] {
  const features: number[] = [];
  
  // Skill-based features
  SKILL_CATEGORIES.forEach(skill => {
    const hasSkill = career.skills.some(s => 
      s.toLowerCase().includes(skill) || skill.includes(s.toLowerCase())
    );
    features.push(hasSkill ? 1 : 0);
    features.push(hasSkill ? 0.8 : 0);
  });
  
  // Category-based features
  INTEREST_CATEGORIES.forEach(category => {
    const matches = career.category.toLowerCase() === category || 
                   career.description.toLowerCase().includes(category);
    features.push(matches ? 1 : 0);
  });
  
  // Default education requirement
  features.push(0.5);
  
  return features;
}

// Calculate Euclidean distance between two vectors
function euclideanDistance(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    console.warn('Vector length mismatch, padding shorter vector');
    const maxLen = Math.max(v1.length, v2.length);
    while (v1.length < maxLen) v1.push(0);
    while (v2.length < maxLen) v2.push(0);
  }
  
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  return Math.sqrt(sum);
}

// K-Nearest Neighbors algorithm
function knnRecommend(
  userVector: number[], 
  careerVectors: CareerVector[], 
  k: number = 5
): { careerId: string; distance: number }[] {
  console.log(`KNN: Finding ${k} nearest neighbors from ${careerVectors.length} careers`);
  
  const distances = careerVectors.map(cv => ({
    careerId: cv.careerId,
    distance: euclideanDistance(userVector, cv.features)
  }));
  
  // Sort by distance (ascending) and take top k
  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k);
}

// Decision Tree node
interface DecisionNode {
  feature?: string;
  threshold?: number;
  left?: DecisionNode;
  right?: DecisionNode;
  prediction?: string[];
}

// Simple Decision Tree classifier
function buildDecisionTree(profile: UserProfile, answers: AssessmentAnswer[]): string[] {
  console.log('Decision Tree: Building tree based on profile and answers');
  
  const predictions: string[] = [];
  
  // Rule-based decision tree logic
  const hasTechInterest = profile.interests.some(i => 
    ['technology', 'programming', 'coding', 'software', 'computer'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasCreativeInterest = profile.interests.some(i => 
    ['art', 'design', 'creative', 'music', 'writing'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasBusinessInterest = profile.interests.some(i => 
    ['business', 'finance', 'marketing', 'management', 'economics'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasHealthcareInterest = profile.interests.some(i => 
    ['health', 'medicine', 'biology', 'nursing', 'care'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasScienceInterest = profile.interests.some(i => 
    ['science', 'research', 'physics', 'chemistry', 'math'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  // Decision tree branches
  if (hasTechInterest) {
    predictions.push('software-engineer', 'data-scientist', 'cybersecurity-analyst', 'cloud-architect');
  }
  
  if (hasCreativeInterest) {
    predictions.push('ux-designer', 'graphic-designer', 'content-creator', 'marketing-specialist');
  }
  
  if (hasBusinessInterest) {
    predictions.push('product-manager', 'business-analyst', 'financial-analyst', 'entrepreneur');
  }
  
  if (hasHealthcareInterest) {
    predictions.push('healthcare-administrator', 'medical-researcher', 'nurse', 'pharmacist');
  }
  
  if (hasScienceInterest) {
    predictions.push('research-scientist', 'data-scientist', 'environmental-scientist', 'biotech-specialist');
  }
  
  // Add careers from answers
  answers.forEach(answer => {
    answer.relatedCareers.forEach(career => {
      if (!predictions.includes(career)) {
        predictions.push(career);
      }
    });
  });
  
  console.log(`Decision Tree predictions: ${predictions.length} careers`);
  return predictions;
}

// Hybrid recommendation combining KNN and Decision Tree
function hybridRecommend(
  userVector: number[],
  careerVectors: CareerVector[],
  profile: UserProfile,
  answers: AssessmentAnswer[],
  topN: number = 10
): { careerId: string; score: number; algorithm: string }[] {
  console.log('Starting hybrid recommendation engine');
  
  // Get KNN recommendations
  const knnResults = knnRecommend(userVector, careerVectors, Math.min(topN * 2, careerVectors.length));
  
  // Get Decision Tree predictions
  const dtPredictions = buildDecisionTree(profile, answers);
  
  // Combine results with weighted scoring
  const scoreMap: Record<string, { score: number; algorithms: string[] }> = {};
  
  // KNN scores (inverse of distance, normalized)
  const maxDistance = Math.max(...knnResults.map(r => r.distance), 1);
  knnResults.forEach((result, index) => {
    const normalizedScore = 1 - (result.distance / maxDistance);
    const positionBonus = 1 - (index / knnResults.length) * 0.3;
    
    if (!scoreMap[result.careerId]) {
      scoreMap[result.careerId] = { score: 0, algorithms: [] };
    }
    scoreMap[result.careerId].score += normalizedScore * positionBonus * 0.6; // 60% weight for KNN
    scoreMap[result.careerId].algorithms.push('knn');
  });
  
  // Decision Tree scores
  dtPredictions.forEach((careerId, index) => {
    const positionScore = 1 - (index / dtPredictions.length) * 0.5;
    
    if (!scoreMap[careerId]) {
      scoreMap[careerId] = { score: 0, algorithms: [] };
    }
    scoreMap[careerId].score += positionScore * 0.4; // 40% weight for Decision Tree
    scoreMap[careerId].algorithms.push('decision_tree');
  });
  
  // Convert to array and sort
  const recommendations = Object.entries(scoreMap)
    .map(([careerId, data]) => ({
      careerId,
      score: Math.min(data.score * 100, 100), // Normalize to 0-100
      algorithm: data.algorithms.join('+')
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
  
  console.log(`Hybrid recommendations: ${recommendations.length} careers`);
  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { profile, answers, userId, sessionId } = await req.json();
    
    console.log('Received recommendation request:', { 
      profile: profile?.interests?.length || 0,
      answers: answers?.length || 0,
      userId: userId ? 'provided' : 'anonymous',
      sessionId 
    });

    // Fetch all careers from database
    const { data: careers, error: careersError } = await supabase
      .from('careers')
      .select('*');

    if (careersError) {
      console.error('Error fetching careers:', careersError);
      throw new Error('Failed to fetch careers');
    }

    if (!careers || careers.length === 0) {
      console.log('No careers in database, returning empty recommendations');
      return new Response(
        JSON.stringify({ 
          recommendations: [],
          message: 'No careers available in the database'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${careers.length} careers in database`);

    // Create user feature vector
    const userVector = createUserVector(profile, answers);
    console.log(`User vector created with ${userVector.length} features`);

    // Create career feature vectors
    const careerVectors: CareerVector[] = careers.map(career => ({
      careerId: career.id,
      features: createCareerVector(career)
    }));

    // Get hybrid recommendations
    const recommendations = hybridRecommend(
      userVector,
      careerVectors,
      profile,
      answers,
      10
    );

    // Map recommendations to full career objects
    const recommendedCareers = recommendations.map(rec => {
      const career = careers.find(c => c.id === rec.careerId);
      return {
        ...career,
        matchScore: Math.round(rec.score),
        algorithmUsed: rec.algorithm
      };
    }).filter(c => c.id);

    // Store recommendations in database if user is authenticated
    if (userId && sessionId) {
      const insertData = recommendedCareers.map(career => ({
        user_id: userId,
        session_id: sessionId,
        career_id: career.id,
        match_score: career.matchScore,
        algorithm_used: career.algorithmUsed
      }));

      const { error: insertError } = await supabase
        .from('career_recommendations')
        .insert(insertData);

      if (insertError) {
        console.error('Error storing recommendations:', insertError);
        // Don't fail the request, just log the error
      } else {
        console.log(`Stored ${insertData.length} recommendations for user`);
      }
    }

    return new Response(
      JSON.stringify({ 
        recommendations: recommendedCareers,
        algorithms: ['knn', 'decision_tree'],
        totalCareers: careers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Recommendation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
