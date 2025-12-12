import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { Trophy, ArrowRight, LayoutDashboard, Sparkles, TrendingUp } from "lucide-react";

const ResultsPage = () => {
  const navigate = useNavigate();
  const { results, userProfile } = useAppContext();

  useEffect(() => {
    if (!results.length || !userProfile) {
      navigate('/');
    }
  }, [results, userProfile, navigate]);

  const topCareers = results.slice(0, 3);

  if (!topCareers.length) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero p-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-secondary-foreground">CareerPath AI</span>
          </div>
          
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 animate-pulse-glow">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-2">
              Your Results Are Ready!
            </h1>
            <p className="text-muted-foreground text-lg">
              Based on your profile and assessment, here are your top career matches
            </p>
          </div>
        </div>
      </header>

      {/* Results Cards */}
      <main className="max-w-4xl mx-auto px-6 -mt-12">
        <div className="space-y-6">
          {topCareers.map((career, index) => (
            <Card
              key={career.id}
              className="shadow-card overflow-hidden animate-slide-up hover:shadow-glow transition-smooth cursor-pointer"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              onClick={() => navigate(`/career/${career.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Rank indicator */}
                  <div className={`flex items-center justify-center p-6 md:w-32 ${
                    index === 0 ? "gradient-primary" : 
                    index === 1 ? "bg-secondary" : "bg-muted"
                  }`}>
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${
                        index === 0 ? "text-primary-foreground" : "text-foreground"
                      }`}>
                        #{index + 1}
                      </span>
                      {index === 0 && (
                        <p className="text-xs text-primary-foreground/80 mt-1">Best Match</p>
                      )}
                    </div>
                  </div>

                  {/* Career info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{career.icon}</span>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{career.title}</h2>
                          <p className="text-sm text-muted-foreground">{career.category}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <p className="text-muted-foreground mt-4 line-clamp-2">
                      {career.description}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Match Score
                        </span>
                        <span className="font-bold text-primary">{career.matchScore}%</span>
                      </div>
                      <Progress value={career.matchScore} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Careers Preview */}
        {results.length > 3 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              + {results.length - 3} more career matches available
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 pb-10">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="group"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Go to Dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
