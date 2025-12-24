import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CountryServiceSelection from './pages/CountryServiceSelection';
import ProviderSelection from './pages/ProviderSelection';
import ProductSelection from './pages/ProductSelection';
import AccountInput from './pages/AccountInput';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import { ROUTES } from './data/constants';

function App() {
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
