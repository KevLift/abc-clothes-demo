import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const EXCHANGE_RATES = {
  LKR: 1,
  USD: 0.0031, // Example rate: 1 LKR = 0.0031 USD
  EUR: 0.0028,
  GBP: 0.0024
};

const SYMBOLS = {
  LKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('abc_currency') || 'LKR';
  });

  useEffect(() => {
    localStorage.setItem('abc_currency', currency);
  }, [currency]);

  const formatPrice = (priceInLkr) => {
    if (!priceInLkr) return '';
    const rate = EXCHANGE_RATES[currency] || 1;
    const converted = priceInLkr * rate;
    
    return `${SYMBOLS[currency] || 'Rs.'}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      availableCurrencies: Object.keys(EXCHANGE_RATES)
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
