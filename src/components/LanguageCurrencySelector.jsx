import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];

const LanguageSelector = ({ inHeader = false }) => {
  const { i18n } = useTranslation();
  const selectedLang = (i18n.language || 'en').split('-')[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguageName = languages.find(l => l.code === selectedLang)?.name || 'Language';

  if (inHeader) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <Globe className="w-5 h-5" />
            <span className="hidden sm:inline">{currentLanguageName}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map(lang => (
            <DropdownMenuItem key={lang.code} onSelect={() => changeLanguage(lang.code)}>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10">
          <Globe className="w-4 h-4" />
          <span>{currentLanguageName}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#030303] border-white/10 text-white">
        {languages.map(lang => (
          <DropdownMenuItem key={lang.code} onSelect={() => changeLanguage(lang.code)} className="hover:!bg-white/10 focus:!bg-white/10">
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;