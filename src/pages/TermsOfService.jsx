
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import PublicHeader from '@/components/PublicHeader';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isFr = location.pathname.startsWith('/fr');

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href.startsWith('#') ? `/welcome${href}` : href);
  };

  const content = {
    fr: {
      lastUpdate: 'Dernière mise à jour : 30/10/2025',
      intro1: 'Veuillez lire attentivement ces termes et conditions ("Termes", "Termes et Conditions") avant d\'utiliser le site web et l\'application YourBizFlow (le "Service") exploités par YourBizFlow.',
      intro2: 'Votre accès et votre utilisation du Service sont conditionnés par votre acceptation et votre respect de ces Termes. Ces Termes s\'appliqueront à tous les visiteurs, utilisateurs et autres personnes qui accèdent ou utilisent le Service.',
      section1Title: '1. Comptes',
      section1Content: 'Lorsque vous créez un compte chez nous, vous devez nous fournir des informations exactes, complètes et à jour à tout moment. Le non-respect de cette obligation constitue une violation des Termes, ce qui peut entraîner la résiliation immédiate de votre compte sur notre Service. Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service et de toute activité ou action effectuée sous votre mot de passe.',
      section2Title: '2. Propriété Intellectuelle',
      section2Content: 'Le Service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive de YourBizFlow et de ses concédants de licence. Le Service est protégé par le droit d\'auteur, le droit des marques et d\'autres lois de France et des pays étrangers. Nos marques et notre habillage commercial ne peuvent être utilisés en relation avec un produit ou un service sans le consentement écrit préalable de YourBizFlow.',
      section3Title: '3. Résiliation',
      section3Content: 'Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans s\'y limiter, si vous ne respectez pas les Termes. En cas de résiliation, votre droit d\'utiliser le Service cessera immédiatement. Si vous souhaitez résilier votre compte, vous pouvez simplement cesser d\'utiliser le Service.'
    },
    en: {
      lastUpdate: 'Last updated: October 30, 2025',
      intro1: 'Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the YourBizFlow website and application (the "Service") operated by YourBizFlow.',
      intro2: 'Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.',
      section1Title: '1. Accounts',
      section1Content: 'When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.',
      section2Title: '2. Intellectual Property',
      section2Content: 'The Service and its original content, features and functionality are and will remain the exclusive property of YourBizFlow and its licensors. The Service is protected by copyright, trademark and other laws of France and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of YourBizFlow.',
      section3Title: '3. Termination',
      section3Content: 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.'
    }
  };

  const data = isFr ? content.fr : content.en;

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>{t('footer_terms')} - {t('app_name')}</title>
        <meta name="description" content={isFr ? `Consultez les conditions d'utilisation de ${t('app_name')}.` : `View ${t('app_name')}'s terms of service.`} />
      </Helmet>

      <PublicHeader onNavClick={handleNavClick} />

      <main className="flex-grow pt-32">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              {t('footer_terms')}
            </h1>
            <div className="prose prose-lg prose-invert mx-auto text-white">
                <p className="text-white/80">{data.lastUpdate}</p>
                <p>{data.intro1}</p>
                <p>{data.intro2}</p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-white">{data.section1Title}</h3>
                <p>{data.section1Content}</p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-white">{data.section2Title}</h3>
                <p>{data.section2Content}</p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-white">{data.section3Title}</h3>
                <p>{data.section3Content}</p>
            </div>
          </motion.div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default TermsOfService;
