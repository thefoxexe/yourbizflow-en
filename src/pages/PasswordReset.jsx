import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // This event fires when the user clicks the password recovery link.
        // The session is now active, and we can allow the user to update their password.
        setIsReady(true);
      }
    });

    // Also check if the URL already contains the recovery token fragment,
    // which happens on initial load after clicking the email link.
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
        setIsReady(true);
    }


    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
      });
      return;
    }

    setIsSubmitting(true);
    // When this component is rendered after clicking the link,
    // Supabase automatically handles the session. We just need to update the user.
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe. Le lien est peut-être expiré.",
      });
    } else {
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.",
      });
      navigate('/login');
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#030303] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-primary border-secondary rounded-full mb-4"
        />
        <p>Vérification du lien de réinitialisation...</p>
        <p className="text-sm text-muted-foreground mt-2">Si rien ne se passe, le lien est peut-être invalide ou a expiré.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030303]">
      <Helmet>
        <title>Réinitialiser le mot de passe - YourBizFlow</title>
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
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">YourBizFlow</h1>
          </Link>
          <p className="text-white/60">Choisissez un nouveau mot de passe</p>
        </div>
        
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              {isSubmitting ? 'Enregistrement...' : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default PasswordReset;