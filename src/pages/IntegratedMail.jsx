import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Inbox, Send, DraftingCompass as Drafts, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const IntegratedMail = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleConnectGmail = () => {
    toast({
      title: t('workflow_automation.coming_soon_title'),
      description: t('workflow_automation.coming_soon_desc'),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Mail className="w-24 h-24 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('sidebar_module_integrated_mail')}</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">{t('module_integrated_mail_desc')}</p>
        <Button onClick={handleConnectGmail} size="lg">{t('login_with_google')}</Button>
      </motion.div>
    </div>
  );
};

export default IntegratedMail;