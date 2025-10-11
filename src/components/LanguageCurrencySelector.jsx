import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
];

const currencies = [
  { code: 'eur', symbol: '€' },
  { code: 'usd', symbol: '$' },
  { code: 'chf', symbol: 'CHF' },
];

const LanguageCurrencySelector = ({ type = 'selector' , prices = {} }) => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language.split('-')[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem('currency') || 'eur');

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setSelectedLang(lng.split('-')[0]);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const changeCurrency = (currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('currency', currency);
    window.dispatchEvent(new Event('currencyChanged'));
  };
  
  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedCurrency(localStorage.getItem('currency') || 'eur');
    };
    window.addEventListener('currencyChanged', handleStorageChange);
    return () => {
      window.removeEventListener('currencyChanged', handleStorageChange);
    };
  }, []);

  if (type === 'price') {
    const price = prices[selectedCurrency] || prices['eur'];
    const symbol = currencies.find(c => c.code === selectedCurrency)?.symbol || '€';
    return <span>{price}{symbol}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10">
          <Globe className="w-4 h-4" />
          <span>{languages.find(l => l.code === selectedLang)?.name.split(' ')[0]} / {selectedCurrency.toUpperCase()}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#030303] border-white/10 text-white">
        {languages.map(lang => (
          <DropdownMenuItem key={lang.code} onSelect={() => changeLanguage(lang.code)} className="hover:!bg-white/10 focus:!bg-white/10">
            {lang.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-white/10" />
        {currencies.map(curr => (
          <DropdownMenuItem key={curr.code} onSelect={() => changeCurrency(curr.code)} className="hover:!bg-white/10 focus:!bg-white/10">
            {curr.symbol} {curr.code.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageCurrencySelector;