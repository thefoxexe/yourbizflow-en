import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error);
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = useCallback(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
            setProfile(null);
            return;
        };
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`*, subscription_plan:subscription_plan_id(*)`)
                .eq('id', currentUser.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                if (error.code === 'PGRST116') {
                  setProfile(null);
                }
            } else {
                setProfile(data);
            }
        } catch (e) {
            console.error('Caught exception fetching profile:', e);
        }
    }, []);

    useEffect(() => {
        const getInitialSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await refreshProfile();
            }
            setLoading(false);
        };
        
        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (event === 'SIGNED_IN' && currentUser) {
                setLoading(true);
                await refreshProfile();
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [refreshProfile]);

    const signUp = async (email, password, metadata) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });
        return { user: data.user, error };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) {
            toast({
                variant: "destructive",
                title: "Erreur d'authentification",
                description: error.message,
            });
        }
    };

    const getPlan = () => profile?.subscription_plan?.name || 'Free';

    const hasPermission = (requiredPlan) => {
        const plansOrder = { 'Free': 1, 'Pro': 2, 'Business': 3 };
        const currentPlan = getPlan();
        const currentPlanLevel = plansOrder[currentPlan] || 0;
        const requiredPlanLevel = plansOrder[requiredPlan] || 0;
        return currentPlanLevel >= requiredPlanLevel;
    };

    const isModuleActive = (moduleId) => {
        if (!profile || !profile.active_modules) return false;
        return profile.active_modules.includes(moduleId);
    };

    const toggleModule = async (moduleId) => {
        if (!user) return;
        const currentModules = profile?.active_modules || [];
        
        const newModules = currentModules.includes(moduleId)
            ? currentModules.filter(id => id !== moduleId)
            : [...currentModules, moduleId];

        const { data, error } = await supabase
            .from('profiles')
            .update({ active_modules: newModules })
            .eq('id', user.id)
            .select(`*, subscription_plan:subscription_plan_id(*)`)
            .single();

        if (error) {
            console.error('Error toggling module:', error);
        } else {
            setProfile(data);
        }
    };

    const value = {
        user,
        profile,
        loading,
        signOut,
        signUp,
        signInWithGoogle,
        getPlan,
        hasPermission,
        isModuleActive,
        toggleModule,
        refreshProfile,
        setProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};