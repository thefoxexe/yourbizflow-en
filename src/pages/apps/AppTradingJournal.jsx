import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart, FileText, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PublicHeader } from '@/pages/LandingPage';
import { MinimalFooter } from '@/components/ui/minimal-footer';
import { cn } from '@/lib/utils';


const AppTradingJournal = () => {
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

    const pageUrl = "https://yourbizflow.com/apps/trading-journal";
    const title = "Journal de Trading | YourBizFlow";
    const description = "Analysez vos performances de trading, identifiez vos forces et faiblesses, et optimisez votre stratégie avec le Journal de Trading de YourBizFlow.";
    const imageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200";

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Journal de Trading - YourBizFlow",
      "applicationCategory": "FinanceApplication",
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
        <meta name="keywords" content="journal de trading, trading, analyse de performance, stratégie de trading, PNL, YourBizFlow" />
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
            className={cn("relative w-48 h-48 flex items-center justify-center rounded-full mb-8", 'bg-green-500/10')}
          >
            <div className={cn("absolute inset-0 rounded-full ring-4", 'ring-green-500/30')}></div>
            <TrendingUp className={cn("w-24 h-24", 'text-green-300')} />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            Journal de Trading
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8"
          >
            Suivez, analysez et optimisez vos performances de trading. Prenez des décisions basées sur des données, pas des émotions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-indigo-500/30">
                Optimiser mon trading <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
        
        <section className="py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="relative w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-green-500/10" style={{ paddingTop: '56.25%' }}>
                    <iframe
                        src="https://www.youtube.com/embed/KQOsKHMuC8c?si=LGXeMZ1FHimjdfu0"
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
          <div className="container mx-auto px-6 max-w-4xl space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">Saisie Simplifiée, Analyse Puissante</h2>
                <p className="text-white/70 mb-6">
                  Enregistrez chaque position en quelques clics : actif, type de trade, P&L, et notes de stratégie. Notre système calcule automatiquement vos statistiques clés pour vous donner une vision claire de vos performances.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <BarChart className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Statistiques en temps réel (Win Rate, P&L moyen, Ratio R/R).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Historique complet de toutes vos positions, facile à filtrer et à analyser.</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img alt="Formulaire de saisie d'un nouveau trade dans le journal de trading" className="rounded-xl border border-white/10 shadow-lg" src="https://images.unsplash.com/photo-1627719172031-ab42dc849bc3?q=80&w=800" />
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                className="order-2 md:order-1"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img alt="Graphique d'évolution du capital dans le Journal de Trading" className="rounded-xl border border-white/10 shadow-lg" src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=800" />
              </motion.div>
              <motion.div
                className="order-1 md:order-2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">Visualisez Votre Croissance</h2>
                <p className="text-white/70 mb-6">
                  Suivez l'évolution de votre capital avec un graphique clair et motivant. Identifiez les périodes de haute performance et comprenez les phases de stagnation pour ajuster votre stratégie.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Graphique de P&L cumulé pour suivre votre progression.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Filtres par période pour analyser vos performances sur le court, moyen et long terme.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
    </div>
  );
};

export default AppTradingJournal;