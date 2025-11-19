import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: "/about", labelKey: "about" },
  { href: "#features", labelKey: "mini_apps" },
  { href: "#download", labelKey: "download" },
  { href: "#testimonials", labelKey: "testimonials" },
  { href: "#pricing", labelKey: "pricing" },
  { href: "#faq", labelKey: "faq" },
];

const LanguageSwitcher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const currentLang = location.pathname.startsWith('/fr') ? 'fr' : 'en';
  
  // Mapping between French and English URLs
  const urlMapping = {
    '/fr/facturation': '/en/billing',
    '/en/billing': '/fr/facturation',
    '/fr/crm': '/en/crm',
    '/en/crm': '/fr/crm',
    '/fr/projets': '/en/projects',
    '/en/projects': '/fr/projets',
    '/fr/depenses': '/en/expenses',
    '/en/expenses': '/fr/depenses',
    '/fr/inventaire': '/en/inventory',
    '/en/inventory': '/fr/inventaire',
    '/fr/devis': '/en/quotes',
    '/en/quotes': '/fr/devis',
    '/fr/suivi-temps': '/en/time-tracking',
    '/en/time-tracking': '/fr/suivi-temps',
    '/fr/gestionnaire-taches': '/en/task-manager',
    '/en/task-manager': '/fr/gestionnaire-taches',
    '/fr/analytique': '/en/analytics',
    '/en/analytics': '/fr/analytique',
    '/fr/ressources-humaines': '/en/hr',
    '/en/hr': '/fr/ressources-humaines',
    '/fr/automatisation': '/en/workflow',
    '/en/workflow': '/fr/automatisation',
    '/fr/assistant-redaction': '/en/ai-writing',
    '/en/ai-writing': '/fr/assistant-redaction',
    '/fr/budget': '/en/budget',
    '/en/budget': '/fr/budget',
    '/fr/gestion-stock': '/en/stock-management',
    '/en/stock-management': '/fr/gestion-stock',
    '/fr/paiements-recurrents': '/en/recurring-payments',
    '/en/recurring-payments': '/fr/paiements-recurrents',
    '/fr/gestion-location': '/en/rental-management',
    '/en/rental-management': '/fr/gestion-location',
    '/fr/confidentialite': '/en/privacy',
    '/en/privacy': '/fr/confidentialite',
    '/fr/conditions': '/en/terms',
    '/en/terms': '/fr/conditions',
  };
  
  const handleLanguageSwitch = (newLang) => {
    const currentPath = location.pathname;
    
    // Check if we have a direct mapping
    if (urlMapping[currentPath]) {
      i18n.changeLanguage(newLang);
      navigate(urlMapping[currentPath]);
    } else {
      // Fallback to welcome page if no mapping found
      i18n.changeLanguage(newLang);
      navigate('/welcome');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
      <button
        onClick={() => handleLanguageSwitch('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLang === 'en' 
            ? 'bg-white text-black' 
            : 'text-white/60 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageSwitch('fr')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLang === 'fr' 
            ? 'bg-white text-black' 
            : 'text-white/60 hover:text-white'
        }`}
      >
        FR
      </button>
    </div>
  );
};

const PublicHeader = ({ onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleNavClick = (e, href, closeMenu) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      // If we're not on the home page, navigate there first
      if (window.location.pathname !== '/welcome') {
        window.location.href = '/welcome' + href;
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      if (closeMenu) closeMenu();
    } else if (onNavClick) {
      onNavClick(e, href);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/welcome" className="flex items-center gap-3">
          <img src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png" alt="YourBizFlow Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('app_name')}</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <a key={link.labelKey} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-sm text-white/80 hover:text-white transition-colors">
              {t(link.labelKey)}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">{t('login')}</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white/90 text-black hover:bg-white">{t('signup')}</Button>
          </Link>
        </div>
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/20 backdrop-blur-lg"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col items-center gap-4">
              {navLinks.map(link => (
                <a key={link.labelKey} href={link.href} onClick={(e) => { handleNavClick(e, link.href, () => setIsMenuOpen(false)); }} className="text-lg text-white/80 hover:text-white transition-colors w-full text-center py-2">
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="w-full border-t border-white/10 my-2"></div>
              <LanguageSwitcher />
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full text-white/80 hover:text-white hover:bg-white/10">{t('login')}</Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full bg-white/90 text-black hover:bg-white">{t('signup')}</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicHeader;
