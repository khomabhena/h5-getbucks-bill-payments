import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenPayload, setTokenPayload] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  const [clientNumber, setClientNumber] = useState(null);
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [tokenStatus, setTokenStatus] = useState('idle');

  const setTokenData = useCallback(({
    token: nextToken,
    sessionId: nextSessionId,
    tokenPayload: nextPayload,
    accountNumber: nextAccountNumber,
    clientNumber: nextClientNumber,
    accountCurrency: nextAccountCurrency,
    currencyCode: nextCurrencyCode,
  }) => {
    setToken(nextToken || null);
    setSessionId(nextSessionId || null);
    setTokenPayload(nextPayload || null);
    setAccountNumber(nextAccountNumber || null);
    setClientNumber(nextClientNumber || null);
    if (nextAccountCurrency) setAccountCurrency(nextAccountCurrency);
    if (nextCurrencyCode) setCurrencyCode(nextCurrencyCode);
  }, []);

  const value = useMemo(
    () => ({
      sessionId,
      token,
      tokenPayload,
      accountNumber,
      clientNumber,
      accountCurrency,
      currencyCode,
      tokenStatus,
      setTokenData,
      setTokenStatus,
      setAccountCurrency,
    }),
    [
      sessionId,
      token,
      tokenPayload,
      accountNumber,
      clientNumber,
      accountCurrency,
      currencyCode,
      tokenStatus,
      setTokenData,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

