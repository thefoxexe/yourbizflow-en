import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Bot, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const WorkflowAutomation = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleComingSoon = () => {
    toast({
      title: t('workflow_automation.coming_soon_title'),
      description: t('workflow_automation.coming_soon_desc'),
    });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('workflow_automation.title')}</h1>
        <p className="text-muted-foreground">{t('workflow_automation.subtitle')}</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="bg-card/50 backdrop-blur-sm border rounded-xl p-8 text-center flex flex-col items-center"
      >
        <div className="p-4 bg-primary/10 rounded-full mb-6">
          <Workflow className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('workflow_automation.main_title')}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          {t('workflow_automation.main_desc')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 my-6">
          <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-medium">{t('workflow_automation.feature1')}</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-medium">{t('workflow_automation.feature2')}</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
            <Workflow className="w-5 h-5 text-primary" />
            <span className="font-medium">{t('workflow_automation.feature3')}</span>
          </div>
        </div>
        <Button onClick={handleComingSoon}>{t('workflow_automation.notify_me')}</Button>
      </motion.div>
    </div>
  );
};

export default WorkflowAutomation;