import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { assessmentQuestions } from "@/data/questions";
import { calculateCareerMatches } from "@/lib/careerMatcher";
import { ArrowLeft, ArrowRight, Sparkles, Brain } from "lucide-react";
import { toast } from "sonner";

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { userProfile, addAnswer, assessmentAnswers, setResults } = useAppContext();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    if (!userProfile) {
      navigate('/profile');
      return;
    }
    // Load existing answer if available
    const existingAnswer = assessmentAnswers.find(a => a.questionId === assessmentQuestions[currentQuestion].id);
    if (existingAnswer) {
      setSelectedValue(existingAnswer.answer.toString());
    } else {
      setSelectedValue("");
    }
  }, [currentQuestion, userProfile, navigate, assessmentAnswers]);

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  const handleNext = () => {
    if (!selectedValue) {
      toast.error("Please select an answer to continue");
      return;
    }

    addAnswer({
      questionId: question.id,
      answer: parseInt(selectedValue)
    });

    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedValue("");
    } else {
      // Calculate results
      const allAnswers = [
        ...assessmentAnswers.filter(a => a.questionId !== question.id),
        { questionId: question.id, answer: parseInt(selectedValue) }
      ];
      const results = calculateCareerMatches(allAnswers, userProfile!);
      setResults(results);
      navigate('/results');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate('/profile');
    }
  };

  const isMultipleChoice = question.options && question.options.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-secondary-foreground">Career Assessment</h1>
                <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {assessmentQuestions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary-foreground">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">{userProfile?.name}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </header>

      {/* Question Card */}
      <main className="max-w-3xl mx-auto p-6">
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-primary-foreground font-bold text-lg shrink-0">
                {currentQuestion + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                {question.question}
              </h2>
            </div>

            <RadioGroup value={selectedValue} onValueChange={setSelectedValue} className="space-y-3">
              {isMultipleChoice ? (
                // Multiple choice question
                question.options!.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
                      selectedValue === (index + 1).toString()
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedValue((index + 1).toString())}
                  >
                    <RadioGroupItem value={(index + 1).toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </div>
                ))
              ) : (
                // Agreement scale question
                [
                  { value: "1", label: "Strongly Disagree" },
                  { value: "2", label: "Disagree" },
                  { value: "3", label: "Neutral" },
                  { value: "4", label: "Agree" },
                  { value: "5", label: "Strongly Agree" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
                      selectedValue === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedValue(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={`scale-${option.value}`} />
                    <Label htmlFor={`scale-${option.value}`} className="flex-1 cursor-pointer text-base">
                      {option.label}
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" size="lg" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="hero" size="lg" onClick={handleNext} className="group">
            {currentQuestion === assessmentQuestions.length - 1 ? "See Results" : "Next"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentPage;
