import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const currencies = [
  { code: 'eur', symbol: '€' },
  { code: 'usd', symbol: '$' },
  { code: 'chf', symbol: 'CHF' },
];

const CurrencySelector = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem('currency') || 'eur');

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10">
          <span>{selectedCurrency.toUpperCase()}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#030303] border-white/10 text-white">
        {currencies.map(curr => (
          <DropdownMenuItem key={curr.code} onSelect={() => changeCurrency(curr.code)} className="hover:!bg-white/10 focus:!bg-white/10">
            {curr.symbol} {curr.code.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const PriceDisplay = ({ prices }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem('currency') || 'eur');
  
    useEffect(() => {
      const handleCurrencyChange = () => {
        setSelectedCurrency(localStorage.getItem('currency') || 'eur');
      };
      window.addEventListener('currencyChanged', handleCurrencyChange);
      return () => {
        window.removeEventListener('currencyChanged', handleCurrencyChange);
      };
    }, []);
  
    const price = prices[selectedCurrency] || prices['eur'];
    const symbol = currencies.find(c => c.code === selectedCurrency)?.symbol || '€';
    return <span>{price}{symbol}</span>;
};


export default CurrencySelector;