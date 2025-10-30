
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import { PublicHeader } from '@/pages/LandingPage';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href.startsWith('#') ? `/welcome${href}` : href);
  };

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>{t('footer_privacy')} - {t('app_name')}</title>
        <meta name="description" content={`Consultez la politique de confidentialité de ${t('app_name')}.`} />
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
              {t('footer_privacy')}
            </h1>
            <div className="prose prose-lg prose-invert mx-auto text-white">
              <p className="text-white/80">Dernière mise à jour : 30/10/2025</p>
              <p>YourBizFlow ("nous", "notre" ou "nos") exploite le site web et l'application YourBizFlow (le "Service"). Cette page vous informe de nos politiques concernant la collecte, l'utilisation et la divulgation des données personnelles lorsque vous utilisez notre Service et les choix que vous avez associés à ces données.</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Collecte et Utilisation des Informations</h3>
              <p>Nous collectons plusieurs types d'informations à diverses fins pour fournir et améliorer notre Service. Les types de données collectées incluent :</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Données Personnelles :</strong> Lors de l'utilisation de notre Service, nous pouvons vous demander de nous fournir certaines informations personnellement identifiables qui peuvent être utilisées pour vous contacter ou vous identifier ("Données Personnelles"). Celles-ci peuvent inclure, mais sans s'y limiter : adresse e-mail, nom, prénom, et données d'utilisation.</li>
                <li><strong>Données d'Utilisation :</strong> Nous pouvons également collecter des informations sur la manière dont le Service est accédé et utilisé. Ces données d'utilisation peuvent inclure des informations telles que l'adresse de protocole Internet de votre ordinateur (par exemple, l'adresse IP), le type de navigateur, la version du navigateur, les pages de notre Service que vous visitez, l'heure et la date de votre visite, le temps passé sur ces pages, et d'autres données de diagnostic.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">2. Utilisation des Données</h3>
              <p>YourBizFlow utilise les données collectées pour diverses finalités :</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Fournir, maintenir et améliorer notre Service.</li>
                <li>Vous notifier des changements apportés à notre Service.</li>
                <li>Vous permettre de participer aux fonctionnalités interactives de notre Service lorsque vous le souhaitez.</li>
                <li>Fournir un support client et répondre à vos demandes.</li>
                <li>Recueillir des analyses ou des informations précieuses afin d'améliorer notre Service.</li>
                <li>Surveiller l'utilisation de notre Service.</li>
                <li>Détecter, prévenir et résoudre les problèmes techniques.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">3. Sécurité des Données</h3>
              <p>La sécurité de vos données est importante pour nous, mais n'oubliez pas qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est sûre à 100 %. Bien que nous nous efforçons d'utiliser des moyens commercialement acceptables pour protéger vos Données Personnelles, nous ne pouvons garantir leur sécurité absolue.</p>
            </div>
          </motion.div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default PrivacyPolicy;
