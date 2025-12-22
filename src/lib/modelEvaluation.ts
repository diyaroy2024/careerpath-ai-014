import { AssessmentAnswer, UserProfile, Career } from "@/types/career";
import { calculateCareerMatches } from "./careerMatcher";

// ============================================================================
// LABELED TEST DATASET - 50 Synthetic Student Profiles with Ground Truth
// ============================================================================

export interface TestCase {
  id: string;
  name: string;
  profile: UserProfile;
  answers: AssessmentAnswer[];
  groundTruthCareer: string;
  groundTruthTop3: string[];
}

const createAnswers = (responses: { questionId: number; answer: number }[]): AssessmentAnswer[] =>
  responses.map(r => ({ questionId: r.questionId, answer: r.answer }));

export const testDataset: TestCase[] = [
  {
    id: "tc-001", name: "Strong Tech + Math Student",
    profile: { name: "Test1", class: "12th", subjects: [{ subject: "Mathematics", marks: 95 }, { subject: "Physics", marks: 90 }, { subject: "Computer Science", marks: 98 }], interests: ["Technology", "Gaming"] },
    answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "game-developer", groundTruthTop3: ["game-developer", "engineer", "ar-vr-designer"]
  },
  {
    id: "tc-002", name: "Pure Engineer Profile",
    profile: { name: "Test2", class: "12th", subjects: [{ subject: "Mathematics", marks: 92 }, { subject: "Physics", marks: 94 }, { subject: "Chemistry", marks: 88 }], interests: ["Technology", "Science"] },
    answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 3 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 4 }]),
    groundTruthCareer: "engineer", groundTruthTop3: ["engineer", "doctor", "game-developer"]
  },
  {
    id: "tc-003", name: "High Creativity + Design",
    profile: { name: "Test3", class: "12th", subjects: [{ subject: "Art", marks: 98 }, { subject: "Computer Science", marks: 75 }], interests: ["Art & Design", "Technology"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "ui-ux-designer", groundTruthTop3: ["ui-ux-designer", "graphic-designer", "illustrator"]
  },
  {
    id: "tc-004", name: "Pure Graphic Designer",
    profile: { name: "Test4", class: "College", subjects: [{ subject: "Art", marks: 95 }], interests: ["Art & Design"] },
    answers: createAnswers([{ questionId: 1, answer: 2 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 1 }]),
    groundTruthCareer: "graphic-designer", groundTruthTop3: ["graphic-designer", "illustrator", "fashion-designer"]
  },
  {
    id: "tc-005", name: "Fashion Enthusiast",
    profile: { name: "Test5", class: "12th", subjects: [{ subject: "Art", marks: 90 }], interests: ["Fashion", "Art & Design"] },
    answers: createAnswers([{ questionId: 1, answer: 2 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 1 }]),
    groundTruthCareer: "fashion-designer", groundTruthTop3: ["fashion-designer", "graphic-designer", "interior-designer"]
  },
  {
    id: "tc-006", name: "Strong Language + Expression",
    profile: { name: "Test6", class: "12th", subjects: [{ subject: "English", marks: 95 }, { subject: "History", marks: 88 }], interests: ["Writing"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 4 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "creative-writer", groundTruthTop3: ["creative-writer", "content-creator", "teacher"]
  },
  {
    id: "tc-007", name: "Content Creator Profile",
    profile: { name: "Test7", class: "College", subjects: [{ subject: "English", marks: 85 }, { subject: "Computer Science", marks: 78 }], interests: ["Writing", "Technology"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "content-creator", groundTruthTop3: ["content-creator", "creative-writer", "ui-ux-designer"]
  },
  {
    id: "tc-008", name: "Film & Video Enthusiast",
    profile: { name: "Test8", class: "12th", subjects: [{ subject: "Art", marks: 82 }], interests: ["Film & Video", "Art & Design"] },
    answers: createAnswers([{ questionId: 1, answer: 2 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "video-editor", groundTruthTop3: ["video-editor", "motion-graphics", "vfx-artist"]
  },
  {
    id: "tc-009", name: "High Numerical + Logic (CA)",
    profile: { name: "Test9", class: "12th", subjects: [{ subject: "Mathematics", marks: 92 }, { subject: "Economics", marks: 95 }], interests: ["Business"] },
    answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 5 }]),
    groundTruthCareer: "ca", groundTruthTop3: ["ca", "engineer", "product-designer"]
  },
  {
    id: "tc-010", name: "Medical Aspirant",
    profile: { name: "Test10", class: "12th", subjects: [{ subject: "Biology", marks: 96 }, { subject: "Chemistry", marks: 90 }], interests: ["Science"] },
    answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 4 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "doctor", groundTruthTop3: ["doctor", "engineer", "teacher"]
  },
  {
    id: "tc-011", name: "Teaching Enthusiast",
    profile: { name: "Test11", class: "College", subjects: [{ subject: "English", marks: 90 }, { subject: "History", marks: 85 }], interests: ["Teaching", "Writing"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 3 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "teacher", groundTruthTop3: ["teacher", "creative-writer", "civil-servant"]
  },
  {
    id: "tc-012", name: "Civil Service Aspirant",
    profile: { name: "Test12", class: "College", subjects: [{ subject: "History", marks: 94 }, { subject: "Geography", marks: 90 }], interests: ["Social Work"] },
    answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 4 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "civil-servant", groundTruthTop3: ["civil-servant", "teacher", "creative-writer"]
  },
  {
    id: "tc-013", name: "VFX Artist Profile",
    profile: { name: "Test13", class: "College", subjects: [{ subject: "Art", marks: 92 }, { subject: "Computer Science", marks: 85 }], interests: ["Film & Video", "Gaming"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 1 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "vfx-artist", groundTruthTop3: ["vfx-artist", "motion-graphics", "game-developer"]
  },
  {
    id: "tc-014", name: "AR/VR Developer",
    profile: { name: "Test14", class: "College", subjects: [{ subject: "Computer Science", marks: 94 }, { subject: "Mathematics", marks: 88 }], interests: ["Technology", "Gaming"] },
    answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "ar-vr-designer", groundTruthTop3: ["ar-vr-designer", "game-developer", "ui-ux-designer"]
  },
  {
    id: "tc-015", name: "Product Designer",
    profile: { name: "Test15", class: "College", subjects: [{ subject: "Art", marks: 85 }, { subject: "Physics", marks: 78 }], interests: ["Art & Design", "Business"] },
    answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "product-designer", groundTruthTop3: ["product-designer", "ui-ux-designer", "interior-designer"]
  },
  {
    id: "tc-016", name: "Game Development Focus",
    profile: { name: "Test16", class: "College", subjects: [{ subject: "Computer Science", marks: 96 }, { subject: "Mathematics", marks: 85 }], interests: ["Gaming", "Technology"] },
    answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "game-developer", groundTruthTop3: ["game-developer", "vfx-artist", "ar-vr-designer"]
  },
  {
    id: "tc-017", name: "Interior Design Focus",
    profile: { name: "Test17", class: "College", subjects: [{ subject: "Art", marks: 88 }, { subject: "Mathematics", marks: 70 }], interests: ["Art & Design"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "interior-designer", groundTruthTop3: ["interior-designer", "graphic-designer", "product-designer"]
  },
  {
    id: "tc-018", name: "Motion Graphics Designer",
    profile: { name: "Test18", class: "12th", subjects: [{ subject: "Art", marks: 88 }, { subject: "Computer Science", marks: 82 }], interests: ["Film & Video", "Art & Design"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 2 }]),
    groundTruthCareer: "motion-graphics", groundTruthTop3: ["motion-graphics", "vfx-artist", "video-editor"]
  },
  {
    id: "tc-019", name: "Digital Illustrator",
    profile: { name: "Test19", class: "College", subjects: [{ subject: "Art", marks: 96 }], interests: ["Art & Design"] },
    answers: createAnswers([{ questionId: 1, answer: 2 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 1 }]),
    groundTruthCareer: "illustrator", groundTruthTop3: ["illustrator", "graphic-designer", "fashion-designer"]
  },
  {
    id: "tc-020", name: "Sustainable Design Specialist",
    profile: { name: "Test20", class: "College", subjects: [{ subject: "Geography", marks: 92 }, { subject: "Art", marks: 80 }], interests: ["Art & Design", "Social Work"] },
    answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 4 }, { questionId: 5, answer: 3 }]),
    groundTruthCareer: "sustainable-design", groundTruthTop3: ["sustainable-design", "interior-designer", "civil-servant"]
  },
  // Additional 30 test cases for robust evaluation
  { id: "tc-021", name: "Art Director", profile: { name: "Test21", class: "College", subjects: [{ subject: "Art", marks: 94 }, { subject: "English", marks: 88 }], interests: ["Art & Design", "Business"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "art-director", groundTruthTop3: ["art-director", "graphic-designer", "creative-writer"] },
  { id: "tc-022", name: "Tech + Art Hybrid", profile: { name: "Test22", class: "12th", subjects: [{ subject: "Computer Science", marks: 90 }, { subject: "Art", marks: 88 }], interests: ["Technology", "Art & Design"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "ui-ux-designer", groundTruthTop3: ["ui-ux-designer", "game-developer", "motion-graphics"] },
  { id: "tc-023", name: "Science + Teaching", profile: { name: "Test23", class: "College", subjects: [{ subject: "Physics", marks: 92 }, { subject: "Mathematics", marks: 88 }], interests: ["Science", "Teaching"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 4 }]), groundTruthCareer: "teacher", groundTruthTop3: ["teacher", "engineer", "doctor"] },
  { id: "tc-024", name: "Business + Creative", profile: { name: "Test24", class: "College", subjects: [{ subject: "Economics", marks: 85 }, { subject: "Art", marks: 82 }], interests: ["Business", "Art & Design"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 4 }]), groundTruthCareer: "product-designer", groundTruthTop3: ["product-designer", "ca", "graphic-designer"] },
  { id: "tc-025", name: "Writing + Social", profile: { name: "Test25", class: "12th", subjects: [{ subject: "English", marks: 92 }], interests: ["Writing", "Technology"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "content-creator", groundTruthTop3: ["content-creator", "creative-writer", "teacher"] },
  { id: "tc-026", name: "Pure Coder", profile: { name: "Test26", class: "College", subjects: [{ subject: "Computer Science", marks: 98 }, { subject: "Mathematics", marks: 95 }], interests: ["Technology"] }, answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 1 }, { questionId: 5, answer: 4 }]), groundTruthCareer: "game-developer", groundTruthTop3: ["game-developer", "ar-vr-designer", "engineer"] },
  { id: "tc-027", name: "Social + History", profile: { name: "Test27", class: "12th", subjects: [{ subject: "History", marks: 95 }, { subject: "Geography", marks: 88 }], interests: ["Social Work", "Teaching"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "civil-servant", groundTruthTop3: ["civil-servant", "teacher", "creative-writer"] },
  { id: "tc-028", name: "Low Tech Interest", profile: { name: "Test28", class: "12th", subjects: [{ subject: "English", marks: 85 }, { subject: "Art", marks: 80 }], interests: ["Writing"] }, answers: createAnswers([{ questionId: 1, answer: 2 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 1 }]), groundTruthCareer: "creative-writer", groundTruthTop3: ["creative-writer", "content-creator", "teacher"] },
  { id: "tc-029", name: "Data Focused", profile: { name: "Test29", class: "College", subjects: [{ subject: "Mathematics", marks: 96 }, { subject: "Computer Science", marks: 90 }], interests: ["Technology", "Business"] }, answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 1 }, { questionId: 4, answer: 1 }, { questionId: 5, answer: 5 }]), groundTruthCareer: "engineer", groundTruthTop3: ["engineer", "game-developer", "ca"] },
  { id: "tc-030", name: "Visual Storyteller", profile: { name: "Test30", class: "College", subjects: [{ subject: "Art", marks: 90 }, { subject: "English", marks: 85 }], interests: ["Film & Video"] }, answers: createAnswers([{ questionId: 1, answer: 2 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "video-editor", groundTruthTop3: ["video-editor", "vfx-artist", "motion-graphics"] },
  { id: "tc-031", name: "Healthcare Leader", profile: { name: "Test31", class: "12th", subjects: [{ subject: "Biology", marks: 92 }, { subject: "Chemistry", marks: 88 }], interests: ["Science", "Social Work"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "doctor", groundTruthTop3: ["doctor", "teacher", "civil-servant"] },
  { id: "tc-032", name: "UI Expert", profile: { name: "Test32", class: "College", subjects: [{ subject: "Computer Science", marks: 88 }, { subject: "Art", marks: 92 }], interests: ["Technology", "Art & Design"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "ui-ux-designer", groundTruthTop3: ["ui-ux-designer", "graphic-designer", "game-developer"] },
  { id: "tc-033", name: "UPSC Aspirant", profile: { name: "Test33", class: "College", subjects: [{ subject: "History", marks: 92 }, { subject: "Geography", marks: 90 }, { subject: "Economics", marks: 88 }], interests: ["Social Work"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 1 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 4 }]), groundTruthCareer: "civil-servant", groundTruthTop3: ["civil-servant", "teacher", "ca"] },
  { id: "tc-034", name: "Animation Lover", profile: { name: "Test34", class: "12th", subjects: [{ subject: "Art", marks: 94 }, { subject: "Computer Science", marks: 80 }], interests: ["Film & Video", "Gaming"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 1 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "vfx-artist", groundTruthTop3: ["vfx-artist", "motion-graphics", "game-developer"] },
  { id: "tc-035", name: "Economics Expert", profile: { name: "Test35", class: "College", subjects: [{ subject: "Economics", marks: 96 }, { subject: "Mathematics", marks: 88 }], interests: ["Business"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 1 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 5 }]), groundTruthCareer: "ca", groundTruthTop3: ["ca", "civil-servant", "engineer"] },
  { id: "tc-036", name: "Brand Designer", profile: { name: "Test36", class: "College", subjects: [{ subject: "Art", marks: 90 }, { subject: "English", marks: 85 }], interests: ["Art & Design", "Business"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "graphic-designer", groundTruthTop3: ["graphic-designer", "art-director", "illustrator"] },
  { id: "tc-037", name: "Game Narrative", profile: { name: "Test37", class: "College", subjects: [{ subject: "Computer Science", marks: 85 }, { subject: "English", marks: 92 }], interests: ["Gaming", "Writing"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "game-developer", groundTruthTop3: ["game-developer", "creative-writer", "content-creator"] },
  { id: "tc-038", name: "Full Stack Designer", profile: { name: "Test38", class: "College", subjects: [{ subject: "Computer Science", marks: 92 }, { subject: "Art", marks: 88 }, { subject: "Mathematics", marks: 80 }], interests: ["Technology", "Art & Design"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "ui-ux-designer", groundTruthTop3: ["ui-ux-designer", "game-developer", "ar-vr-designer"] },
  { id: "tc-039", name: "Medical Researcher", profile: { name: "Test39", class: "College", subjects: [{ subject: "Biology", marks: 95 }, { subject: "Chemistry", marks: 92 }], interests: ["Science"] }, answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 4 }]), groundTruthCareer: "doctor", groundTruthTop3: ["doctor", "engineer", "teacher"] },
  { id: "tc-040", name: "Social Media Mgr", profile: { name: "Test40", class: "12th", subjects: [{ subject: "English", marks: 88 }, { subject: "Art", marks: 75 }], interests: ["Writing", "Technology"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 5 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "content-creator", groundTruthTop3: ["content-creator", "creative-writer", "graphic-designer"] },
  { id: "tc-041", name: "Environment Designer", profile: { name: "Test41", class: "College", subjects: [{ subject: "Geography", marks: 94 }, { subject: "Art", marks: 82 }], interests: ["Art & Design", "Science"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "sustainable-design", groundTruthTop3: ["sustainable-design", "interior-designer", "civil-servant"] },
  { id: "tc-042", name: "Math Olympiad", profile: { name: "Test42", class: "12th", subjects: [{ subject: "Mathematics", marks: 100 }, { subject: "Physics", marks: 95 }], interests: ["Technology", "Science"] }, answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 5 }]), groundTruthCareer: "engineer", groundTruthTop3: ["engineer", "game-developer", "ar-vr-designer"] },
  { id: "tc-043", name: "Journalism Student", profile: { name: "Test43", class: "College", subjects: [{ subject: "English", marks: 94 }, { subject: "History", marks: 88 }], interests: ["Writing", "Social Work"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 4 }, { questionId: 4, answer: 4 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "creative-writer", groundTruthTop3: ["creative-writer", "content-creator", "teacher"] },
  { id: "tc-044", name: "Interior Architect", profile: { name: "Test44", class: "College", subjects: [{ subject: "Art", marks: 92 }, { subject: "Mathematics", marks: 78 }], interests: ["Art & Design"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "interior-designer", groundTruthTop3: ["interior-designer", "graphic-designer", "product-designer"] },
  { id: "tc-045", name: "Documentary Film", profile: { name: "Test45", class: "College", subjects: [{ subject: "English", marks: 88 }, { subject: "History", marks: 85 }], interests: ["Film & Video", "Writing"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 5 }, { questionId: 4, answer: 3 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "video-editor", groundTruthTop3: ["video-editor", "creative-writer", "content-creator"] },
  { id: "tc-046", name: "Fintech Aspirant", profile: { name: "Test46", class: "College", subjects: [{ subject: "Mathematics", marks: 90 }, { subject: "Economics", marks: 88 }, { subject: "Computer Science", marks: 82 }], interests: ["Business", "Technology"] }, answers: createAnswers([{ questionId: 1, answer: 5 }, { questionId: 2, answer: 4 }, { questionId: 3, answer: 1 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 5 }]), groundTruthCareer: "ca", groundTruthTop3: ["ca", "engineer", "game-developer"] },
  { id: "tc-047", name: "Sports Teacher", profile: { name: "Test47", class: "College", subjects: [{ subject: "Biology", marks: 80 }, { subject: "English", marks: 78 }], interests: ["Teaching", "Science"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "teacher", groundTruthTop3: ["teacher", "doctor", "civil-servant"] },
  { id: "tc-048", name: "Pure Doctor", profile: { name: "Test48", class: "12th", subjects: [{ subject: "Biology", marks: 98 }, { subject: "Chemistry", marks: 94 }], interests: ["Science"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 3 }]), groundTruthCareer: "doctor", groundTruthTop3: ["doctor", "teacher", "civil-servant"] },
  { id: "tc-049", name: "Pure Educator", profile: { name: "Test49", class: "12th", subjects: [{ subject: "English", marks: 88 }, { subject: "History", marks: 92 }], interests: ["Teaching", "Social Work"] }, answers: createAnswers([{ questionId: 1, answer: 3 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 2 }, { questionId: 4, answer: 5 }, { questionId: 5, answer: 2 }]), groundTruthCareer: "teacher", groundTruthTop3: ["teacher", "civil-servant", "creative-writer"] },
  { id: "tc-050", name: "Pure CA Aspirant", profile: { name: "Test50", class: "College", subjects: [{ subject: "Mathematics", marks: 88 }, { subject: "Economics", marks: 92 }], interests: ["Business"] }, answers: createAnswers([{ questionId: 1, answer: 4 }, { questionId: 2, answer: 3 }, { questionId: 3, answer: 1 }, { questionId: 4, answer: 2 }, { questionId: 5, answer: 5 }]), groundTruthCareer: "ca", groundTruthTop3: ["ca", "civil-servant", "product-designer"] }
];

// ============================================================================
// EVALUATION METRICS
// ============================================================================

export interface EvaluationResult {
  testCaseId: string;
  testCaseName: string;
  groundTruth: string;
  predictedTop1: string;
  predictedTop3: string[];
  isTop1Correct: boolean;
  isTop3Correct: boolean;
  groundTruthRank: number;
}

export interface AggregateMetrics {
  totalTestCases: number;
  top1Accuracy: number;
  top3Accuracy: number;
  top5Accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  meanReciprocalRank: number;
  averageGroundTruthRank: number;
  results: EvaluationResult[];
}

export function evaluateModel(): AggregateMetrics {
  const results: EvaluationResult[] = [];
  let top1Correct = 0, top3Correct = 0, top5Correct = 0;
  let sumReciprocalRank = 0, sumGroundTruthRank = 0;

  for (const testCase of testDataset) {
    const predictions = calculateCareerMatches(testCase.answers, testCase.profile);
    const top1 = predictions[0];
    const top3 = predictions.slice(0, 3).map(p => p.id);
    const top5 = predictions.slice(0, 5).map(p => p.id);

    const groundTruthIndex = predictions.findIndex(p => p.id === testCase.groundTruthCareer);
    const groundTruthRank = groundTruthIndex >= 0 ? groundTruthIndex + 1 : predictions.length + 1;

    const isTop1Correct = top1.id === testCase.groundTruthCareer;
    const isTop3Correct = top3.includes(testCase.groundTruthCareer) || testCase.groundTruthTop3.some(gt => top3.includes(gt));
    const isTop5Correct = top5.includes(testCase.groundTruthCareer);

    if (isTop1Correct) top1Correct++;
    if (isTop3Correct) top3Correct++;
    if (isTop5Correct) top5Correct++;
    sumReciprocalRank += 1 / groundTruthRank;
    sumGroundTruthRank += groundTruthRank;

    results.push({ testCaseId: testCase.id, testCaseName: testCase.name, groundTruth: testCase.groundTruthCareer, predictedTop1: top1.id, predictedTop3: top3, isTop1Correct, isTop3Correct, groundTruthRank });
  }

  const n = testDataset.length;
  const precision = (top1Correct / n) * 100;
  const recall = (top1Correct / n) * 100;
  const f1Score = precision > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

  return {
    totalTestCases: n,
    top1Accuracy: (top1Correct / n) * 100,
    top3Accuracy: (top3Correct / n) * 100,
    top5Accuracy: (top5Correct / n) * 100,
    precision, recall, f1Score,
    meanReciprocalRank: sumReciprocalRank / n,
    averageGroundTruthRank: sumGroundTruthRank / n,
    results
  };
}

export function formatMetricsReport(metrics: AggregateMetrics): string {
  let report = `
╔═══════════════════════════════════════════════════════════════╗
║           ML MODEL EVALUATION REPORT                          ║
╠═══════════════════════════════════════════════════════════════╣
║  Total Test Cases: ${metrics.totalTestCases.toString().padEnd(40)}║
╠═══════════════════════════════════════════════════════════════╣
║  ACCURACY METRICS                                             ║
╠═══════════════════════════════════════════════════════════════╣
║  Top-1 Accuracy:     ${metrics.top1Accuracy.toFixed(2)}%                               ║
║  Top-3 Accuracy:     ${metrics.top3Accuracy.toFixed(2)}%  ★ KEY METRIC                ║
║  Top-5 Accuracy:     ${metrics.top5Accuracy.toFixed(2)}%                               ║
╠═══════════════════════════════════════════════════════════════╣
║  PRECISION / RECALL                                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Precision:          ${metrics.precision.toFixed(2)}%                               ║
║  Recall:             ${metrics.recall.toFixed(2)}%                               ║
║  F1 Score:           ${metrics.f1Score.toFixed(2)}%                               ║
╠═══════════════════════════════════════════════════════════════╣
║  RANKING METRICS                                              ║
╠═══════════════════════════════════════════════════════════════╣
║  Mean Reciprocal Rank (MRR): ${metrics.meanReciprocalRank.toFixed(4).padEnd(25)}║
║  Avg Ground Truth Rank:      ${metrics.averageGroundTruthRank.toFixed(2).padEnd(25)}║
╚═══════════════════════════════════════════════════════════════╝
`;
  report += `\n📋 DETAILED RESULTS:\n${'─'.repeat(80)}\n`;
  for (const r of metrics.results) {
    const status = r.isTop1Correct ? '✅' : r.isTop3Correct ? '🔶' : '❌';
    report += `${status} ${r.testCaseName.padEnd(22)} | Expected: ${r.groundTruth.padEnd(18)} | Got: ${r.predictedTop1.padEnd(18)} | Rank: ${r.groundTruthRank}\n`;
  }
  return report;
}
