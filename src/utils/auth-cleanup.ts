import { supabase } from '@/integrations/supabase/client';

// Complete authentication state cleanup utility
export const cleanupAuthState = () => {
  console.log('🧹 Cleaning up authentication state...');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('sb.')) {
      console.log('🗑️ Removing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if available
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('sb.')) {
        console.log('🗑️ Removing sessionStorage key:', key);
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.log('SessionStorage not available or already clean');
  }
  
  console.log('✅ Auth state cleanup completed');
};

// Force complete session refresh
export const forceAuthRefresh = async () => {
  console.log('🔄 Forcing authentication refresh...');
  
  try {
    // Step 1: Clean up existing state
    cleanupAuthState();
    
    // Step 2: Force sign out with global scope
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ Global sign out completed');
    } catch (error) {
      console.log('⚠️ Global sign out failed (continuing):', error);
    }
    
    // Step 3: Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 4: Force page reload for completely clean state  
    window.location.href = '/auth';
    
  } catch (error) {
    console.error('🚨 Auth refresh failed:', error);
    // Force reload anyway
    window.location.href = '/auth';
  }
};

// Enhanced sign-in with cleanup
export const robustSignIn = async (email: string, password: string) => {
  console.log('🔐 Starting robust sign-in for:', email);
  
  try {
    // Clean up existing state first
    cleanupAuthState();
    
    // Attempt sign out to clear any existing sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('⚠️ Pre-signin cleanup failed (continuing)');
    }
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Sign in with fresh state
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('🚨 Sign-in failed:', error);
      return { error };
    }
    
    if (data.user && data.session) {
      console.log('✅ Sign-in successful:', data.user.id);
      
      // Wait for session to be properly stored
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force page reload to ensure clean state
      window.location.href = '/';
      
      return { error: null };
    }
    
    return { error: new Error('No user or session returned') };
    
  } catch (error) {
    console.error('🚨 Robust sign-in error:', error);
    return { error };
  }
};