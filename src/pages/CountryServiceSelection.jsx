import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card, SelectionButton } from '../components';
import { appleTreeService } from '../services/appleTreeService';
import { getCountryByCode } from '../data/countries';
import { ROUTES, SERVICES } from '../data/constants';
import { colors } from '../data/colors';
import { getServiceIconName } from '../utils/serviceIcons';
import Flag from '../components/Flag';

// Only support Zimbabwe for now
const SUPPORTED_COUNTRY_CODE = 'ZW';

const CountryServiceSelection = () => {
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);

  // Load services function
  const loadServices = useCallback(async (countryCode) => {
    setLoadingServices(true);
    try {
      const result = await appleTreeService.getServices(countryCode);
      
      if (result.success) {
        // Filter out Mobile services (1, 2, 3) - only show bill payment services
        const billPaymentServices = result.data.filter(
          service => ![SERVICES.MOBILE_AIRTIME, SERVICES.MOBILE_DATA, SERVICES.MOBILE_BUNDLES].includes(service.Id)
        );
        setServices(billPaymentServices);
      } else {
        console.error('Failed to load services:', result.error);
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Auto-select Zimbabwe on component mount
  useEffect(() => {
    const zimbabwe = getCountryByCode(SUPPORTED_COUNTRY_CODE);
    if (zimbabwe) {
      setSelectedCountry(zimbabwe);
    }
  }, []);

  // Load services when country is selected
  useEffect(() => {
    if (selectedCountry) {
      loadServices(selectedCountry.countryCode);
    } else {
      setServices([]);
    }
  }, [selectedCountry, loadServices]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (selectedCountry && selectedService) {
      navigate(ROUTES.PROVIDERS, {
        state: {
          country: selectedCountry,
          service: selectedService,
        },
      });
    }
  };

  const canContinue = selectedCountry && selectedService;

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen safe-area-inset">
        {/* Header */}
        <Header title="Bill Payments" showBackButton={false} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 overflow-y-auto border-x border-gray-200">
          {/* Welcome Section */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600">
              Select service type
            </p>
          </div>

          {/* Country Display (Read-only) */}
          {selectedCountry && (
            <Card className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2.5 sm:mb-3">
                Country
              </p>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Flag countryCode={selectedCountry.countryCode} size="lg" />
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  {selectedCountry.countryName}
                </span>
              </div>
            </Card>
          )}

          {/* Service Selection Section */}
          <Card className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2.5 sm:mb-3">
              Select Service
              {loadingServices && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            </p>
            
            {loadingServices ? (
              <div className="text-center py-6 sm:py-8">
                <Icon name="refresh" size={28} className="text-[#faa819] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-xs sm:text-sm">Loading services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
                No services available
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {services.map((service) => (
                  <SelectionButton
                    key={service.Id}
                    onClick={() => handleServiceSelect(service)}
                    selected={selectedService?.Id === service.Id}
                    size="md"
                    iconName={getServiceIconName(service.Name)}
                    className="touch-manipulation min-h-[80px] sm:min-h-[90px]"
                  >
                    <span className="text-xs leading-tight">{service.Name}</span>
                  </SelectionButton>
                ))}
              </div>
            )}
          </Card>

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-3 sm:mb-4 px-2">
            Secure payment powered by Getbucks Bank
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white pb-safe sm:pb-6 z-40 safe-area-inset-bottom"
        >
          <div className="max-w-md mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              loading={loadingServices}
              fullWidth
              size="lg"
              className="touch-manipulation min-h-[48px] sm:min-h-[52px]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CountryServiceSelection;

