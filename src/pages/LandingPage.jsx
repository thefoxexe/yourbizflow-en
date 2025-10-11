import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useSpring } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  Package,
  Clock,
  BarChart3,
  Star,
  Info,
  KanbanSquare,
  Menu,
  X,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  Banknote,
  Lightbulb,
  Workflow,
  Bot,
  Zap,
  FileSignature,
  Receipt,
  AreaChart,
  Briefcase,
  Repeat,
  MailWarning,
  ClipboardList,
  Warehouse,
  TrendingUp,
  PhoneCall,
  Globe,
  ChevronDown,
  ShoppingCart,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import CurrencySelector, { PriceDisplay } from "@/components/CurrencySelector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const LanguageSelector = () => {
  const [lang, setLang] = useState("English");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
        >
          <Globe className="w-4 h-4" />
          <span>{lang}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#030303] border-white/10 text-white">
        <DropdownMenuItem onSelect={() => setLang("English")} asChild>
          <Link to="https://yourbizflow.fr">Français</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setLang("English")} asChild>
          <Link to="/">English</Link>
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
          ref.current.textContent = latest.toFixed(1).replace(".", ",");
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
              <p className="text-white/60 mt-2 font-medium">Active Users</p>
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
              <p className="text-white/60 mt-2 font-medium">Medium Rating</p>
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
    <p className="text-white/60">Last updated: 11/10/2025</p>
    <p>
      YourBizFlow ("we", "us" or "our") operates the Website and the YourBizFlow
      application (the “Service”). This page informs you of our policies
      regarding the collection, use and disclosure of personal data when you use
      our Service and the choices you you have associated with this data.
    </p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">
      1. Collection and Use of Information
    </h3>
    <p>
      We collect several types of information for various purposes to provide
      and improve our Service. Types of data collected include:
    </p>
    <ul className="list-disc pl-6 space-y-2 mt-2">
      <li>
        <strong>Personal Data:</strong> When using our Service, we may ask you
        to provide us with certain personally identifiable information that may
        be used to contact or identify you (“Personal Data”). These may include,
        but are not limited to: email address, name, first name, and usage data.
      </li>
      <li>
        <strong>Usage Data:</strong> We can also collect information about how
        the Service is accessed and used. This usage data may include
        information such as your computer's Internet Protocol address (e.g.
        example, IP address), browser type, browser version, the pages of our
        Service that you visit, the time and date of your visit, time spent on
        these pages, time spent on these pages, and other diagnostic data.
      </li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">
      2. Use of Data
    </h3>
    <p>YourBizFlow uses the data collected for various purposes:</p>
    <ul className="list-disc pl-6 space-y-2 mt-2">
      <li>Provide, maintain and improve our Service.</li>
      <li>Notify you of changes to our Service.</li>
      <li>
        Allow you to participate in the interactive features of our Service when
        you want it.
      </li>
      <li>Provide customer support and respond to your requests.</li>
      <li>Gather valuable analytics or information to improve our Service.</li>
      <li>Monitor use of our Service.</li>
      <li>Detect, prevent and resolve technical problems.</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">
      3. Data Security
    </h3>
    <p>
      The security of your data is important to us, but remember that no method
      of transmission over the Internet or method of storage Electronics are not
      100% safe. Although we strive to use commercially acceptable means to
      protect your Data Personal, we cannot guarantee their absolute security.
    </p>
  </>
);

const TermsContent = () => (
  <>
    <p className="text-white/60">Last updated: 11/10/2025</p>
    <p>
      Please read these terms and conditions carefully (“Terms”, “Terms and
      Terms") before using the YourBizFlow website and application (the
      “Service”) operated by YourBizFlow.
    </p>
    <p>
      Your access to and use of the Service is conditioned by your acceptance of
      and compliance with these Terms. These Terms apply to everyone visitors,
      users and others who access or use the Service.
    </p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Accounts</h3>
    <p>
      When you create an account with us, you must provide us with accurate,
      complete and up-to-date information at all times. Failure to respect this
      obligation constitutes a breach of the Terms, which may result in
      immediate termination of your account on our Service. You are responsible
      for protecting the password you use to access the Service and any activity
      or action carried out under your control exceeds.
    </p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">
      2. Intellectual Property
    </h3>
    <p>
      The Service and its original content, features and functionalities are and
      will remain the exclusive property of YourBizFlow and of its licensors.
      The Service is protected by law copyright, trademark and other laws of
      France and other countries foreigners. Our trademarks and trade dress may
      not be used in Login with a product or service without consent prior
      writing of YourBizFlow.
    </p>

    <h3 className="text-xl font-semibold mt-6 mb-3 text-white">
      3. Termination
    </h3>
    <p>
      We may terminate or suspend your account immediately, without notice or
      liability, for any reason whatsoever, including, without limitation, if
      you fail to comply with the Terms. In case of termination, your right to
      use the Service will cease immediately. If you wish to terminate your
      account, you can simply stop to use the Service.
    </p>
  </>
);

const PlanDetailsDialog = ({ isOpen, onOpenChange, plan }) => {
  if (!plan) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#030303] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Plan details {plan.name}</DialogTitle>
          <DialogDescription className="text-white/60">
            All features included in plan {plan.name}.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-4 max-h-96 overflow-y-auto">
          {Array.isArray(plan.fullFeatures) &&
            plan.fullFeatures.map((feature, i) => (
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
      question: "What exactly is YourBizFlow?",
      answer:
        "YourBizFlow is an all-in-one platform designed to simplify running your business. It combines invoicing, customer management (CRM), project tracking, and more in one place, allowing you to focus on what really matters: your growth.",
    },
    {
      question: "Can I change my plan at any time?",
      answer:
        "Absolutely! You can upgrade your subscription to a higher or lower plan at any time from your billing settings. Changes are applied immediately so you can access new features without delay.",
    },
    {
      question: "Is my data safe?",
      answer:
        "The security of your data is our top priority. We use state-of-the-art encryption and secure servers to protect all of your information. You remain in full control of your data, and we promise to never share it without your consent.",
    },
    {
      question: "Is the Free plan really free forever?",
      answer:
        "Yes, the Free plan is designed to help you get started at no cost. It includes the essential features to run your business and will remain free. As your business grows, you can choose to upgrade to a higher plan to unlock more modules and power.",
    },
    {
      question: "Can I import my existing data (customers, invoices)?",
      answer:
        "Yes, we are actively working on import tools to allow you to easily transfer your customers, products and other data from CSV files. This feature will be available soon for the Pro and Business plans.",
    },
    {
      question: "Do you offer a mobile application?",
      answer:
        "Yes! The YourBizFlow app is currently available in beta on the Google Play Store. A version for iOS is also in development. You can manage your business wherever you are.",
    },
    {
      question: "Is customer support included in all plans?",
      answer:
        "Yes, all of our users receive customer support. The Free plan includes email support. The Pro and Business plans receive priority support, with faster response times and expanded contact options like live chat or video.",
    },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Find answers to your most common questions.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg">
                {faq.question}
              </AccordionTrigger>
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
    {
      name: "Marc D.",
      company: "Sports coach",
      text: "I was spending a lot of time on my invoices. With YourBizFlow, I create an invoice in 30 seconds from my phone, between two sessions. It's the game-changer I've been waiting for.",
      avatar: "sports coach looking at his phone",
    },
    {
      name: "Alice T.",
      company: "E-commerce",
      text: "Inventory management was a real headache. Now I see my stock levels live and the module calculates my gross margin automatically. I have visibility I never had before.",
      avatar: "young woman working in a warehouse",
    },
    {
      name: "Samuel L.",
      company: "Freelance Developer",
      text: "The time tracking per project is just perfect. I know exactly how much time I spend on each mission, and my clients love the transparency when I send them the detailed invoice.",
      avatar: "developer focused in front of his screen",
    },
    {
      name: "Chloe V.",
      company: "HR Consultant",
      text: "Managing my prospects in an Excel spreadsheet was becoming impossible. YourBizFlow's CRM is simple, visual, and I never forget to follow up with a contact again. I look so much more professional!",
      avatar: "smiling consultant on video call",
    },
  ];

  const images = [
    <img
      alt="sports coach looking at his phone"
      src="https://images.unsplash.com/photo-1699905631258-f9657e33cc7d?q=80&w=300"
    />,
    <img
      alt="young woman working in a warehouse"
      src="https://images.unsplash.com/photo-1602135058093-0eddb40d0e1e?q=80&w=300"
    />,
    <img
      alt="developer focused in front of his screen"
      src="https://images.unsplash.com/photo-1580894912989-0bc892f4efd0?q=80&w=300"
    />,
    <img
      alt="smiling consultant on video call"
      src="https://images.unsplash.com/photo-1585092284034-48c72302862c?q=80&w=300"
    />,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handlePrev = () => {
    setIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
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
                    {React.cloneElement(images[index], {
                      className: "w-full h-full object-cover",
                    })}
                  </div>
                  <div>
                    <p className="font-semibold text-white/90">
                      {testimonials[index].name}
                    </p>
                    <p className="text-sm text-white/60">
                      {testimonials[index].company}
                    </p>
                  </div>
                </div>
                <p className="text-white/70 mb-4 text-base sm:text-lg italic">
                  "{testimonials[index].text}"
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-y-0 -left-4 sm:-left-16 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="bg-white/5 hover:bg-white/10 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 -right-4 sm:-right-16 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="bg-white/5 hover:bg-white/10 rounded-full"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
            )}
          ></button>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your business?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of entrepreneurs who have simplified their
              management and accelerated their growth. Start for free, without
              credit card required.
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 shadow-lg"
              >
                Start the adventure <ArrowRight className="ml-2 w-5 h-5" />
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Contact us
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">
            A question? Any suggestions? We are here to listen to you.
          </p>
        </div>
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          className="space-y-6"
        >
          <input type="hidden" name="form-name" value="contact" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="sr-only">
                Name
              </Label>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Your name"
                required
                className="bg-white/5 border-white/10 placeholder:text-white/40"
              />
            </div>
            <div>
              <Label htmlFor="email" className="sr-only">
                E-mail
              </Label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Your email"
                required
                className="bg-white/5 border-white/10 placeholder:text-white/40"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              name="message"
              id="message"
              rows="4"
              placeholder="Your message"
              required
              className="bg-white/5 border-white/10 placeholder:text-white/40"
            ></Textarea>
          </div>
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="bg-[#C5B3FF] hover:bg-[#b2a1e6] text-black rounded-lg px-8"
            >
              Send message
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

const navLinks = [
  { href: "/about", label: "About" },
  { href: "#features", label: "Mini-apps" },
  { href: "#download", label: "Download" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const PublicHeader = ({ onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-lg border-b border-white/10 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/welcome" className="flex items-center gap-3">
          <img
            src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png"
            alt="YourBizFlow Logo"
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            YourBizFlow
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => onNavClick(e, link.href)}
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSelector />
          <Link to="/login">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white/90 text-black hover:bg-white">
              Register
            </Button>
          </Link>
        </div>
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/20 backdrop-blur-lg"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col items-center gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    onNavClick(e, link.href, () => setIsMenuOpen(false));
                  }}
                  className="text-lg text-white/80 hover:text-white transition-colors w-full text-center py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="w-full border-t border-white/10 my-2"></div>
              <LanguageSelector />
              <Link to="/login" className="w-full">
                <Button
                  variant="outline"
                  className="w-full text-white/80 hover:text-white hover:bg-white/10"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full bg-white/90 text-black hover:bg-white">
                  Register
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const allFeatures = [
  {
    id: "billing",
    icon: FileText,
    title: "Billing",
    href: "/apps/facturation",
    color: "text-blue-400",
  },
  {
    id: "quotes",
    icon: FileSignature,
    title: "Quotes",
    href: "/apps/quotes",
    color: "text-cyan-400",
  },
  {
    id: "crm",
    icon: Users,
    title: "CRM",
    href: "/apps/crm",
    color: "text-green-400",
  },
  {
    id: "inventory",
    icon: Package,
    title: "Purchase/Resale",
    href: "/apps/inventory",
    color: "text-yellow-400",
  },
  {
    id: "projects",
    icon: KanbanSquare,
    title: "Projects",
    href: "/apps/projects",
    color: "text-purple-400",
  },
  {
    id: "time-tracking",
    icon: Clock,
    title: "Time Tracking",
    href: "/apps/time-tracking",
    color: "text-orange-400",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytical",
    href: "/apps/analytics",
    color: "text-red-400",
  },
  {
    id: "hr",
    icon: Briefcase,
    title: "HR",
    href: "/apps/hr",
    color: "text-indigo-400",
  },
  {
    id: "seo-analyzer",
    icon: Zap,
    title: "SEO Analyzer",
    href: "/apps/seo-analyzer",
    color: "text-lime-400",
  },
  {
    id: "task-manager",
    icon: ClipboardList,
    title: "Tasks",
    href: "/apps/task-manager",
    color: "text-pink-400",
  },
  {
    id: "expenses",
    icon: Receipt,
    title: "Expenses",
    href: "/apps/expenses",
    color: "text-teal-400",
  },
  {
    id: "financial-report",
    icon: AreaChart,
    title: "Financial Report",
    href: "/apps/financial-report",
    color: "text-rose-400",
  },
  {
    id: "recurring-payments",
    icon: Repeat,
    title: "Recurring Payments",
    href: "/apps/recurring-payments",
    color: "text-amber-400",
  },
  {
    id: "automated-reminders",
    icon: MailWarning,
    title: "Automatic reminders",
    href: "/apps/automated-reminders",
    color: "text-fuchsia-400",
  },
  {
    id: "stock-management",
    icon: Warehouse,
    title: "Stock Management",
    href: "/apps/stock-management",
    color: "text-sky-400",
  },
  {
    id: "order-management",
    icon: ShoppingCart,
    title: "Orders",
    href: "/apps/order-management",
    color: "text-blue-300",
  },
  {
    id: "rental-management",
    icon: KeyRound,
    title: "Rental",
    href: "/apps/rental-management",
    color: "text-orange-300",
  },
  {
    id: "budget",
    icon: Banknote,
    title: "Budget",
    href: "/apps/budget",
    color: "text-emerald-400",
  },
  {
    id: "trading-journal",
    icon: TrendingUp,
    title: "Journal Trading",
    href: "/apps/trading-journal",
    color: "text-green-300",
  },
  {
    id: "ai-writing-assistant",
    icon: Bot,
    title: "AI Writing",
    href: "/apps/ai-writing-assistant",
    color: "text-violet-400",
  },
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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        animate={{ x: ["0%", `-100%`] }}
        style={{ width: `${allFeatures.length * (144 + 24)}px` }}
        transition={{
          ease: "linear",
          duration: duration,
          repeat: Infinity,
        }}
      >
        {duplicatedFeatures.map((feature, index) => (
          <Link
            to={feature.href}
            key={`${feature.id}-${index}`}
            className="flex-shrink-0"
          >
            <motion.div
              className={cn(
                "relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-2 transition-all duration-300",
                "hover:bg-white/10 hover:border-white/20 group-hover:[animation-play-state:paused]"
              )}
            >
              <feature.icon
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 transition-colors duration-300",
                  feature.color
                )}
              />
              <h3 className="text-xs font-semibold text-white/80">
                {feature.title}
              </h3>
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
  const [billingCycle, setBillingCycle] = useState("monthly");
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, href, callback) => {
    e.preventDefault();
    if (callback) callback();

    const isExternal = href.startsWith("/");
    const isAnchor = href.startsWith("#");

    const scrollToAnchor = (hash) => {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -80;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 0);
    };

    if (isExternal) {
      navigate(href);
    } else if (isAnchor) {
      if (location.pathname !== "/welcome") {
        navigate(`/welcome${href}`);
      } else {
        scrollToAnchor(href);
      }
    }
  };

  useEffect(() => {
    if (location.pathname === "/welcome" && location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const yOffset = -80;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const plans = [
    {
      name: "Gratuit",
      prices: { monthly: { eur: "0", usd: "0", chf: "0" } },
      features: [
        "Basic Billing & CRM",
        "Management of 5 clients",
        "Notes & Calendar Module",
        "And much more...",
      ],
      fullFeatures: [
        "Invoicing & Quote (limited, with watermark)",
        "CRM (up to 5 clients)",
        "Notes & Documents Module (2 max)",
        "Calendar Module",
        "Email support",
      ],
    },
    {
      name: "Pro",
      prices: {
        monthly: { eur: "8.99", usd: "9.99", chf: "8.99" },
        yearly: { eur: "86.30", usd: "95.90", chf: "86.30" },
      },
      features: [
        "All the features of the Free plan",
        "Unlimited customers",
        "Purchase/Resale Module",
        "And much more...",
      ],
      fullFeatures: [
        "All the features of the Free plan",
        "Unlimited customers",
        "Unlimited invoicing & quotes",
        "Purchase/Resale Module (Inventory)",
        "Expense Tracking Module",
        "Notes & Documents Module (20 max)",
        "Priority support by email",
      ],
    },
    {
      name: "Business",
      prices: {
        monthly: { eur: "24.99", usd: "29.99", chf: "24.99" },
        yearly: { eur: "239.90", usd: "287.30", chf: "239.90" },
      },
      features: [
        "All the features of the Pro plan",
        "Advanced modules",
        "Priority support",
        "And much more...",
      ],
      fullFeatures: [
        "All the features of the Pro plan",
        "Project Monitoring Module (Kanban)",
        "Time Management Module",
        "Financial Report Module",
        "Recurring Payments Module",
        "Automated Reminders Module",
        "HR & Payroll Module",
        "Notes & Documents module (unlimited)",
        "Dedicated support (telephone & video)",
      ],
    },
  ];

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setIsPlanDetailsOpen(true);
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YourBizFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "The all-in-one platform to manage your invoicing, CRM, projects and more. Simplify your business management and focus on your growth.",
    url: "https://yourbizflow.com/welcome",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "0",
      highPrice: "239.90",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
        {
          "@type": "Offer",
          name: "Pro Mensuel",
          price: "8.99",
          priceCurrency: "EUR",
          description: "Monthly subscription to the Pro plan.",
        },
        {
          "@type": "Offer",
          name: "Business Mensuel",
          price: "24.99",
          priceCurrency: "EUR",
          description: "Monthly subscription to the Business plan.",
        },
        {
          "@type": "Offer",
          name: "Pro Annuel",
          price: "86.30",
          priceCurrency: "EUR",
          description: "Annual subscription to the Pro plan.",
        },
        {
          "@type": "Offer",
          name: "Business Annuel",
          price: "239.90",
          priceCurrency: "EUR",
          description: "Annual subscription to the Business plan.",
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "100",
    },
    author: {
      "@type": "Organization",
      name: "YourBizFlow",
    },
  };

  return (
    <div className="w-full text-white bg-[#030303] overflow-x-hidden">
      <Helmet>
        <title>YourBizFlow | All-in-One Business Management Software</title>
        <meta
          name="description"
          content="Discover YourBizFlow, the all-in-one platform for entrepreneurs. Manage invoicing, CRM, projects and more, simply. Try it for free!"
        />
        <meta
          name="keywords"
          content=", business management, invoicing, CRM, quote, freelance, SME, self-employed, management software, YourBizFlow"
        />
        <meta
          property="og:title"
          content="YourBizFlow | All-in-One Business Management Software"
        />
        <meta
          property="og:description"
          content="Discover YourBizFlow, the all-in-one solution for entrepreneurs and SMEs. Manage invoices, clients and projects with ease."
        />
        <meta property="og:url" content="https://yourbizflow.com/welcome" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_og_image.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="YourBizFlow | All-in-One Business Management Software"
        />
        <meta
          name="twitter:description"
          content="Discover YourBizFlow, the all-in-one solution for entrepreneurs and SMEs. Manage invoices, clients and projects with ease."
        />
        <meta
          name="twitter:image"
          content="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/yourbizflow_twitter_image.png"
        />
        <script type="application/ld+json">
          {JSON.stringify(softwareApplicationSchema)}
        </script>
      </Helmet>
      <PlanDetailsDialog
        isOpen={isPlanDetailsOpen}
        onOpenChange={setIsPlanDetailsOpen}
        plan={selectedPlan}
      />
      <LegalDialog
        isOpen={isPrivacyOpen}
        onOpenChange={setIsPrivacyOpen}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </LegalDialog>
      <LegalDialog
        isOpen={isTermsOpen}
        onOpenChange={setIsTermsOpen}
        title="Terms and Conditions"
      >
        <TermsContent />
      </LegalDialog>

      <PublicHeader onNavClick={handleNavClick} />

      <main>
        <HeroGeometric
          badge="YourBizFlow"
          titleAs="h1"
          title1="Your Business,"
          title2="Simplified."
          subtitle="From invoicing to project management, CRM and AI analytics, YourBizFlow is the all-in-one platform designed for every entrepreneur."
        />

        <div className="relative z-10 flex flex-col items-center gap-4 -mt-32 md:-mt-24">
          <Link to="/signup">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg shadow-indigo-500/30"
            >
              Get started for free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <section id="features" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                One platform, all your mini-apps.
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Each module is an app designed to perform.
              </p>
            </div>
          </div>
          <FeaturesCarousel />
          <div className="text-center mt-16 flex flex-col items-center gap-6">
            <p className="text-white/60 text-lg">And much more to come...</p>
            <a
              href="https://calendly.com/yourbizflow/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 shadow-lg shadow-white/10"
              >
                <PhoneCall className="w-5 h-5 mr-2" /> Book a demo free
              </Button>
            </a>
          </div>
        </section>

        <section id="download" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Download the YourBizFlow app
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Access your business anywhere, anytime. Available only in beta
                on Google Play for now. Contact @yourbizflow on Instagram for
                access
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="flex flex-col items-center text-center">
                <img
                  alt="Download YourBizFlow from the Google Play Store"
                  className="w-48 h-auto mb-2"
                  src="https://i.ibb.co/bjyL5dzW/1.png"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <img
                  alt="Coming soon to the Apple App Store"
                  className="w-48 h-auto mb-2"
                  src="https://i.ibb.co/fzJB0DHr/2.png"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                They trust us
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Find out why thousands of entrepreneurs choose YourBizFlow.
              </p>
            </div>
            <TestimonialsCarousel />
          </div>
        </section>

        <SocialProofSection />

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                A price adapted to your growth
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Simple, transparent and without obligation.
              </p>
              <div className="flex items-center justify-center flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-4">
                  <Label
                    htmlFor="billing-cycle-landing"
                    className={cn(
                      "text-white/80",
                      billingCycle === "monthly" && "text-white font-semibold"
                    )}
                  >
                    Monthly
                  </Label>
                  <Switch
                    id="billing-cycle-landing"
                    checked={billingCycle === "yearly"}
                    onCheckedChange={(checked) =>
                      setBillingCycle(checked ? "yearly" : "monthly")
                    }
                  />
                  <Label
                    htmlFor="billing-cycle-landing"
                    className={cn(
                      "text-white/80",
                      billingCycle === "yearly" && "text-white font-semibold"
                    )}
                  >
                    Annual
                  </Label>
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
                  className={cn(
                    "bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 flex flex-col shadow-lg w-full max-w-sm relative",
                    plan.name === "Business" &&
                      "border-rose-300/80 ring-2 ring-rose-300/50"
                  )}
                >
                  {plan.name === "Business" && (
                    <div className="absolute -top-4 right-6 bg-rose-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      Best-Seller
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white/90 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-4xl font-extrabold text-white mb-6">
                    <PriceDisplay
                      prices={
                        plan.prices[billingCycle] || plan.prices["monthly"]
                      }
                    />
                    <span className="text-lg font-medium text-white/60">
                      /{billingCycle === "monthly" ? "mois" : "an"}
                    </span>
                  </p>
                  <ul className="space-y-3 mb-4 flex-grow">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-white/70">{feature}</span>
                        </li>
                      ))}
                  </ul>
                  <Button
                    variant="link"
                    size="sm"
                    className="mb-4 text-indigo-300 hover:text-indigo-200"
                    onClick={() => openPlanDetails(plan)}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    See all features
                  </Button>
                  <Link to="/signup" className="w-full">
                    <Button
                      className={cn(
                        "w-full py-3 text-base font-bold rounded-lg",
                        plan.name === "Business"
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      Choose this plan
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

      <MinimalFooter
        onPrivacyClick={() => setIsPrivacyOpen(true)}
        onTermsClick={() => setIsTermsOpen(true)}
      />
    </div>
  );
};

export default LandingPage;
export { PublicHeader, navLinks };
