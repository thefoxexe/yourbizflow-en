import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Bot, Mail, Users, ArrowRight, CheckCircle, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PublicHeader, navLinks } from '../LandingPage';
import { MinimalFooter } from '@/components/ui/minimal-footer';
import { cn } from '@/lib/utils';


const AppAiWritingAssistant = () => {
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
    
    const pageUrl = "https://yourbizflow.com/apps/ai-writing-assistant";
    const title = "AI Writing Assistant | YourBizFlow";
    const description = "Découvrez l'AI Writing Assistant de YourBizFlow. Générez du contenu professionnel en un clic : emails, posts LinkedIn, descriptions de produits, et plus encore.";
    const imageUrl = "https://images.unsplash.com/photo-1677696795198-5ac0e21060ed?q=80&w=1200";

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AI Writing Assistant - YourBizFlow",
      "applicationCategory": "ProductivityApplication",
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
        <div className="w-full text-white bg-[#030303]">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content="assistant d'écriture IA, générateur de contenu, rédaction automatique, marketing de contenu, YourBizFlow" />
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
            <PublicHeader navLinks={navLinks} onNavClick={handleNavClick} />
            <main className="pt-24">
                <section className="container mx-auto px-6 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block bg-violet-500/10 text-violet-400 p-3 rounded-xl mb-4">
                            <Bot className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                            AI Writing Assistant
                        </h1>
                        <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-8">
                            Ne soyez plus jamais à court de mots. Générez du contenu de qualité professionnelle en quelques secondes, de l'email de prospection au post LinkedIn engageant.
                        </p>
                        <Link to="/signup">
                            <Button size="lg" className="bg-white text-black hover:bg-white/90">
                                Essayer l'Assistant IA <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="relative w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-violet-500/10" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                src="https://www.youtube.com/embed/TFV0xNzv9e8?si=ma3DUWUSL-Te7LYF"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur-xl opacity-20"></div>
                                <div className="relative bg-card p-4 rounded-lg shadow-lg">
                                    <img alt="Capture d'écran de l'interface de l'AI Writing Assistant" className="rounded-md shadow-2xl" src="https://images.unsplash.com/photo-1677696795198-5ac0e21060ed?q=80&w=800" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-bold">Votre partenaire créatif</h2>
                            <p className="text-white/70">
                                L'AI Writing Assistant est intégré à YourBizFlow pour vous aider là où vous en avez le plus besoin. Gagnez un temps précieux et assurez-vous que chaque communication est percutante et professionnelle.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                                    <span><strong className="text-white">Génération multi-contenus :</strong> Emails, posts pour réseaux sociaux, descriptions de produits, messages courts... L'IA s'adapte à vos besoins.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                                    <span><strong className="text-white">Ton et style personnalisables :</strong> Choisissez le ton (formel, amical, persuasif...) et la longueur pour un résultat parfaitement adapté à votre audience.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                                    <span><strong className="text-white">Suggestions et réécriture :</strong> Obtenez plusieurs variantes pour chaque demande et affinez le texte généré jusqu'à ce qu'il soit parfait.</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </section>
                
                <section className="py-20 bg-white/5">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-10">Cas d'usage principaux</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-card p-8 rounded-lg">
                                <Mail className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Emails Professionnels</h3>
                                <p className="text-white/60">Générez des emails de prospection, de relance ou de suivi qui captent l'attention et obtiennent des réponses.</p>
                            </div>
                            <div className="bg-card p-8 rounded-lg">
                                <Users className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Posts LinkedIn</h3>
                                <p className="text-white/60">Créez des posts engageants pour développer votre marque personnelle ou promouvoir votre entreprise sur LinkedIn.</p>
                            </div>
                            <div className="bg-card p-8 rounded-lg">
                                <BrainCircuit className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Descriptions de produits</h3>
                                <p className="text-white/60">Rédigez des descriptions de produits vendeuses et optimisées pour le SEO qui convertissent les visiteurs en clients.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MinimalFooter onPrivacyClick={() => {}} onTermsClick={() => {}} />
        </div>
    );
};

export default AppAiWritingAssistant;