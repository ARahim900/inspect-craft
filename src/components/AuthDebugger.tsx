import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cleanupAuthState, forceAuthRefresh } from '@/utils/auth-cleanup';

export function AuthDebugger() {
  const { user, session } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAuthTest = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running comprehensive auth test...');
      
      // Test 1: Check current session
      const { data: currentSession } = await supabase.auth.getSession();
      
      // Test 2: Try to get current user role from database
      const { data: dbRoleTest, error: roleError } = await supabase
        .rpc('get_current_user_role');
      
      // Test 3: Try a simple authenticated query
      const { data: inspections, error: queryError } = await supabase
        .from('inspections')
        .select('id, user_id, client_name')
        .limit(5);

      // Test 4: Check localStorage for auth keys
      const authKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('sb.')
      );

      const result = {
        timestamp: new Date().toISOString(),
        frontendAuth: {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          sessionExpiry: session?.expires_at,
        },
        supabaseSession: {
          hasSession: !!currentSession.session,
          userId: currentSession.session?.user?.id,
          email: currentSession.session?.user?.email,
          hasAccessToken: !!currentSession.session?.access_token,
          expiresAt: currentSession.session?.expires_at,
          tokenType: currentSession.session?.token_type,
        },
        databaseAuth: {
          roleResult: dbRoleTest,
          roleError: roleError?.message,
          queryResult: inspections?.length || 0,
          queryError: queryError?.message,
        },
        localStorage: {
          authKeysFound: authKeys.length,
          authKeys: authKeys,
        }
      };
      
      console.log('🔍 Auth test results:', result);
      setDebugInfo(result);
    } catch (error) {
      console.error('🚨 Auth test failed:', error);
      setDebugInfo({ 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString() 
      });
    }
    setIsLoading(false);
  };

  const handleForceRefresh = async () => {
    await forceAuthRefresh();
  };

  const handleCleanupOnly = () => {
    cleanupAuthState();
    setDebugInfo({ message: 'Auth state cleaned. Please sign in again.', timestamp: new Date().toISOString() });
  };

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-orange-800 dark:text-orange-200">🔧 Auth Debugger & Fixer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={runAuthTest} disabled={isLoading} variant="outline">
            🔍 Test Auth Status
          </Button>
          <Button onClick={handleCleanupOnly} variant="outline">
            🧹 Clean Auth State
          </Button>
          <Button onClick={handleForceRefresh} variant="destructive">
            🔄 Force Complete Refresh
          </Button>
        </div>
        
        {debugInfo && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Debug Results:</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96 border">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}