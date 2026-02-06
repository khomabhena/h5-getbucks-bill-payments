import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CountryServiceSelection from './pages/CountryServiceSelection';
import ProviderSelection from './pages/ProviderSelection';
import ProductSelection from './pages/ProductSelection';
import AccountInput from './pages/AccountInput';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import { ROUTES } from './data/constants';
import { getMode, getUrlParams } from './utils/modeDetection';
import { SessionProvider, useSession } from './context/SessionContext';

const AppShell = () => {
  const { tokenStatus, setTokenData, setTokenStatus } = useSession();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    
    const mode = getMode();
    const params = getUrlParams();

    const validateToken = async (token) => {
      const apiBaseUrl =
        import.meta.env.VITE_TOKEN_API_BASE_URL || 'https://4.222.185.132.nip.io/vas';
      const response = await fetch(
        `${apiBaseUrl}/api/validate-token?token=${encodeURIComponent(token)}`,
        { cache: 'no-store' }
      );
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      const data = await response.json();
      return data?.payload || null;
    };

    const init = async () => {
      // Skip validation if not in iframe mode
      if (mode !== 'iframe') {
        setTokenStatus('valid');
        return;
      }

      // Token must be in URL - no fallbacks
      if (!params.token) {
        setTokenStatus('invalid');
        return;
      }

      setTokenStatus('loading');

      try {
        const payload = await validateToken(params.token);
        hasInitialized.current = true;
        setTokenData({
          token: params.token,
          sessionId: payload?.sessionID || payload?.sessionId || null,
          tokenPayload: payload,
          accountNumber: params.accountNumber || null,
          clientNumber: params.clientNumber || null,
        });
        setTokenStatus('valid');
      } catch (error) {
        console.warn('Token validation failed:', error);
        hasInitialized.current = true;
        setTokenStatus('invalid');
      }
    };

    init();
  }, [setTokenData, setTokenStatus]);

  if (getMode() === 'iframe' && tokenStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Validating session...
      </div>
    );
  }

  if (getMode() === 'iframe' && tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600 px-6 text-center">
        Session expired or invalid. Please refresh and request a new token.
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<CountryServiceSelection />} />
        <Route path={ROUTES.PROVIDERS} element={<ProviderSelection />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductSelection />} />
        <Route path={ROUTES.ACCOUNT} element={<AccountInput />} />
        <Route path={ROUTES.PAYMENT} element={<Payment />} />
        <Route path={ROUTES.CONFIRMATION} element={<Confirmation />} />
        <Route path="*" element={<CountryServiceSelection />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}

export default App;
