import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Target, Brain, Rocket, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/profile');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-secondary-foreground">CareerPath AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-secondary-foreground hover:bg-secondary/20"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-primary/30 text-secondary-foreground hover:bg-primary/10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-slide-up max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Machine Learning</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-secondary-foreground mb-6 leading-tight">
            Discover Your
            <span className="text-gradient block">Perfect Career Path</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
            AI-powered career recommendations based on your interests, grades, and personality traits. Find the career that's right for you.
          </p>

          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate('/auth')}
            className="group"
          >
            <span>Get Started</span>
            <Rocket className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          {[
            { icon: Target, title: "Personalized Analysis", desc: "Based on your unique profile" },
            { icon: Brain, title: "ML Algorithm", desc: "Decision Tree & KNN powered" },
            { icon: Sparkles, title: "20+ Careers", desc: "Comprehensive recommendations" }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card/10 backdrop-blur-sm border border-border/20 text-left animate-slide-up"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-secondary-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 CareerPath AI. Guiding students to their dream careers.
        </p>
      </footer>
    </div>
  );
};

export default WelcomePage;
