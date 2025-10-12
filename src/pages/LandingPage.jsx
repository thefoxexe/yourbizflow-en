import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useSpring } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, Users, Package, Clock, BarChart3, Star, Info, KanbanSquare, Menu, X, BadgePercent, ChevronLeft, ChevronRight, User, Award, Banknote, Lightbulb, Workflow, Bot, Zap, FileSignature, Receipt, AreaChart, Briefcase, Repeat, MailWarning, ClipboardList, Warehouse, TrendingUp, PhoneCall, Globe, ChevronDown, ShoppingCart, KeyRound } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const LanguageSelector = () => {
  const [lang, setLang] = useState('Français');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10">
          <Globe className="w-4 h-4" />
          <span>{lang}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#030303] border-white/10 text-white">
        <DropdownMenuItem onSelect={() => setLang('Français')} asChild>
          <Link to="/">Français</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setLang('English')} asChild>
          <Link to="https://yourbizflow.com">English</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AnimatedCounter = ({ value, isFloat = false }) => {
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
          ref.current.textContent = latest.toFixed(1).replace('.', ',');
        } else {
          ref.current.textContent = Math.round(latest);
        }
      }
    });
    return () => unsubscribe();
  }, [springValue, isFloat]);

  if (isFloat) {
    return <span ref={ref}>0,0</span>;
  }
  return <span ref={ref}>0</span>;
};

const SocialProofSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

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
                            <User className="w-8 h-8 text-white/60 mb-3" />
                            <p className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                                <AnimatedCounter value={100} />+
                            </p>
                            <p className="text-white/60 mt-2 font-medium">Utilisateurs Actifs</p>
                        </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-2xl p-8 backdrop-blur-sm w-full sm:w-auto text-center">
                        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
                        <div className="relative flex flex-col items-center">
                            <Award className="w-8 h-8 text-white/60 mb-3" />
                            <div className="text-4xl md:text-5xl font-bold text-white tracking-tighter flex items-center">
                                <AnimatedCounter value={4.9} isFloat={true} />
                                <span className="text-white/60 text-2xl md:text-3xl">/5</span>
                            </div>
                            <p className="text-white/60 mt-2 font-medium">Note Moyenne</p>
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
    <p>Votre accès et votre utilisation du Service sont conditionnés par votre acceptation et votre respect de ces Termes. Ces Termes s'appliquent à tous les visiteurs, utilisateurs et autres personnes qui accèdent ou utilisent le Service.</p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Comptes</h3>
    <p>Lorsque vous créez un compte chez nous, vous devez nous fournir des informations exactes, complètes et à jour à tout moment. Le non-respect de cette obligation constitue une violation des Termes, ce qui peut entraîner la résiliation immédiate de votre compte sur notre Service. Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service et de toute activité ou action effectuée sous votre mot de passe.</p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">2. Propriété Intellectuelle</h3>
    <p>Le Service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive de YourBizFlow et de ses concédants de licence. Le Service est protégé par le droit d'auteur, le droit des marques et d'autres lois de France et des pays étrangers. Nos marques et notre habillage commercial ne peuvent être utilisés en relation avec un produit ou un service sans le consentement écrit préalable de YourBizFlow.</p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">3. Résiliation</h3>
    <p>Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans s'y limiter, si vous ne respectez pas les Termes. En cas de résiliation, votre droit d'utiliser le Service cessera immédiatement. Si vous souhaitez résilier votre compte, vous pouvez simplement cesser d'utiliser le Service.</p>
  </>
);

const PlanDetailsDialog = ({ isOpen, onOpenChange, plan }) => {
  if (!plan) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#030303] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Détails du plan {plan.name}</DialogTitle>
          <DialogDescription className="text-white/60">
            Toutes les fonctionnalités incluses dans le plan {plan.name}.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-4 max-h-96 overflow-y-auto">
          {Array.isArray(plan.fullFeatures) && plan.fullFeatures.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-white/80">{feature}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

const FaqSection = () => {
  const faqs = [
    {
      question: "Qu'est-ce que YourBizFlow exactement ?",
      answer: "YourBizFlow est une plateforme tout-en-un conçue pour simplifier la gestion de votre entreprise. Elle combine la facturation, la gestion client (CRM), le suivi de projets, et bien plus, en un seul endroit, vous permettant de vous concentrer sur ce qui compte vraiment : votre croissance."
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Absolument ! Vous pouvez faire évoluer votre abonnement vers un plan supérieur ou inférieur à tout moment depuis vos paramètres de facturation. Les changements sont appliqués immédiatement pour que vous puissiez accéder aux nouvelles fonctionnalités sans attendre."
    },
    {
      question: "Mes données sont-elles en sécurité ?",
      answer: "La sécurité de vos données est notre priorité absolue. Nous utilisons un cryptage de pointe et des serveurs sécurisés pour protéger toutes vos informations. Vous gardez le contrôle total de vos données, et nous vous engageons à ne jamais les partager sans votre consentement."
    },
    {
      question: "Le plan Gratuit est-il vraiment gratuit pour toujours ?",
      answer: "Oui, le plan Gratuit est conçu pour vous aider à démarrer sans aucun coût. Il inclut les fonctionnalités essentielles pour gérer votre activité et restera gratuit. Lorsque votre entreprise grandira, vous pourrez choisir de passer à un plan supérieur pour débloquer plus de modules et de puissance."
    },
    {
      question: "Puis-je importer mes données existantes (clients, factures) ?",
      answer: "Oui, nous travaillons activement sur des outils d'importation pour vous permettre de transférer facilement vos clients, produits et autres données depuis des fichiers CSV. Cette fonctionnalité sera bientôt disponible pour les plans Pro et Business."
    },
    {
      question: "Proposez-vous une application mobile ?",
      answer: "Oui ! L'application YourBizFlow est actuellement disponible en version bêta sur le Google Play Store. Une version pour iOS est également en cours de développement. Vous pouvez gérer votre business où que vous soyez."
    },
    {
      question: "Le support client est-il inclus dans tous les plans ?",
      answer: "Oui, tous nos utilisateurs bénéficient d'un support client. Le plan Gratuit inclut un support par e-mail. Les plans Pro et Business bénéficient d'un support prioritaire, avec des temps de réponse plus rapides et des options de contact étendues comme le chat en direct ou la visio."
    }
  ];

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Questions Fréquentes</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Trouvez les réponses à vos questions les plus courantes.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const TestimonialsCarousel = () => {
  const [index, setIndex] = useState(0);
  const testimonials = [
    { name: "Marc D.", company: "Coach sportif", text: "Je passais un temps fou sur mes factures. Avec YourBizFlow, je crée une facture en 30 secondes depuis mon téléphone, entre deux sessions. C’est le game-changer que j'attendais.", avatar: "coach sportif regardant son téléphone" },
    { name: "Alice T.", company: "E-commerçante", text: "La gestion des stocks était un vrai casse-tête. Maintenant, je vois mes niveaux de stock en direct et le module calcule ma marge brute automatiquement. J'ai une visibilité que je n'avais jamais eue.", avatar: "jeune femme travaillant dans un entrepôt" },
    { name: "Samuel L.", company: "Développeur Freelance", text: "Le suivi du temps par projet est juste parfait. Je sais exactement combien de temps je passe sur chaque mission, et mes clients adorent la transparence quand je leur envoie la facture détaillée.", avatar: "développeur concentré devant son écran" },
    { name: "Chloé V.", company: "Consultante RH", text: "Gérer mes prospects dans un tableur Excel devenait impossible. Le CRM de YourBizFlow est simple, visuel, et je n'oublie plus jamais de relancer un contact. J'ai l'air tellement plus pro !", avatar: "consultante souriante en appel vidéo" }
  ];

  const images = [
    <img alt="coach sportif regardant son téléphone" src="https://images.unsplash.com/photo-1699905631258-f9657e33cc7d?q=80&w=300" />,
    <img alt="jeune femme travaillant dans un entrepôt" src="https://images.unsplash.com/photo-1602135058093-0eddb40d0e1e?q=80&w=300" />,
    <img alt="développeur concentré devant son écran" src="https://images.unsplash.com/photo-1580894912989-0bc892f4efd0?q=80&w=300" />,
    <img alt="consultante souriante en appel vidéo" src="https://images.unsplash.com/photo-1585092284034-48c72302862c?q=80&w=300" />
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
                    <p className="font-semibold text-white/90">{testimonials[index].name}</p>
                    <p className="text-sm text-white/60">{testimonials[index].company}</p>
                  </div>
                </div>
                <p className="text-white/70 mb-4 text-base sm:text-lg italic">"{testimonials[index].text}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
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
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 md:p-12 overflow-hidden text-center">
          <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Prêt à transformer votre business ?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">Rejoignez des milliers d'entrepreneurs qui ont simplifié leur gestion et accéléré leur croissance. Commencez gratuitement, sans carte de crédit requise.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 shadow-lg">
                Commencer l'aventure <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Contactez-nous</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">Une question ? Une suggestion ? Nous sommes à votre écoute.</p>
        </div>
        <form name="contact" method="POST" netlify className="space-y-6">
          <input type="hidden" name="form-name" value="contact" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="sr-only">Nom</Label>
              <Input type="text" name="name" id="name" placeholder="Votre nom" required className="bg-white/5 border-white/10 placeholder:text-white/40" />
            </div>
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input type="email" name="email" id="email" placeholder="Votre email" required className="bg-white/5 border-white/10 placeholder:text-white/40" />
            </div>
          </div>
          <div>
            <Label htmlFor="message" className="sr-only">Message</Label>
            <Textarea name="message" id="message" rows="4" placeholder="Votre message" required className="bg-white/5 border-white/10 placeholder:text-white/40"></Textarea>
          </div>
          <div className="text-center">
            <Button type="submit" size="lg" className="bg-[#C5B3FF] hover:bg-[#b2a1e6] text-black rounded-lg px-8">
              Envoyer le message
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

const navLinks = [
  { href: "/about", label: "À propos" },
  { href: "#features", label: "Mini-apps" },
  { href: "#download", label: "Télécharger" },
  { href: "#testimonials", label: "Avis" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const PublicHeader = ({ onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-lg border-b border-white/10 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/welcome" className="flex items-center gap-3">
          <img src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png" alt="YourBizFlow Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">YourBizFlow</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={(e) => onNavClick(e, link.href)} className="text-sm text-white/80 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSelector />
          <Link to="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">Connexion</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white/90 text-black hover:bg-white">S'inscrire</Button>
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
                <a key={link.label} href={link.href} onClick={(e) => { onNavClick(e, link.href, () => setIsMenuOpen(false)); }} className="text-lg text-white/80 hover:text-white transition-colors w-full text-center py-2">
                  {link.label}
                </a>
              ))}
              <div className="w-full border-t border-white/10 my-2"></div>
              <LanguageSelector />
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full text-white/80 hover:text-white hover:bg-white/10">Connexion</Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full bg-white/90 text-black hover:bg-white">S'inscrire</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const allFeatures = [
    { id: 'billing', icon: FileText, title: "Facturation", href: '/apps/facturation', color: 'text-blue-400' },
    { id: 'quotes', icon: FileSignature, title: "Devis", href: '/apps/quotes', color: 'text-cyan-400' },
    { id: 'crm', icon: Users, title: "CRM", href: '/apps/crm', color: 'text-green-400' },
    { id: 'inventory', icon: Package, title: "Achat/Revente", href: '/apps/inventory', color: 'text-yellow-400' },
    { id: 'projects', icon: KanbanSquare, title: "Projets", href: '/apps/projects', color: 'text-purple-400' },
    { id: 'time-tracking', icon: Clock, title: "Suivi Temps", href: '/apps/time-tracking', color: 'text-orange-400' },
    { id: 'analytics', icon: BarChart3, title: "Analytique", href: '/apps/analytics', color: 'text-red-400' },
    { id: 'hr', icon: Briefcase, title: "RH", href: '/apps/hr', color: 'text-indigo-400' },
    { id: 'seo-analyzer', icon: Zap, title: "SEO Analyzer", href: '/apps/seo-analyzer', color: 'text-lime-400' },
    { id: 'task-manager', icon: ClipboardList, title: "Tâches", href: '/apps/task-manager', color: 'text-pink-400' },
    { id: 'expenses', icon: Receipt, title: "Dépenses", href: '/apps/expenses', color: 'text-teal-400' },
    { id: 'financial-report', icon: AreaChart, title: "Rapport Financier", href: '/apps/financial-report', color: 'text-rose-400' },
    { id: 'recurring-payments', icon: Repeat, title: "Paiements Récurrents", href: '/apps/recurring-payments', color: 'text-amber-400' },
    { id: 'automated-reminders', icon: MailWarning, title: "Relances Automatiques", href: '/apps/automated-reminders', color: 'text-fuchsia-400' },
    { id: 'stock-management', icon: Warehouse, title: "Gestion de Stock", href: '/apps/stock-management', color: 'text-sky-400' },
    { id: 'order-management', icon: ShoppingCart, title: "Commandes", href: '/apps/order-management', color: 'text-blue-300' },
    { id: 'rental-management', icon: KeyRound, title: "Location", href: '/apps/rental-management', color: 'text-orange-300' },
    { id: 'budget', icon: Banknote, title: "Budget", href: '/apps/budget', color: 'text-emerald-400' },
    { id: 'trading-journal', icon: TrendingUp, title: "Journal Trading", href: '/apps/trading-journal', color: 'text-green-300' },
    { id: 'ai-writing-assistant', icon: Bot, title: "AI Writing", href: '/apps/ai-writing-assistant', color: 'text-violet-400' },
];

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
          <Link to={feature.href} key={`${feature.id}-${index}`} className="flex-shrink-0">
            <motion.div 
              className={cn(
                "relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-2 transition-all duration-300",
                "hover:bg-white/10 hover:border-white/20 group-hover:[animation-play-state:paused]"
              )}
            >
              <feature.icon className={cn("w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 transition-colors duration-300", feature.color)} />
              <h3 className="text-xs font-semibold text-white/80">{feature.title}</h3>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

const LandingPage = () => {
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
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
    { name: "Gratuit", prices: { monthly: { eur: "0", usd: "0", chf: "0" } }, features: ["Facturation & CRM de base", "Gestion de 5 clients", "Module Notes & Calendrier", "Et bien plus encore..."], fullFeatures: ["Facturation & Devis (limité, avec filigrane)", "CRM (jusqu'à 5 clients)", "Module Notes & Documents (2 max)", "Module Calendrier", "Support par email"] },
    { name: "Pro", prices: { monthly: { eur: "8.99", usd: "9.99", chf: "8.99" }, yearly: { eur: "86.30", usd: "95.90", chf: "86.30" } }, features: ["Toutes les fonctionnalités du plan Free", "Clients illimités", "Module Achat/Revente", "Et bien plus encore..."], fullFeatures: ["Toutes les fonctionnalités du plan Free", "Clients illimités", "Facturation & Devis illimités", "Module Achat/Revente (Inventaire)", "Module Suivi des Dépenses", "Module Notes & Documents (20 max)", "Support prioritaire par email"] }
    ,
    { name: "Business", prices: { monthly: { eur: "24.99", usd: "29.99", chf: "24.99" }, yearly: { eur: "239.90", usd: "287.30", chf: "239.90" } }, features: ["Toutes les fonctionnalités du plan Pro", "Modules avancés", "Support prioritaire", "Et bien plus encore..."], fullFeatures: ["Toutes les fonctionnalités du plan Pro", "Module Suivi de Projets (Kanban)", "Module Gestion du Temps", "Module Rapport Financier", "Module Paiements Récurrents", "Module Relances Automatisées", "Module RH & Paie", "Module Notes & Documents (illimité)", "Accès API", "Support dédié (téléphone & visio)"] }
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
    "description": "La plateforme tout-en-un pour gérer votre facturation, CRM, projets et plus encore. Simplifiez votre gestion d'entreprise et concentrez-vous sur votre croissance.",
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
        <title>YourBizFlow | Logiciel de Gestion d'Entreprise Tout-en-Un (SaaS)</title>
        <meta name="description" content="Découvrez YourBizFlow, la plateforme SaaS tout-en-un pour entrepreneurs. Gérez facturation, CRM, projets et plus, simplement. Essayez gratuitement !" />
        <meta name="keywords" content="SaaS, gestion d'entreprise, facturation, CRM, devis, freelance, PME, auto-entrepreneur, logiciel de gestion, YourBizFlow" />
        <meta property="og:title" content="YourBizFlow | Logiciel de Gestion d'Entreprise Tout-en-Un (SaaS)" />
        <meta property="og:description" content="Découvrez YourBizFlow, la solution SaaS tout-en-un pour les entrepreneurs et PME. Gérez factures, clients et projets avec une facilité déconcertante." />
        <meta property="og:url" content="https://yourbizflow.com/welcome" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_og_image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="YourBizFlow | Logiciel de Gestion d'Entreprise Tout-en-Un (SaaS)" />
        <meta name="twitter:description" content="Découvrez YourBizFlow, la solution SaaS tout-en-un pour les entrepreneurs et PME. Gérez factures, clients et projets avec une facilité déconcertante." />
        <meta name="twitter:image" content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_twitter_image.png" />
        <script type="application/ld+json">
          {JSON.stringify(softwareApplicationSchema)}
        </script>
      </Helmet>
      <PlanDetailsDialog isOpen={isPlanDetailsOpen} onOpenChange={setIsPlanDetailsOpen} plan={selectedPlan} />
      <LegalDialog isOpen={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} title="Politique de Confidentialité">
        <PrivacyPolicyContent />
      </LegalDialog>
      <LegalDialog isOpen={isTermsOpen} onOpenChange={setIsTermsOpen} title="Termes et Conditions">
        <TermsContent />
      </LegalDialog>

      <PublicHeader onNavClick={handleNavClick} />

      <main>
        <HeroGeometric 
            badge="YourBizFlow"
            titleAs="h1"
            title1="Votre Business,"
            title2="Simplifié."
            subtitle="De la facturation à la gestion de projet, en passant par le CRM et l'analyse IA, YourBizFlow est la plateforme tout-en-un conçue pour tous les entrepreneurs."
        />
        
        <div className="relative z-10 flex flex-col items-center gap-4 -mt-32 md:-mt-24">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-indigo-500/30">
                Commencer gratuitement <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
        </div>

        <section id="features" className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Une plateforme, toutes vos mini-apps.</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">Chaque module est une app pensée pour performer.</p>
                </div>
            </div>
            <FeaturesCarousel />
             <div className="text-center mt-16 flex flex-col items-center gap-6">
                <p className="text-white/60 text-lg">Et bien plus à venir...</p>
                 <a href="https://calendly.com/yourbizflow/30min" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 shadow-lg shadow-white/10">
                    <PhoneCall className="w-5 h-5 mr-2" /> Réserver une démo gratuite
                  </Button>
                </a>
            </div>
        </section>

        <section id="download" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Téléchargez l'application YourBizFlow</h2>
              <p className="text-white/60 max-w-2xl mx-auto">Accédez à votre business partout, tout le temps. Disponible uniquement en beta sur Google Play pour l'instant. Contactez @yourbizflow sur Instagram pour l'accès</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="flex flex-col items-center text-center">
                <img alt="Télécharger YourBizFlow sur le Google Play Store" className="w-48 h-auto mb-2" src="https://i.ibb.co/bjyL5dzW/1.png" />
              </div>
              <div className="flex flex-col items-center text-center">
                <img alt="Bientôt disponible sur l'Apple App Store" className="w-48 h-auto mb-2" src="https://i.ibb.co/fzJB0DHr/2.png" />
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Ils nous font confiance</h2>
              <p className="text-white/60 max-w-2xl mx-auto">Découvrez pourquoi des milliers d'entrepreneurs choisissent YourBizFlow.</p>
            </div>
            <TestimonialsCarousel />
          </div>
        </section>

        <SocialProofSection />

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Un tarif adapté à votre croissance</h2>
              <p className="text-white/60 max-w-2xl mx-auto">Simple, transparent et sans engagement.</p>
              <div className="flex items-center justify-center flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-4">
                  <Label htmlFor="billing-cycle-landing" className={cn("text-white/80", billingCycle === 'monthly' && 'text-white font-semibold')}>Mensuel</Label>
                  <Switch id="billing-cycle-landing" checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
                  <Label htmlFor="billing-cycle-landing" className={cn("text-white/80", billingCycle === 'yearly' && 'text-white font-semibold')}>Annuel</Label>
                  <div className="bg-rose-500/20 text-rose-300 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <BadgePercent className="w-3 h-3" />
                    -20%
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
                      Best-Seller
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white/90 mb-2">{plan.name}</h3>
                  <p className="text-4xl font-extrabold text-white mb-6">
                    <PriceDisplay prices={plan.prices[billingCycle] || plan.prices['monthly']} />
                    <span className="text-lg font-medium text-white/60">/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                  </p>
                  <ul className="space-y-3 mb-4 flex-grow">
                    {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="link" size="sm" className="mb-4 text-indigo-300 hover:text-indigo-200" onClick={() => openPlanDetails(plan)}>
                    <Info className="w-4 h-4 mr-2" />
                    Voir toutes les fonctionnalités
                  </Button>
                  <Link to="/signup" className="w-full">
                    <Button
                      className={cn("w-full py-3 text-base font-bold rounded-lg", plan.name === 'Business' ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20')}
                    >
                      Choisir ce plan
                    </Button>
                  </Link>
                </motion.div>
              ))}
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