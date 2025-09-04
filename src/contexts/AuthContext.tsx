import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isUser, validateAndParseUser } from '@/lib/type-guards';
import { optimizedQueries, SupabaseError } from '@/lib/supabase-utils';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'leader' | 'member';
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, churchName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isLeader: boolean;
  isMember: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced profile refresh with validation and error handling
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const profileData = await optimizedQueries.getUserProfile(user.id);
      
      // Validate profile data structure
      if (profileData) {
        setProfile(profileData as Profile);
      } else {
        console.error('Invalid profile data received:', profileData);
        toast({
          title: "Erro de Dados",
          description: "Dados do perfil inválidos. Tente fazer login novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error instanceof SupabaseError) {
        toast({
          title: "Erro ao Carregar Perfil",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  }, [user?.id]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when authenticated
        if (session?.user) {
          refreshProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, churchName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
          church_name: churchName,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Permission checking
  const hasPermission = useCallback((permission: string): boolean => {
    if (!profile) return false;
    
    // Admin has all permissions
    if (profile.role === 'admin') return true;
    
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      leader: [
        'view_members', 'create_appointments', 'manage_events',
        'view_reports', 'edit_member_basic_info'
      ],
      member: [
        'view_own_appointments', 'register_for_events', 'view_public_events'
      ]
    };

    return rolePermissions[profile.role]?.includes(permission) || false;
  }, [profile]);

  const isAdmin = profile?.role === 'admin';
  const isLeader = profile?.role === 'leader' || profile?.role === 'admin';
  const isMember = profile?.role === 'member' || isLeader;

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAdmin,
    isLeader,
    isMember,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}