import React from 'react';
    import { motion } from 'framer-motion';
    import { cn } from '@/lib/utils';
    import { TrendingUp, TrendingDown } from 'lucide-react';

    const StatsCard = ({ title, value, change, icon: Icon, loading, changeColor, isBlurred }) => {
      let displayValue = value;
      let currencySymbol = '';

      if (typeof value === 'string') {
        const currencyRegex = /^(€|\$|CHF|£|¥|₹|₽|₩|₺|₴|₪|₫|฿|₱|₲|₡|₦|zł|kr|Ft|Kč|lei|лв|din|KM|MDL|ден|ман|ლ|֏|₼|₾|₸|₮|₴|₵|₦|₭|₫|₢|₠|₣|₤|₧|₯|₰|₳|₶|₷|₻|₼|₾|₿)/;
        const match = value.match(currencyRegex);
        if (match) {
          currencySymbol = match[1];
          displayValue = value.substring(match[1].length);
        }
      }
      
      if (typeof displayValue === 'number') {
        displayValue = displayValue.toString();
      }

      const isPositive = change && change.startsWith('+');
      const isNegative = change && change.startsWith('-');

      return (
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card/50 border border-border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-primary/10 hover:border-primary/30"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              {change && (
                <div className={cn(
                    "flex items-center text-xs font-medium", 
                    changeColor || (isPositive ? 'text-green-500' : 'text-red-500')
                )}>
                  {isPositive && <TrendingUp className="w-4 h-4 mr-1"/>}
                  {isNegative && <TrendingDown className="w-4 h-4 mr-1"/>}
                  {change}
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-xs md:text-sm capitalize mb-1">{title}</p>
          </div>
          
          {loading ? (
            <div className="h-8 w-3/4 bg-muted/20 rounded-md animate-pulse mt-1"></div>
          ) : (
            <div className={cn(
              "flex items-baseline flex-wrap",
              { "text-red-500": typeof value === 'string' && value.startsWith('-') }
            )}>
              {currencySymbol && <span className="text-lg font-medium text-muted-foreground mr-1">{currencySymbol}</span>}
              <h3 className={cn(
                "text-xl sm:text-2xl font-bold leading-none break-all",
                { "filter blur-md": isBlurred },
                changeColor
              )}>
                {isBlurred ? '******' : displayValue}
              </h3>
            </div>
          )}
        </motion.div>
      );
    };

    export default StatsCard;