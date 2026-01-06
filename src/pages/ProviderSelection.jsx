import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card, SelectionButton } from '../components';
import { appleTreeService } from '../services/appleTreeService';
import { ROUTES } from '../data/constants';
import { colors } from '../data/colors';
import { getServiceIconName } from '../utils/serviceIcons';

const ProviderSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service } = location.state || {};

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if no country/service selected
  useEffect(() => {
    if (!country || !service) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [country, service, navigate]);

  // Load providers when component mounts
  useEffect(() => {
    if (country && service) {
      loadProviders();
    }
  }, [country, service]);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appleTreeService.getServiceProviders({
        countryCode: country.countryCode,
        serviceId: service.Id
      });

      if (result.success) {
        // Filter providers by selected country (client-side filtering as backup)
        const filteredProviders = (result.data || []).filter(provider => {
          // Match by country code
          const matchesCountry = provider.Country?.Code === country.countryCode || 
                                provider.countryCode === country.countryCode;
          
          return matchesCountry;
        });
        
        console.log(`Loaded ${filteredProviders.length} providers for ${country.countryName} - ${service.Name}`);
        setProviders(filteredProviders);
      } else {
        setError(result.error || 'Failed to load providers');
        setProviders([]);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      
      // Check if it's a network error
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.message?.includes('NetworkError') ||
                            error.name === 'TypeError';
      
      if (isNetworkError) {
        setError('Network connection issue. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'Failed to load providers. Please try again.');
      }
      
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };

  const handleContinue = () => {
    if (selectedProvider && country && service) {
      navigate(ROUTES.PRODUCTS, {
        state: {
          country,
          service,
          provider: selectedProvider,
        },
      });
    }
  };

  const canContinue = selectedProvider && country && service;

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title="Select Provider" showBackButton={true} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 py-6 max-w-md mx-auto w-full px-4 pb-40 overflow-y-auto">
          {/* Service Info */}
          <div className="mb-6">
            <Card>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icon 
                    name={getServiceIconName(service?.Name)} 
                    size={32} 
                    className="text-[#faa819]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-800 truncate">
                    {service?.Name || 'Service'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {country?.countryName || 'Country'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Providers Section */}
          <Card className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select Provider
              {loading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            </p>
            
            {loading ? (
              <div className="text-center py-8">
                <Icon name="refresh" size={32} className="text-[#faa819] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading providers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Icon name="error" size={32} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm mb-2">{error}</p>
                <Button
                  onClick={loadProviders}
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No providers available for this service
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {providers.map((provider) => {
                  const providerId = provider.Id || provider.id;
                  const selectedId = selectedProvider?.Id || selectedProvider?.id;
                  const isSelected = selectedProvider && selectedId && selectedId === providerId;
                  
                  return (
                    <SelectionButton
                      key={providerId}
                      onClick={() => handleProviderSelect(provider)}
                      selected={!!isSelected}
                      size="md"
                      iconName={getServiceIconName(provider.Name || provider.name)}
                    >
                      <span className="text-xs leading-tight">{provider.Name || provider.name || 'Provider'}</span>
                    </SelectionButton>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-4">
            Select the service provider you want to pay
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-6 z-40"
        >
          <div className="max-w-md mx-auto px-4 pt-4">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              loading={loading}
              fullWidth
              size="lg"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProviderSelection;

