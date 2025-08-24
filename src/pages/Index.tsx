import InspectionApp from "@/components/InspectionApp";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, LogOut, User } from "lucide-react";
import { getDisplayName } from "@/utils/user";

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
        <InspectionApp user={user} profile={profile} onSignOut={signOut} />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
