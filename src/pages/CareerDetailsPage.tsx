import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";
import { careers } from "@/data/careers";
import { getRelatedCareers } from "@/lib/careerMatcher";
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  GraduationCap, 
  Lightbulb, 
  Map, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const CareerDetailsPage = () => {
  const navigate = useNavigate();
  const { careerId } = useParams();
  const { savedCareers, saveCareer, removeSavedCareer, results } = useAppContext();
  const [relatedCareers, setRelatedCareers] = useState(careers.slice(0, 3));

  const career = careers.find(c => c.id === careerId);
  const resultCareer = results.find(c => c.id === careerId);
  const isSaved = savedCareers.some(sc => sc.careerId === careerId);

  useEffect(() => {
    if (careerId) {
      const related = getRelatedCareers(careerId, 3);
      setRelatedCareers(related);
    }
  }, [careerId]);

  if (!career) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Career not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (isSaved) {
      const saved = savedCareers.find(sc => sc.careerId === careerId);
      if (saved) {
        removeSavedCareer(saved.id);
        toast.success("Career removed from saved list");
      }
    } else {
      saveCareer(careerId!);
      toast.success("Career saved successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="gradient-hero p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-secondary-foreground hover:bg-secondary/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant={isSaved ? "secondary" : "outline"}
              onClick={handleSave}
              className={isSaved ? "bg-primary/20 border-primary text-primary" : ""}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Career
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-7xl mb-6 block">{career.icon}</span>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              {career.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-2">
              {career.title}
            </h1>
            {resultCareer && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary/20 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">{resultCareer.matchScore}% Match</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 -mt-12 pb-12 space-y-6">
        {/* Description */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {career.description}
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {career.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="py-2 px-4">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Recommended Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {career.courses.map((course, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{course}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Career Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20" />
              <ul className="space-y-6">
                {career.roadmap.map((step, index) => (
                  <li key={index} className="relative pl-12">
                    <div className="absolute left-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-foreground pt-1">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Related Careers */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Similar Careers You Might Like</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedCareers.map((related) => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/career/${related.id}`)}
                  className="p-4 rounded-xl border border-border hover:border-primary hover:shadow-soft transition-smooth cursor-pointer"
                >
                  <span className="text-3xl block mb-2">{related.icon}</span>
                  <h3 className="font-semibold text-foreground">{related.title}</h3>
                  <p className="text-sm text-muted-foreground">{related.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CareerDetailsPage;
