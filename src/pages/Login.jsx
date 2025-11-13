import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '@/lib/customSupabaseClient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: t('password_reset_error_title'),
        description: "Veuillez entrer votre email et votre mot de passe.",
      });
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
      });
    } else {
      toast({
        title: "Connexion réussie!",
        description: "Bienvenue sur votre tableau de bord.",
      });
      // The redirection is now handled by the AuthRedirect component in App.jsx
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.",
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: t('password_reset_error_title'),
        description: error.message,
      });
    } else {
      toast({
        title: t('password_reset_email_sent_title'),
        description: t('password_reset_email_sent_desc'),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030303]">
      <Helmet>
        <title>{t('login')} - {t('app_name')}</title>
        <meta name="description" content="Connectez-vous à votre compte YourBizFlow pour accéder à votre tableau de bord et gérer votre entreprise." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 shadow-lg"
      >
        <div className="text-center mb-8">
          <Link to="/welcome" className="inline-flex items-center gap-3 mb-4">
            <img src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png" alt="YourBizFlow Logo" className="w-12 h-12" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('app_name')}</h1>
          </Link>
          <p className="text-white/60">{t('login_title')}</p>
        </div>
        
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="email"
              placeholder={t('login_email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="password"
                placeholder={t('login_password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm text-primary hover:underline"
              >
                {t('login_forgot_password')}
              </button>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-base bg-white text-black hover:bg-white/90"
            >
              {isSubmitting ? 'Connexion...' : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {t('login_button')}
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0e0e10] px-2 text-white/60">{t('login_or_continue_with')}</span>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={signInWithGoogle}
            className="w-full py-3 text-base bg-transparent border-white/20 hover:bg-white/5 text-white"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            {t('login_with_google')}
          </Button>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/60">
            {t('login_no_account')}{' '}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              {t('signup')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;