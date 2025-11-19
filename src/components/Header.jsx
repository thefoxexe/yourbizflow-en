import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, LogOut, Settings, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from 'react-i18next';

const Header = ({ onMenuClick }) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-white/10 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden text-muted-foreground"><Menu className="w-6 h-6" /></Button>
          
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
            {profile && profile.subscription_plan && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary border border-white/10 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground capitalize">{profile.subscription_plan.name}</span>
                </div>
                {(profile.subscription_plan.name.toLowerCase() === 'free' || profile.subscription_plan.name.toLowerCase() === 'pro') && (
                  <Button
                    size="sm"
                    onClick={() => window.open('https://billing.stripe.com/p/login/3cIfZi3ML4OwflKciwawo00', '_blank')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1 h-8 text-xs font-semibold"
                  >
                    {t('upgrade')}
                  </Button>
                )}
              </div>
            )}

            <LanguageSelector inHeader={true} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><User className="w-5 h-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.full_name || t('header_my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" />{t('header_settings')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="w-4 h-4 mr-2" />{t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;