import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useSpring } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, Info, Menu, X, BadgePercent, ChevronLeft, ChevronRight, User, Award, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import CurrencySelector, { PriceDisplay } from '@/components/CurrencySelector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageCurrencySelector';
import { allFeatures } from '@/components/MarketplaceCard';

const AnimatedCounter = ({ value, isFloat = false, useComma = true }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const springValue = useSpring(0, { damping: 50, stiffness: 200 });

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        if (isFloat) {
          const formatted = latest.toFixed(1);
          ref.current.textContent = useComma ? formatted.replace('.', ',') : formatted;
        } else {
          ref.current.textContent = Math.round(latest);
        }
      }
    });
    return () => unsubscribe();
  }, [springValue, isFloat, useComma]);

  if (isFloat) {
    return <span ref={ref}>0,0</span>;
  }
  return <span ref={ref}>0</span>;
};

const SocialProofSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { t } = useTranslation();

    return (
        <section className="py-20" ref={ref}>
            <div className="container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-8 justify-center items-center"
                >
                    <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-2xl p-8 backdrop-blur-sm w-full sm:w-auto text-center">
                        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
                        <div className="relative flex flex-col items-center">
                            <div className="relative">
                                <User className="w-8 h-8 text-white/60 mb-3" />
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                </span>
                            </div>
                            <p className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                                <AnimatedCounter value={100} />+
                            </p>
                            <p className="text-white/60 mt-2 font-medium">{t('active_users')}</p>
                        </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-2xl p-8 backdrop-blur-sm w-full sm:w-auto text-center">
                        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
                        <div className="relative flex flex-col items-center">
                            <Award className="w-8 h-8 text-white/60 mb-3" />
                            <div className="text-4xl md:text-5xl font-bold text-white tracking-tighter flex items-center">
                                <AnimatedCounter value={4.9} isFloat={true} useComma={false} />
                                <span className="text-white/60 text-2xl md:text-3xl">/5</span>
                            </div>
                            <p className="text-white/60 mt-2 font-medium">{t('average_rating')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};


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
    <p className="text-white/60">Dernière mise à jour : 11/10/2025</p>
    <p>YourBizFlow ("nous", "notre" ou "nos") exploite le site web et l'application YourBizFlow (le "Service"). Cette page vous informe de nos politiques concernant la collecte, l'utilisation et la divulgation des données personnelles lorsque vous utilisez notre Service et les choix que vous avez associés à ces données.</p>
    
    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Collecte et Utilisation des Informations</h3>
    <p>Nous collectons plusieurs types d'informations à diverses fins pour fournir et améliorer notre Service. Les types de données collectées incluent :</p>
    <ul className="list-disc pl-6 space-y-2 mt-2">
      <li><strong>Données Personnelles :</strong> Lors de l'utilisation de notre Service, nous pouvons vous demander de nous fournir certaines informations personnellement identifiables qui peuvent être utilisées pour vous contacter ou vous identifier ("Données Personnelles"). Celles-ci peuvent inclure, mais sans s'y limiter : adresse e-mail, nom, prénom, et données d'utilisation.</li>
      <li><strong>Données d'Utilisation :</strong> Nous pouvons également collecter des informations sur la manière dont le Service est accédé et utilisé. Ces données d'utilisation peuvent inclure des informations telles que l'adresse de protocole Internet de votre ordinateur (par exemple, l'adresse IP), le type de navigateur, la version du navigateur, les pages de notre Service que vous visitez, l'heure et la date de votre visite, le temps passé sur ces pages, le temps passé sur ces pages, et d'autres données de diagnostic.</li>
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
  </>
);

const TermsContent = () => (
  <>
    <p className="text-white/60">Dernière mise à jour : 11/10/2025</p>
    <p>Veuillez lire attentivement ces termes et conditions ("Termes", "Termes et Conditions") avant d'utiliser le site web et l'application YourBizFlow (le "Service") exploités par YourBizFlow.</p>
    <p>Votre accès et votre utilisation du Service sont conditionnés par votre acceptation et votre respect de ces Termes. Ces Termes s'appliqueront à tous les visiteurs, utilisateurs et autres personnes qui accèdent ou utilisent le Service.</p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Comptes</h3>
    <p>Lorsque vous créez un compte chez nous, vous devez nous fournir des informations exactes, complètes et à jour à tout moment. Le non-respect de cette obligation constitue une violation des Termes, ce qui peut entraîner la résiliation immédiate de votre compte sur notre Service. Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service et de toute activité ou action effectuée sous votre mot de passe.</p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">2. Propriété Intellectuelle</h3>
    <p>Le Service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive de YourBizFlow et de ses concédants de licence. Le Service est protégé par le droit d'auteur, le droit des marques et d'autres lois de France et des pays étrangers. Nos marques et notre habillage commercial ne peuvent être utilisés en relation avec un produit ou un service sans le consentement écrit préalable de YourBizFlow.</p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">3. Résiliation</h3>
    <p>Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans s'y limiter, si vous ne respectez pas les Termes. En cas de résiliation, votre droit d'utiliser le Service cessera immédiatement. Si vous souhaitez résilier votre compte, vous pouvez simplement cesser d'utiliser le Service.</p>
  </>
);

const PlanDetailsDialog = ({ isOpen, onOpenChange, plan, t }) => {
  if (!plan) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#030303] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{t('plan_details_title', { planName: t(`plan_${plan.name.toLowerCase()}`) })}</DialogTitle>
          <DialogDescription className="text-white/60">
            {t('plan_details_description', { planName: t(`plan_${plan.name.toLowerCase()}`) })}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-4 max-h-96 overflow-y-auto">
          {Array.isArray(plan.fullFeatures) && plan.fullFeatures.map((featureKey, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-white/80">{t(featureKey)}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

const FaqSection = () => {
  const { t } = useTranslation();
  const faqs = [
    { qKey: "faq1_q", aKey: "faq1_a" },
    { qKey: "faq2_q", aKey: "faq2_a" },
    { qKey: "faq3_q", aKey: "faq3_a" },
    { qKey: "faq4_q", aKey: "faq4_a" },
    { qKey: "faq5_q", aKey: "faq5_a" },
    { qKey: "faq6_q", aKey: "faq6_a" },
    { qKey: "faq7_q", aKey: "faq7_a" }
  ];

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('faq_title')}</h2>
          <p className="text-white/60 max-w-2xl mx-auto">{t('faq_subtitle')}</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{t(faq.qKey)}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-left">
                {t(faq.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const TestimonialsCarousel = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const testimonials = [
    { nameKey: "testimonial1_name", companyKey: "testimonial1_company", textKey: "testimonial1_text", avatarKey: "testimonial1_avatar_alt" },
    { nameKey: "testimonial2_name", companyKey: "testimonial2_company", textKey: "testimonial2_text", avatarKey: "testimonial2_avatar_alt" },
    { nameKey: "testimonial3_name", companyKey: "testimonial3_company", textKey: "testimonial3_text", avatarKey: "testimonial3_avatar_alt" },
    { nameKey: "testimonial4_name", companyKey: "testimonial4_company", textKey: "testimonial4_text", avatarKey: "testimonial4_avatar_alt" },
    { nameKey: "testimonial5_name", companyKey: "testimonial5_company", textKey: "testimonial5_text", avatarKey: "testimonial5_avatar_alt" },
    { nameKey: "testimonial6_name", companyKey: "testimonial6_company", textKey: "testimonial6_text", avatarKey: "testimonial6_avatar_alt" },
    { nameKey: "testimonial7_name", companyKey: "testimonial7_company", textKey: "testimonial7_text", avatarKey: "testimonial7_avatar_alt" },
    { nameKey: "testimonial8_name", companyKey: "testimonial8_company", textKey: "testimonial8_text", avatarKey: "testimonial8_avatar_alt" }
  ];

  const images = [
    <img alt={t("testimonial1_avatar_alt")} src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial2_avatar_alt")} src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial3_avatar_alt")} src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial4_avatar_alt")} src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial5_avatar_alt")} src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial6_avatar_alt")} src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial7_avatar_alt")} src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop" />,
    <img alt={t("testimonial8_avatar_alt")} src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" />
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative overflow-hidden max-w-2xl mx-auto">
        <div className="relative h-64 sm:h-56">
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-6 h-full flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-muted">
                      {React.cloneElement(images[index], { className: "w-full h-full object-cover" })}
                  </div>
                  <div>
                    <p className="font-semibold text-white/90">{t(testimonials[index].nameKey)}</p>
                    <p className="text-sm text-white/60">{t(testimonials[index].companyKey)}</p>
                  </div>
                </div>
                <p className="text-white/70 mb-4 text-base sm:text-lg italic">"{t(testimonials[index].textKey)}"</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-y-0 -left-4 sm:-left-16 flex items-center">
        <Button variant="ghost" size="icon" onClick={handlePrev} className="bg-white/5 hover:bg-white/10 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 -right-4 sm:-right-16 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleNext} className="bg-white/5 hover:bg-white/10 rounded-full">
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={cn("w-2 h-2 rounded-full transition-colors", i === index ? "bg-white" : "bg-white/40 hover:bg-white/70")}></button>
        ))}
      </div>
    </div>
  );
};

const CtaSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 md:p-12 overflow-hidden text-center">
          <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('cta_title')}</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">{t('cta_subtitle')}</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 shadow-lg">
                {t('start_adventure')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('contact_us')}</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">{t('contact_subtitle')}</p>
        </div>
        <form name="contact" method="POST" data-netlify="true" onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="form-name" value="contact" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="sr-only">{t('contact_name_placeholder')}</Label>
              <Input type="text" name="name" id="name" placeholder={t('contact_name_placeholder')} required className="bg-white/5 border-white/10 placeholder:text-white/40" />
            </div>
            <div>
              <Label htmlFor="email" className="sr-only">{t('contact_email_placeholder')}</Label>
              <Input type="email" name="email" id="email" placeholder={t('contact_email_placeholder')} required className="bg-white/5 border-white/10 placeholder:text-white/40" />
            </div>
          </div>
          <div>
            <Label htmlFor="message" className="sr-only">{t('contact_message_placeholder')}</Label>
            <Textarea name="message" id="message" rows="4" placeholder={t('contact_message_placeholder')} required className="bg-white/5 border-white/10 placeholder:text-white/40"></Textarea>
          </div>
          <div className="text-center">
            <Button type="submit" size="lg" className="bg-[#C5B3FF] hover:bg-[#b2a1e6] text-black rounded-lg px-8">
              {t('contact_send_button')}
            </Button>
          </div>
          <AnimatePresence>
            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-green-400 text-center mt-4"
              >
                {t('contact_success_message')}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
};

const navLinks = [
  { href: "/about", labelKey: "about" },
  { href: "#features", labelKey: "mini_apps" },
  { href: "#download", labelKey: "download" },
  { href: "#testimonials", labelKey: "testimonials" },
  { href: "#pricing", labelKey: "pricing" },
  { href: "#faq", labelKey: "faq" },
];

const PublicHeader = ({ onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-lg border-b border-white/10 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/welcome" className="flex items-center gap-3">
          <img src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png" alt="YourBizFlow Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('app_name')}</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <a key={link.labelKey} href={link.href} onClick={(e) => onNavClick(e, link.href)} className="text-sm text-white/80 hover:text-white transition-colors">
              {t(link.labelKey)}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSelector />
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
                <a key={link.labelKey} href={link.href} onClick={(e) => { onNavClick(e, link.href, () => setIsMenuOpen(false)); }} className="text-lg text-white/80 hover:text-white transition-colors w-full text-center py-2">
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="w-full border-t border-white/10 my-2"></div>
              <LanguageSelector />
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

const useResponsiveCarouselSpeed = () => {
  const [duration, setDuration] = useState(25);

  useEffect(() => {
    const getSpeed = () => {
      if (window.innerWidth < 768) {
        return 15;
      }
      return 25;
    };

    setDuration(getSpeed());

    const handleResize = () => {
      setDuration(getSpeed());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return duration;
};

const FeaturesCarousel = () => {
  const { t } = useTranslation();
  const duplicatedFeatures = [...allFeatures, ...allFeatures];
  const duration = useResponsiveCarouselSpeed();

  return (
    <div className="relative w-full overflow-hidden group [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <motion.div
        className="flex gap-6"
        animate={{ x: ['0%', `-100%`] }}
        style={{ width: `${(allFeatures.length * (144 + 24))}px` }}
        transition={{
          ease: 'linear',
          duration: duration,
          repeat: Infinity,
        }}
      >
        {duplicatedFeatures.map((feature, index) => (
          <Link to={feature.path} key={`${feature.module_key}-${index}`} className="flex-shrink-0">
            <motion.div 
              className={cn(
                "relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-2 transition-all duration-300",
                "hover:bg-white/10 hover:border-white/20 group-hover:[animation-play-state:paused]"
              )}
            >
              <feature.icon className={cn("w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 transition-colors duration-300", feature.color)} />
              <h3 className="text-xs font-semibold text-white/80">{t(feature.labelKey)}</h3>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

const LandingPage = () => {
  const { t } = useTranslation();
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isBlackFridayVisible, setIsBlackFridayVisible] = useState(true);
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

  useEffect(() => {
    if (location.pathname === '/welcome' && location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const plans = [
    { name: "Free", prices: { monthly: { eur: "0", usd: "0", chf: "0" } }, features: ['plan_free_feature1', 'plan_free_feature2', 'plan_free_feature3', 'plan_free_feature4'], fullFeatures: ['plan_free_full_feature1', 'plan_free_full_feature2', 'plan_free_full_feature3', 'plan_free_full_feature4', 'plan_free_full_feature5'] },
    { name: "Pro", prices: { monthly: { eur: "8.99", usd: "9.99", chf: "8.99" }, yearly: { eur: "86.30", usd: "95.90", chf: "86.30" } }, features: ['plan_pro_feature1', 'plan_pro_feature2', 'plan_pro_feature3', 'plan_pro_feature4'], fullFeatures: ['plan_pro_full_feature1', 'plan_pro_full_feature2', 'plan_pro_full_feature3', 'plan_pro_full_feature4', 'plan_pro_full_feature5', 'plan_pro_full_feature6', 'plan_pro_full_feature7'] },
    { name: "Business", prices: { monthly: { eur: "24.99", usd: "29.99", chf: "24.99" }, yearly: { eur: "239.90", usd: "287.30", chf: "239.90" } }, features: ['plan_business_feature1', 'plan_business_feature2', 'plan_business_feature3', 'plan_business_feature4'], fullFeatures: ['plan_business_full_feature1', 'plan_business_full_feature2', 'plan_business_full_feature3', 'plan_business_full_feature4', 'plan_business_full_feature5', 'plan_business_full_feature6', 'plan_business_full_feature7', 'plan_business_full_feature8', 'plan_business_full_feature9', 'plan_business_full_feature10'] }
  ];

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setIsPlanDetailsOpen(true);
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "YourBizFlow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": t('app_description'),
    "url": "https://yourbizflow.com/welcome",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "lowPrice": "0",
      "highPrice": "239.90",
      "offers": [
        { "@type": "Offer", "name": "Gratuit", "price": "0", "priceCurrency": "EUR" },
        { "@type": "Offer", "name": "Pro Mensuel", "price": "8.99", "priceCurrency": "EUR", "description": "Abonnement mensuel au plan Pro." },
        { "@type": "Offer", "name": "Business Mensuel", "price": "24.99", "priceCurrency": "EUR", "description": "Abonnement mensuel au plan Business." },
        { "@type": "Offer", "name": "Pro Annuel", "price": "86.30", "priceCurrency": "EUR", "description": "Abonnement annuel au plan Pro." },
        { "@type": "Offer", "name": "Business Annuel", "price": "239.90", "priceCurrency": "EUR", "description": "Abonnement annuel au plan Business." }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "100"
    },
    "author": {
      "@type": "Organization",
      "name": "YourBizFlow"
    }
  };

  return (
    <div className="w-full text-white bg-[#030303] overflow-x-hidden">
      <Helmet>
        <title>{t('app_name')} | {t('app_simplified')}</title>
        <meta name="description" content={t('app_description')} />
        <meta name="keywords" content="SaaS, gestion d'entreprise, facturation, CRM, devis, freelance, PME, auto-entrepreneur, logiciel de gestion, YourBizFlow" />
        <meta property="og:title" content={`${t('app_name')} | ${t('app_simplified')}`} />
        <meta property="og:description" content={t('app_description')} />
        <meta property="og:url" content="https://yourbizflow.com/welcome" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_og_image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('app_name')} | ${t('app_simplified')}`} />
        <meta name="twitter:description" content={t('app_description')} />
        <meta name="twitter:image" content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_twitter_image.png" />
        <script type="application/ld+json">
          {JSON.stringify(softwareApplicationSchema)}
        </script>
      </Helmet>
      <PlanDetailsDialog isOpen={isPlanDetailsOpen} onOpenChange={setIsPlanDetailsOpen} plan={selectedPlan} t={t} />
      <LegalDialog isOpen={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} title={t('footer_privacy')}>
        <PrivacyPolicyContent />
      </LegalDialog>
      <LegalDialog isOpen={isTermsOpen} onOpenChange={setIsTermsOpen} title={t('footer_terms')}>
        <TermsContent />
      </LegalDialog>

      <PublicHeader onNavClick={handleNavClick} />

      {/* Black Friday Banner */}
      {isBlackFridayVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-40 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-3 mt-[65px]"
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center relative pr-8 sm:pr-0">
              <BadgePercent className="w-5 h-5 text-white animate-pulse" />
              <p className="text-white font-semibold text-sm sm:text-base">
                {t('blackfriday_banner')} <span className="font-bold bg-white text-purple-600 px-2 py-0.5 rounded">BLACKFRIDAY</span>
              </p>
              <button
                onClick={() => setIsBlackFridayVisible(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 sm:relative sm:top-auto sm:translate-y-0 text-white hover:text-white/80 transition-colors p-1"
                aria-label="Close banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <main>
        <HeroGeometric 
            badge={t('landing_hero_badge')}
            titleAs="h1"
            title1={t('landing_hero_title1')}
            title2={t('landing_hero_title2')}
            subtitle={t('app_description')}
        />
        
        <div className="relative z-10 flex flex-col items-center gap-4 -mt-32 md:-mt-24">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-indigo-500/30">
                {t('start_free')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
        </div>

        <section id="features" className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('landing_features_title')}</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">{t('landing_features_subtitle')}</p>
                </div>
            </div>
            <FeaturesCarousel />
             <div className="text-center mt-16 flex flex-col items-center gap-6">
                <p className="text-white/60 text-lg">{t('landing_features_coming_soon')}</p>
                 <a href="https://calendly.com/yourbizflow/30min" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 shadow-lg shadow-white/10">
                    <PhoneCall className="w-5 h-5 mr-2" /> {t('landing_features_demo')}
                  </Button>
                </a>
            </div>
        </section>

        <section id="download" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('landing_download_title')}</h2>
              <p className="text-white/60 max-w-2xl mx-auto">{t('landing_download_subtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="relative w-48 h-auto">
                <img alt={t('landing_download_google_alt')} className="w-full h-auto opacity-50" src="https://i.ibb.co/bjyL5dzW/1.png" />
                <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {t('in_development')}
                </div>
              </div>
              <div className="relative w-48 h-auto">
                <img alt={t('landing_download_apple_alt')} className="w-full h-auto opacity-50" src="https://i.ibb.co/fzJB0DHr/2.png" />
                <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {t('in_development')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('landing_testimonials_title')}</h2>
              <p className="text-white/60 max-w-2xl mx-auto">{t('landing_testimonials_subtitle')}</p>
            </div>
            <TestimonialsCarousel />
          </div>
        </section>

        <SocialProofSection />

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t('pricing_title')}</h2>
              <p className="text-white/60 max-w-2xl mx-auto">{t('pricing_subtitle')}</p>
              <div className="flex items-center justify-center flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-4">
                  <Label htmlFor="billing-cycle-landing" className={cn("text-white/80", billingCycle === 'monthly' && 'text-white font-semibold')}>{t('monthly')}</Label>
                  <Switch id="billing-cycle-landing" checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
                  <Label htmlFor="billing-cycle-landing" className={cn("text-white/80", billingCycle === 'yearly' && 'text-white font-semibold')}>{t('yearly')}</Label>
                  <div className="bg-rose-500/20 text-rose-300 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <BadgePercent className="w-3 h-3" />
                    {t('discount_badge')}
                  </div>
                </div>
                <CurrencySelector />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className={cn("bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 flex flex-col shadow-lg w-full max-w-sm relative", plan.name === 'Business' && 'border-rose-300/80 ring-2 ring-rose-300/50')}
                >
                  {plan.name === 'Business' && (
                    <div className="absolute -top-4 right-6 bg-rose-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      {t('bestseller')}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white/90 mb-2">{t(`plan_${plan.name.toLowerCase()}`)}</h3>
                  <p className="text-4xl font-extrabold text-white mb-6">
                    <PriceDisplay prices={plan.prices[billingCycle] || plan.prices['monthly']} />
                    <span className="text-lg font-medium text-white/60">/{billingCycle === 'monthly' ? t('monthly').toLowerCase() : t('yearly').toLowerCase()}</span>
                  </p>
                  {plan.name === 'Free' && (
                    <p className="text-sm text-green-400 font-medium mb-4">{t('no_credit_card')}</p>
                  )}
                  <ul className="space-y-3 mb-4 flex-grow">
                    {Array.isArray(plan.features) && plan.features.map((featureKey, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white/70">{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="link" size="sm" className="mb-4 text-indigo-300 hover:text-indigo-200" onClick={() => openPlanDetails(plan)}>
                    <Info className="w-4 h-4 mr-2" />
                    {t('see_all_features')}
                  </Button>
                  <Link to="/signup" className="w-full">
                    <Button
                      className={cn("w-full py-3 text-base font-bold rounded-lg", plan.name === 'Business' ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20')}
                    >
                      {t('choose_plan')}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                {t('comparison_title')}
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">{t('comparison_subtitle')}</p>
            </div>
            
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-white/10 rounded-2xl backdrop-blur-sm bg-white/[0.02]">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/[0.05]">
                      <tr>
                        <th scope="col" className="py-4 px-6 text-left text-sm font-semibold text-white/90">
                          {t('comparison_feature')}
                        </th>
                        <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-white/90">
                          YourBizFlow
                        </th>
                        <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-white/70">
                          Odoo
                        </th>
                        <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-white/70">
                          Zoho
                        </th>
                        <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-white/70">
                          Striven
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.03]">
                        <td className="py-4 px-6 text-sm font-semibold text-white/90">{t('comparison_price')}</td>
                        <td className="py-4 px-6 text-center text-sm font-bold text-green-400">0$</td>
                        <td className="py-4 px-6 text-center text-sm text-white/70">~20€/mois</td>
                        <td className="py-4 px-6 text-center text-sm text-white/70">~14€/mois</td>
                        <td className="py-4 px-6 text-center text-sm text-white/70">~35$/mois</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-sm text-white/80">{t('comparison_hr')}</td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-sm text-white/80">{t('comparison_finance')}</td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-sm text-white/80">{t('comparison_recurring')}</td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-sm text-white/80">{t('comparison_rental')}</td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span></td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-sm text-white/80">{t('comparison_stock')}</td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span></td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-sm text-white/80">{t('comparison_trading')}</td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span></td>
                        <td className="py-4 px-6 text-center"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-white/60">{t('comparison_legend')}</p>
                  <div className="flex flex-wrap gap-4 justify-center text-sm">
                    <span className="text-white/70 flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-green-500"></span> {t('comparison_yes')}</span>
                    <span className="text-white/70 flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-orange-500"></span> {t('comparison_partial')}</span>
                    <span className="text-white/70 flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-red-500"></span> {t('comparison_no')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FaqSection />

        <CtaSection />

        <ContactSection />
      </main>

      <MinimalFooter onPrivacyClick={() => setIsPrivacyOpen(true)} onTermsClick={() => setIsTermsOpen(true)} />
    </div>
  );
};

export default LandingPage;
export { PublicHeader, navLinks };
