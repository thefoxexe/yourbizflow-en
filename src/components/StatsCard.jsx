import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, change, icon: Icon, loading, changeColor, isBlurred }) => {
  let displayValue = value;
  let currencySymbol = '';

  // Check if the value is a string and contains a currency symbol at the beginning
  if (typeof value === 'string') {
    const currencyRegex = /^(€|\$|CHF|£|¥|₹|₽|₩|₺|₴|₪|₫|฿|₱|₲|₡|₦|zł|kr|Ft|Kč|lei|лв|din|KM|MDL|ден|ман|ლ|֏|₼|₾|₸|₮|₴|₵|₦|₭|₫|₢|₠|₣|₤|₧|₯|₰|₳|₶|₷|₻|₼|₾|₿)/;
    const match = value.match(currencyRegex);
    if (match) {
      currencySymbol = match[1];
      displayValue = value.substring(match[1].length);
    }
  }
  
  // Ensure displayValue is a string for consistent handling
  if (typeof displayValue === 'number') {
    displayValue = displayValue.toString();
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/30"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {change && <span className={cn("text-xs font-medium", changeColor || (change.startsWith('+') ? 'text-green-500' : 'text-red-500'))}>{change}</span>}
        </div>
        <p className="text-muted-foreground text-xs md:text-sm capitalize mb-1">{title}</p>
      </div>
      
      {loading ? (
        <div className="h-8 w-3/4 bg-white/10 rounded-md animate-pulse mt-1"></div>
      ) : (
        <div className="flex items-baseline flex-wrap"> {/* Added flex-wrap here */}
          {currencySymbol && <span className="text-lg font-medium text-muted-foreground mr-1">{currencySymbol}</span>}
          <h3 className={cn(
            "text-xl sm:text-2xl font-bold text-foreground leading-none break-all", // Adjusted text size and added break-all
            { "filter blur-md": isBlurred }
          )}>
            {isBlurred ? '******' : displayValue}
          </h3>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;