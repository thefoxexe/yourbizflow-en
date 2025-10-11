import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Bot, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const WorkflowAutomation = () => {
  const { toast } = useToast();

  const handleComingSoon = () => {
    toast({
      title: "Bientôt disponible !",
      description: "Ce module est en cours de construction. Revenez bientôt pour automatiser votre business !",
    });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Automatisation Workflow</h1>
        <p className="text-muted-foreground">Créez des flux de travail automatisés pour gagner du temps.</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-2">L'automatisation arrive à grands pas !</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Imaginez connecter vos applications, automatiser les tâches répétitives et laisser votre business tourner tout seul. C'est ce qui vous attend ici très prochainement.
        </p>
        <div className="flex flex-wrap justify-center gap-4 my-6">
          <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-medium">Création de tâches auto</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-medium">Notifications intelligentes</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
            <Workflow className="w-5 h-5 text-primary" />
            <span className="font-medium">Synchronisation des données</span>
          </div>
        </div>
        <Button onClick={handleComingSoon}>Me tenir au courant</Button>
      </motion.div>
    </div>
  );
};

export default WorkflowAutomation;