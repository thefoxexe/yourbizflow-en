
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import { PublicHeader } from '@/pages/LandingPage';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href.startsWith('#') ? `/welcome${href}` : href);
  };

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>{t('footer_terms')} - {t('app_name')}</title>
        <meta name="description" content={`Consultez les conditions d'utilisation de ${t('app_name')}.`} />
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
                <p className="text-white/80">Dernière mise à jour : 30/10/2025</p>
                <p>Veuillez lire attentivement ces termes et conditions ("Termes", "Termes et Conditions") avant d'utiliser le site web et l'application YourBizFlow (le "Service") exploités par YourBizFlow.</p>
                <p>Votre accès et votre utilisation du Service sont conditionnés par votre acceptation et votre respect de ces Termes. Ces Termes s'appliqueront à tous les visiteurs, utilisateurs et autres personnes qui accèdent ou utilisent le Service.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Comptes</h3>
                <p>Lorsque vous créez un compte chez nous, vous devez nous fournir des informations exactes, complètes et à jour à tout moment. Le non-respect de cette obligation constitue une violation des Termes, ce qui peut entraîner la résiliation immédiate de votre compte sur notre Service. Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service et de toute activité ou action effectuée sous votre mot de passe.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-white">2. Propriété Intellectuelle</h3>
                <p>Le Service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive de YourBizFlow et de ses concédants de licence. Le Service est protégé par le droit d'auteur, le droit des marques et d'autres lois de France et des pays étrangers. Nos marques et notre habillage commercial ne peuvent être utilisés en relation avec un produit ou un service sans le consentement écrit préalable de YourBizFlow.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-white">3. Résiliation</h3>
                <p>Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans s'y limiter, si vous ne respectez pas les Termes. En cas de résiliation, votre droit d'utiliser le Service cessera immédiatement. Si vous souhaitez résilier votre compte, vous pouvez simplement cesser d'utiliser le Service.</p>
            </div>
          </motion.div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default TermsOfService;
