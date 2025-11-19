import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UpgradePlanDialog = ({ open, onOpenChange, feature = "cette fonctionnalité", requiredPlan = "Pro" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    navigate('/upgrade');
    onOpenChange(false);
  };

  const getPlanMessage = () => {
    if (requiredPlan === 'Business') {
      return t('upgrade_dialog_business_required');
    } else if (requiredPlan === 'Pro') {
      return t('upgrade_dialog_pro_or_business_required');
    }
    return t('upgrade_dialog_pro_business');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">{t('upgrade_dialog_title')}</DialogTitle>
          </motion.div>
          <DialogDescription className="text-base">
            {t('upgrade_dialog_description', { feature })}
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="py-6"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">{getPlanMessage()}</p>
                <p className="text-sm text-muted-foreground">
                  {t('upgrade_dialog_unlock')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {t('upgrade_dialog_later')}
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Crown className="w-4 h-4 mr-2" />
            {t('upgrade_dialog_view_plans')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePlanDialog;
