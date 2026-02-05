import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CountryServiceSelection from './pages/CountryServiceSelection';
import ProviderSelection from './pages/ProviderSelection';
import ProductSelection from './pages/ProductSelection';
import AccountInput from './pages/AccountInput';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import { ROUTES } from './data/constants';
import { getMode, getUrlParams } from './utils/modeDetection';
import { iframeBridge } from './utils/iframeBridge';
import { SessionProvider, useSession } from './context/SessionContext';

const AppShell = () => {
  const { tokenStatus, setTokenData, setTokenStatus } = useSession();

  useEffect(() => {
    const mode = getMode();
    const params = getUrlParams();

    console.log('App initialized in mode:', mode, params);

    const validateToken = async (token) => {
      const apiBaseUrl =
        import.meta.env.VITE_TOKEN_API_BASE_URL || 'https://4.222.185.132.nip.io/vas';
      const response = await fetch(
        `${apiBaseUrl}/api/validate-token?token=${encodeURIComponent(token)}`
      );
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      const data = await response.json();
      return data?.payload || null;
    };

    const init = async () => {
      if (mode !== 'iframe') {
        setTokenStatus('valid');
        return;
      }

      setTokenStatus('loading');

      try {
        let token = params.token;
        if (!token) {
          const response = await iframeBridge.requestToken();
          token = response?.token;
        }

        if (!token) {
          setTokenStatus('invalid');
          return;
        }

        const payload = await validateToken(token);
        setTokenData({
          token,
          sessionId: payload?.sessionID || payload?.sessionId || null,
          tokenPayload: payload,
          accountNumber: params.accountNumber || null,
          clientNumber: params.clientNumber || null,
        });
        setTokenStatus('valid');
      } catch (error) {
        console.warn('Token validation failed:', error);
        setTokenStatus('invalid');
      }
    };

    if (mode === 'iframe') {
      iframeBridge.on('USER_UPDATE', (data) => {
        console.log('User info updated:', data);
      });

      iframeBridge.on('CONFIG_UPDATE', (data) => {
        console.log('Config updated:', data);
      });
    }

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
