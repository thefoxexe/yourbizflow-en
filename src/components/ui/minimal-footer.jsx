import React from 'react';
import { Mail } from 'lucide-react';
import { FaTiktok, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SocialLink = ({ href, icon: Icon, label }) => {
  const { toast } = useToast();
  const isPending = href === '#';

  const handleClick = (e) => {
    if (isPending) {
      e.preventDefault();
      toast({
        title: "🚧 Bientôt disponible !",
        description: `Le lien pour ${label} sera ajouté prochainement.`,
      });
    }
  };

  return (
    <a
      href={href}
      target={isPending ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`transition-colors ${isPending ? 'text-white/40 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
};

export function MinimalFooter({ onPrivacyClick, onTermsClick }) {
	const year = new Date().getFullYear();
	const location = useLocation();
	const { t } = useTranslation();
	const isFr = location.pathname.startsWith('/fr');
	
	const privacyLink = isFr ? '/fr/confidentialite' : '/en/privacy';
	const termsLink = isFr ? '/fr/conditions' : '/en/terms';

	return (
		<footer className="w-full py-12 mt-12 border-t border-white/10">
			<div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <div className="flex items-center gap-3 mb-6 md:mb-0">
                    <img src="https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/6b69cc214c03819301dd8cb8579b78dc.png" alt="YourBizFlow Logo" className="w-8 h-8" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">YourBizFlow</span>
                </div>
                <div className="flex flex-col items-center gap-4 md:order-3">
                    <div className="flex gap-5">
                        <SocialLink href="https://www.tiktok.com/@yourbizflow" icon={FaTiktok} label="TikTok" />
                        <SocialLink href="https://www.instagram.com/yourbizflow" icon={FaInstagram} label="Instagram" />
                        <SocialLink href="https://www.youtube.com/@YourBizFlow" icon={FaYoutube} label="YouTube" />
                        <SocialLink href="https://www.linkedin.com/company/108963525" icon={FaLinkedin} label="LinkedIn" />
                        <SocialLink href="mailto:info@yourbizflow.com" icon={Mail} label="Email" />
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link to={privacyLink} className="text-sm text-white/60 hover:text-white transition-colors">
                          {t('footer_privacy')}
                        </Link>
                        <Link to={termsLink} className="text-sm text-white/60 hover:text-white transition-colors">
                          {t('footer_terms')}
                        </Link>
                    </div>
                </div>
				<p className="text-white/60 text-sm mt-6 md:mt-0 md:order-2">
					© {year} YourBizFlow. {isFr ? 'Tous droits réservés' : 'All rights reserved'}.
				</p>
			</div>
		</footer>
	);
}
