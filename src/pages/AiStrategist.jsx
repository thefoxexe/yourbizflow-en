import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const AiStrategist = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFeatureClick = (featureName) => {
    toast({
      title: t('ai_strategist.not_implemented_title'),
      description: t('ai_strategist.not_implemented_desc', { featureName }),
    });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-primary" />
          {t('ai_strategist.title')}
        </h1>
        <p className="text-muted-foreground">{t('ai_strategist.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <Lightbulb className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('ai_strategist.idea_generation_title')}</h2>
          <p className="text-muted-foreground mb-4">{t('ai_strategist.idea_generation_desc')}</p>
          <Button onClick={() => handleFeatureClick(t('ai_strategist.idea_generation_title'))} className="w-full">{t('ai_strategist.explore')}</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <TrendingUp className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('ai_strategist.market_analysis_title')}</h2>
          <p className="text-muted-foreground mb-4">{t('ai_strategist.market_analysis_desc')}</p>
          <Button onClick={() => handleFeatureClick(t('ai_strategist.market_analysis_title'))} className="w-full">{t('ai_strategist.analyze')}</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <Brain className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('ai_strategist.strategic_optimization_title')}</h2>
          <p className="text-muted-foreground mb-4">{t('ai_strategist.strategic_optimization_desc')}</p>
          <Button onClick={() => handleFeatureClick(t('ai_strategist.strategic_optimization_title'))} className="w-full">{t('ai_strategist.optimize')}</Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AiStrategist;