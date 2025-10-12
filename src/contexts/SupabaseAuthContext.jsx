import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/lib/customSupabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(undefined);

  const performSignOut = useCallback(() => {
    setUser(null);
    setProfile(undefined);
    setSession(null);
    navigate("/welcome", { replace: true });
  }, [navigate]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    }
    performSignOut();
    return { error: null };
  }, [performSignOut]);

  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null);
        return null;
      }
      try {
        const { data, error, status } = await supabase
          .from("profiles")
          .select("*, subscription_plan:subscription_plan_id(*)")
          .eq("id", userId)
          .maybeSingle();

        if (error && status !== 406) {
          throw error;
        }

        if (data && data.subscription_plan_id) {
          setProfile(data);
          return data;
        } else {
          setProfile(null);
          return null;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Profile error",
          description: "Unable to load profile information.",
        });
        setProfile(null);
        return null;
      }
    },
    [toast]
  );

  useEffect(() => {
    setLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        if (
          _event === "SIGNED_IN" ||
          _event === "INITIAL_SESSION" ||
          _event === "TOKEN_REFRESHED"
        ) {
          await fetchProfile(currentUser.id);
        }
      } else {
        setProfile(undefined);
      }
      setLoading(false);
    });

    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(
    async (email, password, metadata = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "An error has occurred.",
        });
      }

      return { user: data.user, error };
    },
    [toast]
  );

  const signIn = useCallback(
    async (email, password) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: error.message || "Incorrect email or password.",
        });
        setLoading(false);
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }
      setLoading(false);
      return { error: null };
    },
    [toast, fetchProfile]
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Google connection error",
        description: error.message,
      });
    }
  }, [toast]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const updateActiveModules = useCallback(
    async (newModules) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .update({ active_modules: newModules })
        .eq("id", user.id)
        .select("*, subscription_plan:subscription_plan_id(*)")
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to update modules.",
        });
      } else {
        setProfile(data);
        toast({ title: "Modules updated!" });
      }
    },
    [user, toast]
  );

  const value = useMemo(() => {
    const getPlan = () => {
      if (!profile || !profile.subscription_plan) return "Free";
      return profile.subscription_plan.name;
    };

    const planName = getPlan();
    const planHierarchy = { Free: 0, Pro: 1, Business: 2 };
    const userPlanLevel = planHierarchy[planName] ?? -1;

    return {
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      refreshProfile,
      updateActiveModules,
      getPlan,
      hasPermission: (requiredPlan) => {
        const requiredPlanLevel = planHierarchy[requiredPlan] ?? 99;
        return userPlanLevel >= requiredPlanLevel;
      },
      isModuleActive: (moduleName) => {
        if (!profile) return false;
        const coreModules = ["dashboard", "marketplace"];
        if (coreModules.includes(moduleName)) {
          return true;
        }
        return profile.active_modules?.includes(moduleName);
      },
    };
  }, [
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    refreshProfile,
    updateActiveModules,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
