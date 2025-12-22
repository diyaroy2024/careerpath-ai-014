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
  customInterest?: string;
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
  
  // Include custom interest in the interests list for matching
  const allInterests = [...profile.interests];
  if (profile.customInterest) {
    allInterests.push(profile.customInterest);
  }
  
  // Skill preference features (10 dimensions)
  SKILL_CATEGORIES.forEach(skill => {
    const hasInterest = allInterests.some(i => 
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
    const matchCount = allInterests.filter(i => 
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
  
  // Include custom interest in matching
  const allInterests = [...profile.interests];
  if (profile.customInterest) {
    allInterests.push(profile.customInterest);
  }
  
  // Rule-based decision tree logic
  const hasTechInterest = allInterests.some(i => 
    ['technology', 'programming', 'coding', 'software', 'computer', 'robotics', 'ai', 'machine learning'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasCreativeInterest = allInterests.some(i => 
    ['art', 'design', 'creative', 'music', 'writing', 'photography', 'video', 'animation'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasBusinessInterest = allInterests.some(i => 
    ['business', 'finance', 'marketing', 'management', 'economics', 'entrepreneur', 'startup'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasHealthcareInterest = allInterests.some(i => 
    ['health', 'medicine', 'biology', 'nursing', 'care', 'psychology', 'therapy'].some(t => 
      i.toLowerCase().includes(t)
    )
  );
  
  const hasScienceInterest = allInterests.some(i => 
    ['science', 'research', 'physics', 'chemistry', 'math', 'astronomy', 'space', 'environment'].some(t => 
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
  
  // Get KNN recommendations - get all careers for proper scoring
  const knnResults = knnRecommend(userVector, careerVectors, careerVectors.length);
  
  // Get Decision Tree predictions
  const dtPredictions = buildDecisionTree(profile, answers);
  
  // Combine results with weighted scoring
  const scoreMap: Record<string, { score: number; algorithms: string[]; knnRank: number; dtRank: number }> = {};
  
  // Find min and max distances for better normalization
  const distances = knnResults.map(r => r.distance);
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const distanceRange = maxDistance - minDistance || 1;
  
  // KNN scores - use exponential decay for better score distribution
  knnResults.forEach((result, index) => {
    // Normalize distance to 0-1 range (0 = closest, 1 = farthest)
    const normalizedDistance = (result.distance - minDistance) / distanceRange;
    
    // Convert to similarity score with exponential boost for top matches
    // This gives much higher scores to close matches
    const similarityScore = Math.exp(-normalizedDistance * 2);
    
    // Add rank-based bonus (top positions get extra boost)
    const rankBonus = Math.max(0, 1 - (index / 5) * 0.2); // Top 5 get bonus
    
    if (!scoreMap[result.careerId]) {
      scoreMap[result.careerId] = { score: 0, algorithms: [], knnRank: -1, dtRank: -1 };
    }
    scoreMap[result.careerId].score += similarityScore * rankBonus * 55; // Base KNN contribution
    scoreMap[result.careerId].algorithms.push('knn');
    scoreMap[result.careerId].knnRank = index;
  });
  
  // Decision Tree scores - boost careers that match user interests directly
  dtPredictions.forEach((careerId, index) => {
    // Higher scores for earlier predictions (more relevant)
    const relevanceScore = Math.max(0.6, 1 - (index / dtPredictions.length) * 0.5);
    
    if (!scoreMap[careerId]) {
      scoreMap[careerId] = { score: 0, algorithms: [], knnRank: -1, dtRank: -1 };
    }
    scoreMap[careerId].score += relevanceScore * 45; // Base DT contribution
    scoreMap[careerId].algorithms.push('decision_tree');
    scoreMap[careerId].dtRank = index;
  });
  
  // Apply synergy bonus when both algorithms agree
  Object.values(scoreMap).forEach(data => {
    if (data.algorithms.includes('knn') && data.algorithms.includes('decision_tree')) {
      // Boost score when both algorithms recommend the same career
      const synergyBonus = 15;
      data.score += synergyBonus;
      console.log('Applied synergy bonus for dual-algorithm match');
    }
  });
  
  // Convert to array and normalize scores to 0-100 range
  const allScores = Object.values(scoreMap).map(d => d.score);
  const maxScore = Math.max(...allScores);
  const minScore = Math.min(...allScores);
  const scoreRange = maxScore - minScore || 1;
  
  const recommendations = Object.entries(scoreMap)
    .map(([careerId, data]) => {
      // Normalize to 45-98 range (no one gets 100%, minimum meaningful score is 45%)
      const normalizedScore = ((data.score - minScore) / scoreRange) * 53 + 45;
      return {
        careerId,
        score: Math.round(Math.min(normalizedScore, 98)),
        algorithm: data.algorithms.join('+')
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
  
  console.log(`Hybrid recommendations: ${recommendations.length} careers, scores: ${recommendations.map(r => r.score).join(', ')}`);
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
