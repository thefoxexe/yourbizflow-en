import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const EmailChangeConfirmation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const errorDescription = params.get('error_description');

    if (errorDescription) {
      toast({
        variant: "destructive",
        title: t('email_change_fail_title'),
        description: t('email_change_fail_desc'),
      });
    } else {
      toast({
        title: t('email_change_confirm_title'),
        description: t('email_change_confirm_desc'),
      });
    }

    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, navigate, t]);

  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1));
  const errorDescription = params.get('error_description');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030303]">
      <Helmet>
        <title>Confirmation de changement d'email - {t('app_name')}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 shadow-lg text-center"
      >
        {errorDescription ? (
          <XCircle className="w-24 h-24 mx-auto text-destructive" />
        ) : (
          <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
        )}
        
        <h1 className="text-3xl font-bold mt-6 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          {errorDescription ? t('email_change_fail_title') : t('email_change_confirm_title')}
        </h1>
        <p className="text-white/60 mb-8">
          {errorDescription 
            ? t('email_change_fail_desc')
            : t('email_change_confirm_desc')
          }
        </p>
        
        <Link to="/login">
          <button className="text-primary hover:underline">
            {t('back_to_login')}
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default EmailChangeConfirmation;