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

  // `amount` is expressed in `sourceCurrency` (the currency the product/order/payment
  // was actually priced or recorded in on the backend) — NOT always LKR. We first
  // normalize back to LKR (our rate table's base unit) then convert to whatever the
  // shopper has selected. Omitting sourceCurrency preserves the historical LKR-input
  // assumption for call sites that don't have a currency field to pass.
  const formatPrice = (amount, sourceCurrency = 'LKR') => {
    if (amount === null || amount === undefined || amount === '') return '';
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) return '';

    const sourceRate = EXCHANGE_RATES[sourceCurrency] || 1;
    const targetRate = EXCHANGE_RATES[currency] || 1;
    const amountInLkr = numericAmount / sourceRate;
    const converted = amountInLkr * targetRate;

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
