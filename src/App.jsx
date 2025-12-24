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

function App() {
  useEffect(() => {
    // Initialize iframe bridge if in iframe mode
    const mode = getMode();
    const params = getUrlParams();
    
    console.log('App initialized in mode:', mode, params);
    
    if (mode === 'iframe') {
      // Request token if not in URL
      if (!params.token) {
        iframeBridge.requestToken().then((response) => {
          if (response?.token) {
            console.log('Token received from parent');
            // Store token if needed (avoid localStorage for security)
            // You can use a context or state management here
          }
        }).catch((error) => {
          console.warn('Could not get token from parent:', error);
        });
      }
      
      // Listen for user info updates
      iframeBridge.on('USER_UPDATE', (data) => {
        console.log('User info updated:', data);
      });
      
      // Listen for config updates
      iframeBridge.on('CONFIG_UPDATE', (data) => {
        console.log('Config updated:', data);
      });
    }
  }, []);

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
}

export default App;
