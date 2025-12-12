import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { UserProfile, SubjectMark } from "@/types/career";
import { ArrowLeft, ArrowRight, Plus, X, User, BookOpen, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "English", "Art", "Economics", "History", "Geography"
];

const interestOptions = [
  "Technology", "Art & Design", "Writing", "Science", "Business",
  "Teaching", "Social Work", "Gaming", "Film & Video", "Fashion"
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useAppContext();
  
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const addSubject = () => {
    if (!selectedSubject || !marks) {
      toast.error("Please select a subject and enter marks");
      return;
    }
    if (subjectMarks.some(sm => sm.subject === selectedSubject)) {
      toast.error("Subject already added");
      return;
    }
    const marksNum = parseInt(marks);
    if (marksNum < 0 || marksNum > 100) {
      toast.error("Marks should be between 0 and 100");
      return;
    }
    setSubjectMarks([...subjectMarks, { subject: selectedSubject, marks: marksNum }]);
    setSelectedSubject("");
    setMarks("");
  };

  const removeSubject = (subject: string) => {
    setSubjectMarks(subjectMarks.filter(sm => sm.subject !== subject));
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else if (interests.length < 5) {
      setInterests([...interests, interest]);
    } else {
      toast.error("Maximum 5 interests allowed");
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!studentClass) {
      toast.error("Please select your class");
      return;
    }
    if (subjectMarks.length < 3) {
      toast.error("Please add at least 3 subjects");
      return;
    }
    if (interests.length < 2) {
      toast.error("Please select at least 2 interests");
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      class: studentClass,
      subjects: subjectMarks,
      interests
    };
    
    setUserProfile(profile);
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-secondary-foreground hover:bg-secondary/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-secondary-foreground">Create Your Profile</h1>
              <p className="text-muted-foreground">Tell us about yourself to get personalized recommendations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Basic Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class / Grade</Label>
                <Select value={studentClass} onValueChange={setStudentClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {["9th", "10th", "11th", "12th", "Undergraduate", "Graduate"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Subjects & Marks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.filter(s => !subjectMarks.some(sm => sm.subject === s)).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  placeholder="Marks"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
              <Button onClick={addSubject} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {subjectMarks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {subjectMarks.map(sm => (
                  <Badge key={sm.subject} variant="secondary" className="py-2 px-3 text-sm">
                    {sm.subject}: {sm.marks}%
                    <button
                      onClick={() => removeSubject(sm.subject)}
                      className="ml-2 hover:text-destructive transition-smooth"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">Add at least 3 subjects with your marks</p>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Your Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer py-2 px-4 text-sm transition-smooth ${
                    interests.includes(interest) 
                      ? "bg-primary hover:bg-primary/90" 
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Select 2-5 interests that excite you</p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end pb-8">
          <Button variant="hero" size="lg" onClick={handleSubmit} className="group">
            Take Assessment
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
