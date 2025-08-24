import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function AuthDebugger() {
  const { user, session } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAuthTest = async () => {
    setIsLoading(true);
    try {
      // Test 1: Check current session
      const { data: currentSession } = await supabase.auth.getSession();
      
      // Test 2: Try to get current user ID from database
      const { data: dbAuthTest, error: dbError } = await supabase
        .rpc('get_current_user_role');
      
      // Test 3: Try a simple query that requires auth
      const { data: inspections, error: queryError } = await supabase
        .from('inspections')
        .select('id, user_id')
        .limit(1);

      setDebugInfo({
        frontendUser: {
          id: user?.id,
          email: user?.email,
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
        },
        currentSession: {
          userId: currentSession.session?.user?.id,
          hasToken: !!currentSession.session?.access_token,
          expiresAt: currentSession.session?.expires_at,
        },
        databaseTest: {
          result: dbAuthTest,
          error: dbError?.message,
        },
        queryTest: {
          result: inspections,
          error: queryError?.message,
        }
      });
    } catch (error) {
      console.error('Auth test error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    }
    setIsLoading(false);
  };

  const forceSessionRefresh = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      console.log('Session refresh result:', data, error);
      if (!error) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Auth Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAuthTest} disabled={isLoading}>
            Test Auth Status
          </Button>
          <Button variant="outline" onClick={forceSessionRefresh}>
            Refresh Session
          </Button>
        </div>
        
        {debugInfo && (
          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}