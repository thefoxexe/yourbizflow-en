import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, X, CheckCircle, Circle, Building, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const OnboardingGuide = ({ openCompanyDialog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCompleted = localStorage.getItem('onboardingCompleted');
    if (storedCompleted) {
      setCompletedSteps(JSON.parse(storedCompleted));
    }
    const storedDismissed = localStorage.getItem('onboardingDismissed');
    if (storedDismissed === 'true') {
      setIsDismissed(true);
    } else {
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  const handleCompleteStep = (stepId) => {
    if (completedSteps.includes(stepId)) return;
    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    localStorage.setItem('onboardingCompleted', JSON.stringify(newCompletedSteps));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsOpen(false);
    localStorage.setItem('onboardingDismissed', 'true');
  };

  const steps = [
    {
      id: 'company_data',
      icon: Building,
      title: 'Configurer votre entreprise',
      description: 'Essentiel pour vos factures et devis.',
      action: () => {
        openCompanyDialog();
        handleCompleteStep('company_data');
      },
    },
    {
      id: 'marketplace',
      icon: Store,
      title: 'Explorer la Marketplace',
      description: 'Activez les modules dont vous avez besoin.',
      action: () => {
        navigate('/marketplace');
        handleCompleteStep('marketplace');
      },
    },
  ];

  const completedCount = completedSteps.length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  if (isDismissed && !isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-5 right-5 z-50"
      >
        <Button
          size="icon"
          className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Rocket className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-5 right-5 z-50 w-96 bg-card border border-border rounded-xl shadow-2xl"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Rocket className="text-primary" />
                  Guide de démarrage
                </h3>
                <p className="text-sm text-muted-foreground">Bienvenue ! Suivez ces étapes pour commencer.</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={step.action}
                    className={cn(
                      "w-full text-left p-4 rounded-lg transition-all flex items-center gap-4",
                      isCompleted ? "bg-green-500/10" : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{completedCount}/{totalSteps}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {completedCount === totalSteps && (
               <Button variant="outline" className="w-full mt-4" onClick={handleDismiss}>
                Terminé, ne plus afficher
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingGuide;