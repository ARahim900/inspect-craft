import InspectionApp from "@/components/InspectionApp";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, LogOut, User } from "lucide-react";

const Index = () => {
  const { user, profile, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center mb-4">
            <Building2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Building Inspection</h1>
          <p className="text-xl text-muted-foreground">
            Professional property inspection management system
          </p>
          <div className="space-y-4">
            <Link to="/auth">
              <Button size="lg" className="w-full">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Building Inspection</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.role === 'admin' ? 'Administrator Dashboard' : 'Staff Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.email}</span>
                <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  {profile?.role}
                </span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        
        <main>
          <InspectionApp />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
