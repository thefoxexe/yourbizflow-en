import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PublicHeader } from '@/pages/LandingPage';
import { useTranslation } from 'react-i18next';

const LegalDialog = ({ isOpen, onOpenChange, title, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#030303] border-white/10 text-white max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="prose prose-invert prose-sm sm:prose-base overflow-y-auto flex-grow pr-4 text-white/80">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PrivacyPolicyContent = () => (
  <>
    <p className="text-white/60">Dernière mise à jour : 01/10/2025</p>
    <p>YourBizFlow ("nous", "notre" ou "nos") exploite le site web et l'application YourBizFlow (le "Service"). Cette page vous informe de nos politiques concernant la collecte, l'utilisation et la divulgation des données personnelles lorsque vous utilisez notre Service et les choix que vous avez associés à ces données.</p>
  </>
);

const TermsContent = () => (
  <>
    <p className="text-white/60">Dernière mise à jour : 01/10/2025</p>
    <p>Veuillez lire attentivement ces termes et conditions ("Termes", "Termes et Conditions") avant d'utiliser le site web et l'application YourBizFlow (le "Service") exploités par YourBizFlow.</p>
  </>
);

const About = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const isExternal = href.startsWith('/');
    const isAnchor = href.startsWith('#');

    if (isExternal) {
        navigate(href);
    } else if (isAnchor) {
        const hash = href;
        if (location.pathname !== '/welcome') {
            navigate(`/welcome${hash}`);
        } else {
            const id = hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                const yOffset = -80; // header height
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    }
  };

  useEffect(() => {
    if (location.pathname === '/about') {
        window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>{t('about')} - {t('app_name')}</title>
        <meta name="description" content="Découvrez la mission de YourBizFlow : simplifier la gestion d'entreprise pour les indépendants et les PME avec une plateforme tout-en-un." />
      </Helmet>

      <LegalDialog isOpen={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} title={t('footer_privacy')}>
        <PrivacyPolicyContent />
      </LegalDialog>
      <LegalDialog isOpen={isTermsOpen} onOpenChange={setIsTermsOpen} title={t('footer_terms')}>
        <TermsContent />
      </LegalDialog>

      <PublicHeader onNavClick={handleNavClick} />

      <main className="flex-grow">
        <div className="container mx-auto px-6 py-32 sm:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70" dangerouslySetInnerHTML={{ __html: t('page_about_title') }}>
              </h1>
              <div className="space-y-6 text-base md:text-lg text-white/70 leading-relaxed">
                <p>{t('page_about_p1')}</p>
                <p>{t('page_about_p2')}</p>
                <p>{t('page_about_p3')}</p>
                <p>{t('page_about_p4')}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-80 lg:h-full w-full rounded-2xl overflow-hidden"
            >
              <img
                className="w-full h-full object-cover"
                alt={t('page_about_image_alt')}
               src="https://images.unsplash.com/photo-1560821630-1a7c45c3286e" />
            </motion.div>
          </div>
        </div>
      </main>

      <MinimalFooter onPrivacyClick={() => setIsPrivacyOpen(true)} onTermsClick={() => setIsTermsOpen(true)} />
    </div>
  );
};

export default About;