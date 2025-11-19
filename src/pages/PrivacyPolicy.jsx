
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Helmet } from 'react-helmet';
import PublicHeader from '@/components/PublicHeader';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
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
      intro: 'YourBizFlow ("nous", "notre" ou "nos") exploite le site web et l\'application YourBizFlow (le "Service"). Cette page vous informe de nos politiques concernant la collecte, l\'utilisation et la divulgation des données personnelles lorsque vous utilisez notre Service et les choix que vous avez associés à ces données.',
      section1Title: '1. Collecte et Utilisation des Informations',
      section1Content: 'Nous collectons plusieurs types d\'informations à diverses fins pour fournir et améliorer notre Service. Les types de données collectées incluent :',
      section1List: [
        'Données Personnelles : Lors de l\'utilisation de notre Service, nous pouvons vous demander de nous fournir certaines informations personnellement identifiables qui peuvent être utilisées pour vous contacter ou vous identifier ("Données Personnelles"). Celles-ci peuvent inclure, mais sans s\'y limiter : adresse e-mail, nom, prénom, et données d\'utilisation.',
        'Données d\'Utilisation : Nous pouvons également collecter des informations sur la manière dont le Service est accédé et utilisé. Ces données d\'utilisation peuvent inclure des informations telles que l\'adresse de protocole Internet de votre ordinateur (par exemple, l\'adresse IP), le type de navigateur, la version du navigateur, les pages de notre Service que vous visitez, l\'heure et la date de votre visite, le temps passé sur ces pages, et d\'autres données de diagnostic.'
      ],
      section2Title: '2. Utilisation des Données',
      section2Content: 'YourBizFlow utilise les données collectées pour diverses finalités :',
      section2List: [
        'Fournir, maintenir et améliorer notre Service.',
        'Vous notifier des changements apportés à notre Service.',
        'Vous permettre de participer aux fonctionnalités interactives de notre Service lorsque vous le souhaitez.',
        'Fournir un support client et répondre à vos demandes.',
        'Recueillir des analyses ou des informations précieuses afin d\'améliorer notre Service.',
        'Surveiller l\'utilisation de notre Service.',
        'Détecter, prévenir et résoudre les problèmes techniques.'
      ],
      section3Title: '3. Sécurité des Données',
      section3Content: 'La sécurité de vos données est importante pour nous, mais n\'oubliez pas qu\'aucune méthode de transmission sur Internet ou méthode de stockage électronique n\'est sûre à 100 %. Bien que nous nous efforçons d\'utiliser des moyens commercialement acceptables pour protéger vos Données Personnelles, nous ne pouvons garantir leur sécurité absolue.'
    },
    en: {
      lastUpdate: 'Last updated: October 30, 2025',
      intro: 'YourBizFlow ("we", "our" or "us") operates the YourBizFlow website and application (the "Service"). This page informs you of our policies regarding the collection, use and disclosure of personal data when you use our Service and the choices you have associated with that data.',
      section1Title: '1. Information Collection and Use',
      section1Content: 'We collect several different types of information for various purposes to provide and improve our Service to you. Types of data collected include:',
      section1List: [
        'Personal Data: While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to: email address, first name, last name, and usage data.',
        'Usage Data: We may also collect information on how the Service is accessed and used. This usage data may include information such as your computer\'s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.'
      ],
      section2Title: '2. Use of Data',
      section2Content: 'YourBizFlow uses the collected data for various purposes:',
      section2List: [
        'To provide, maintain and improve our Service.',
        'To notify you about changes to our Service.',
        'To allow you to participate in interactive features of our Service when you choose to do so.',
        'To provide customer support and respond to your requests.',
        'To gather analysis or valuable information so that we can improve our Service.',
        'To monitor the usage of our Service.',
        'To detect, prevent and address technical issues.'
      ],
      section3Title: '3. Data Security',
      section3Content: 'The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.'
    }
  };

  const data = isFr ? content.fr : content.en;

  return (
    <div className="w-full min-h-screen text-white bg-[#030303] flex flex-col">
      <Helmet>
        <title>{t('footer_privacy')} - {t('app_name')}</title>
        <meta name="description" content={isFr ? `Consultez la politique de confidentialité de ${t('app_name')}.` : `View ${t('app_name')}'s privacy policy.`} />
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
              <p className="text-white/80">{data.lastUpdate}</p>
              <p>{data.intro}</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">{data.section1Title}</h3>
              <p>{data.section1Content}</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                {data.section1List.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">{data.section2Title}</h3>
              <p>{data.section2Content}</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                {data.section2List.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

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

export default PrivacyPolicy;
