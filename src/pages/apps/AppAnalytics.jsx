import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/pages/LandingPage';
import { MinimalFooter } from '@/components/ui/minimal-footer';
import { ArrowRight, BarChart3, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppAnalytics = () => {
  const color = 'text-red-400';
  const bgColor = 'bg-red-500/10';
  const ringColor = 'ring-red-500/30';
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, href, callback) => {
    e.preventDefault();
    if (callback) callback();

    const isExternal = href.startsWith('/');
    const isAnchor = href.startsWith('#');

    const scrollToAnchor = (hash) => {
        const id = hash.substring(1);
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                const yOffset = -80;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 0);
    };

    if (isExternal) {
        navigate(href);
    } else if (isAnchor) {
        if (location.pathname !== '/welcome') {
            navigate(`/welcome${href}`);
        } else {
            scrollToAnchor(href);
        }
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Suivi en Temps Réel",
      description: "Visualisez vos revenus, dépenses et bénéfices au moment où ils se produisent."
    },
    {
      icon: Target,
      title: "Rapports Personnalisés",
      description: "Créez des rapports sur mesure pour analyser les aspects les plus importants de votre business."
    },
    {
      icon: Lightbulb,
      title: "Insights Intelligents",
      description: "Recevez des suggestions basées sur vos données pour identifier des opportunités de croissance."
    }
  ];

  const pageUrl = "https://yourbizflow.com/apps/analytics";
  const title = "Analytique | YourBizFlow – Tableaux de bord et rapports";
  const description = "Prenez des décisions basées sur les données grâce aux tableaux de bord analytiques de YourBizFlow. Suivez vos revenus, votre rentabilité et vos indicateurs clés.";
  const imageUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Analytique - YourBizFlow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": description,
    "url": pageUrl,
    "image": imageUrl,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "author": {
      "@type": "Organization",
      "name": "YourBizFlow"
    }
  };

  return (
    <div className="w-full text-white bg-[#030303] overflow-x-hidden">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="analytique, reporting, tableau de bord, KPI, business intelligence, PME, YourBizFlow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <PublicHeader onNavClick={handleNavClick} />
      <main className="pt-24">
        <section className="container mx-auto px-6 py-20 text-center flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className={cn("relative w-48 h-48 flex items-center justify-center rounded-full mb-8", bgColor)}
          >
            <div className={cn("absolute inset-0 rounded-full ring-4", ringColor)}></div>
            <BarChart3 className={cn("w-24 h-24", color)} />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            Vos Données, Vos Décisions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8"
          >
            Transformez vos données brutes en informations exploitables. Suivez vos indicateurs de performance clés (KPIs) en temps réel et pilotez votre croissance avec des tableaux de bord clairs et personnalisables.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-indigo-500/30">
                Découvrir mes KPIs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
        
        <section className="py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="relative w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-red-500/10" style={{ paddingTop: '56.25%' }}>
                    <iframe
                        src="https://www.youtube.com/embed/f0U0FgkBOg8?si=jX0GkTzSydHc2aND"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                    ></iframe>
                </div>
            </div>
        </section>

        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Fonctionnalités Clés</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 text-center"
                >
                  <div className="inline-block p-3 rounded-full bg-white/5 mb-4">
                    <feature.icon className={cn("w-8 h-8", color)} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white/90">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Pourquoi choisir l'Analytique YourBizFlow ?</h2>
             <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Ne naviguez plus à l'aveugle. Notre module analytique vous donne une vision à 360° de votre activité pour que chaque décision soit la bonne. Identifiez ce qui fonctionne, corrigez ce qui ne va pas, et accélérez votre croissance.
             </p>
          </div>
        </section>

      </main>
      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default AppAnalytics;