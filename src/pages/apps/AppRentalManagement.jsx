import React from 'react';
import { KeyRound, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PublicHeader } from '@/pages/LandingPage';
import { Helmet } from 'react-helmet';
import { MinimalFooter } from '@/components/ui/minimal-footer';

const AppRentalManagement = () => {
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
    
    const pageUrl = "https://yourbizflow.com/apps/rental-management";
    const title = "Gestion de Location | YourBizFlow";
    const description = "Optimisez la gestion de vos biens en location, suivez vos réservations et vos disponibilités en un seul endroit avec YourBizFlow.";
    const imageUrl = "https://images.unsplash.com/photo-1435527173128-983b87201f4d?q=80&w=1200";

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Gestion de Location - YourBizFlow",
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
        <div className="flex flex-col min-h-screen bg-[#030303] text-white">
             <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content="gestion de location, location de matériel, location de voiture, logiciel de location, YourBizFlow" />
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
            <main className="flex-grow pt-24">
                <section className="container mx-auto px-6 py-12 text-center">
                    <KeyRound className="w-24 h-24 mx-auto text-orange-300" />
                    <h1 className="text-5xl font-bold mt-6 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Gestion de Location</h1>
                    <p className="text-xl text-white/60 max-w-3xl mx-auto">
                        Gérez vos biens, vos réservations et vos disponibilités avec une simplicité déconcertante. De la voiture au matériel professionnel.
                    </p>
                </section>

                <section className="container mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                         <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <img alt="Calendrier de réservation pour la gestion de location" className="rounded-lg shadow-2xl" src="https://images.unsplash.com/photo-1435527173128-983b87201f4d?q=80&w=1200" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Une vue d'ensemble pour une gestion parfaite</h2>
                            <ul className="space-y-4 text-white/80">
                                <li className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <span>Ajoutez et organisez tous vos biens à louer (voitures, matériel, immobilier...) avec photos et tarifs.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <span>Visualisez toutes vos réservations sur un calendrier interactif pour ne jamais manquer une location.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <span>Gérez les statuts de vos biens (Disponible, Loué, Maintenance) pour un suivi précis de votre parc.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <span>Générez automatiquement une facture pour chaque réservation confirmée, intégrée à votre module de facturation.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">Maximisez la rentabilité de vos biens.</h2>
                    <p className="text-lg text-white/60 mb-8">Rejoignez YourBizFlow et ne laissez plus jamais un bien inoccupé par manque d'organisation.</p>
                    <Link to="/signup">
                        <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90">
                            Commencer gratuitement <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </section>
            </main>
            <MinimalFooter />
        </div>
    );
};

export default AppRentalManagement;