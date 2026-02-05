import React, { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenPayload, setTokenPayload] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  const [clientNumber, setClientNumber] = useState(null);
  const [tokenStatus, setTokenStatus] = useState('idle');

  const setTokenData = ({
    token: nextToken,
    sessionId: nextSessionId,
    tokenPayload: nextPayload,
    accountNumber: nextAccountNumber,
    clientNumber: nextClientNumber,
  }) => {
    setToken(nextToken || null);
    setSessionId(nextSessionId || null);
    setTokenPayload(nextPayload || null);
    setAccountNumber(nextAccountNumber || null);
    setClientNumber(nextClientNumber || null);
  };

  const value = useMemo(
    () => ({
      sessionId,
      token,
      tokenPayload,
      accountNumber,
      clientNumber,
      tokenStatus,
      setTokenData,
      setTokenStatus,
    }),
    [sessionId, token, tokenPayload, accountNumber, clientNumber, tokenStatus]
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

