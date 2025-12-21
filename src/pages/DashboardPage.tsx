import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { careers } from "@/data/careers";
import { 
  Sparkles, 
  BookmarkCheck, 
  RotateCcw, 
  LogOut, 
  ArrowRight,
  User,
  ClipboardList,
  FolderHeart
} from "lucide-react";
import { toast } from "sonner";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile, savedCareers, removeSavedCareer, resetAssessment, results } = useAppContext();
  const { signOut, user } = useAuth();

  const savedCareerDetails = savedCareers.map(sc => {
    const career = careers.find(c => c.id === sc.careerId);
    const resultCareer = results.find(c => c.id === sc.careerId);
    return {
      ...sc,
      career,
      matchScore: resultCareer?.matchScore
    };
  }).filter(sc => sc.career);

  const handleRetakeTest = () => {
    resetAssessment();
    navigate('/assessment');
    toast.success("Assessment reset! Let's begin again.");
  };

  const handleLogout = async () => {
    await signOut();
    resetAssessment();
    navigate('/');
    toast.success("Logged out successfully");
  };
  
  const displayName = userProfile?.name || user?.user_metadata?.name || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-secondary-foreground">CareerPath AI</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-secondary-foreground hover:bg-secondary/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-foreground">
                Welcome back, {displayName}!
              </h1>
              <p className="text-muted-foreground">
                {userProfile?.class} • {userProfile?.interests?.length || 0} interests
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subjects Added</p>
                <p className="text-2xl font-bold text-foreground">{userProfile?.subjects?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Career Matches</p>
                <p className="text-2xl font-bold text-foreground">{results.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderHeart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Careers</p>
                <p className="text-2xl font-bold text-foreground">{savedCareers.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Careers */}
        <Card className="shadow-card mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-primary" />
              Saved Careers
            </CardTitle>
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => navigate('/results')}>
                View All Results
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {savedCareerDetails.length === 0 ? (
              <div className="text-center py-12">
                <FolderHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No careers saved yet</p>
                {results.length > 0 ? (
                  <Button variant="outline" onClick={() => navigate('/results')}>
                    Browse Career Matches
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate('/assessment')}>
                    Take Assessment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {savedCareerDetails.map(({ id, career, matchScore }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:shadow-soft transition-smooth cursor-pointer"
                    onClick={() => navigate(`/career/${career?.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{career?.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{career?.title}</h3>
                        <p className="text-sm text-muted-foreground">{career?.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {matchScore && (
                        <span className="text-sm font-medium text-primary">{matchScore}% Match</span>
                      )}
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRetakeTest}
            className="group"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retake Assessment
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
