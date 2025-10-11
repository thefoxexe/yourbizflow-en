import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AiStrategist = () => {
  const { toast } = useToast();

  const handleFeatureClick = (featureName) => {
    toast({
      title: "🚧 Fonctionnalité non implémentée",
      description: `La fonctionnalité "${featureName}" n'est pas encore disponible. Vous pouvez la demander dans votre prochaine requête ! 🚀`,
    });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-primary" />
          AI Business Strategist
        </h1>
        <p className="text-muted-foreground">Obtenez des insights et des stratégies basées sur l'IA pour développer votre entreprise.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <Lightbulb className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Génération d'Idées</h2>
          <p className="text-muted-foreground mb-4">L'IA vous aide à brainstormer de nouvelles idées de produits, services ou campagnes marketing.</p>
          <Button onClick={() => handleFeatureClick("Génération d'Idées")} className="w-full">Explorer</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <TrendingUp className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analyse de Marché</h2>
          <p className="text-muted-foreground mb-4">Obtenez des analyses approfondies des tendances du marché et de la concurrence.</p>
          <Button onClick={() => handleFeatureClick("Analyse de Marché")} className="w-full">Analyser</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-6 flex flex-col items-center text-center shadow-sm"
        >
          <Brain className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Optimisation Stratégique</h2>
          <p className="text-muted-foreground mb-4">Recevez des recommandations personnalisées pour optimiser votre stratégie commerciale.</p>
          <Button onClick={() => handleFeatureClick("Optimisation Stratégique")} className="w-full">Optimiser</Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AiStrategist;