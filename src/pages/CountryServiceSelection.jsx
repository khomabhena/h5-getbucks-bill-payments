import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card, InputField, SelectionButton } from '../components';
import { appleTreeService } from '../services/appleTreeService';
import { getAllCountries } from '../data/countries';
import { ROUTES, SERVICES } from '../data/constants';
import { colors } from '../data/colors';
import { getServiceIconName } from '../utils/serviceIcons';
import Flag from '../components/Flag';

// Popular countries (most commonly used)
const POPULAR_COUNTRIES = ['ZW', 'KE', 'ZA', 'NG', 'GH'];

const CountryServiceSelection = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  
  const [services, setServices] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCountries, setShowAllCountries] = useState(false);

  // Load countries data on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const allCountries = getAllCountries();
        setCountries(allCountries);
      } catch (error) {
        console.error('Error loading countries data:', error);
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    };
    
    loadCountries();
  }, []);

  // Load services when country is selected
  useEffect(() => {
    if (selectedCountry) {
      loadServices(selectedCountry.countryCode);
    } else {
      setServices([]);
    }
  }, [selectedCountry]);

  const loadServices = async (countryCode) => {
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
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedService(null); // Reset service when country changes
    setShowAllCountries(false); // Collapse all countries when one is selected
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  // Filter and sort countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      // When no search, show popular countries first, then others
      const popular = countries.filter(c => POPULAR_COUNTRIES.includes(c.countryCode));
      const others = countries.filter(c => !POPULAR_COUNTRIES.includes(c.countryCode));
      return [...popular, ...others];
    }
    
    // Filter by search query (case-insensitive)
    const query = searchQuery.toLowerCase().trim();
    return countries.filter(country => 
      country.countryName.toLowerCase().includes(query) ||
      country.countryCode.toLowerCase().includes(query) ||
      country.callingCode.includes(query)
    );
  }, [countries, searchQuery]);

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
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title="Bill Payments" showBackButton={false} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-40 overflow-y-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pay Your Bills
            </h2>
            <p className="text-sm text-gray-600">
              Select country and service type
            </p>
          </div>

          {/* Country Selection Section */}
          <Card className="mb-6">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select Country
                {loadingCountries && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
              </p>
              
              {/* Search Input */}
              <InputField
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon name="search" size={20} className="text-gray-400" />}
                rightIcon={
                  searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="close" size={20} />
                    </button>
                  )
                }
              />
            </div>

            {loadingCountries ? (
              <div className="text-center py-8">
                <Icon name="refresh" size={32} className="text-[#faa819] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading countries...</p>
              </div>
            ) : (
              <>
                {/* Popular Countries Section (only when no search) */}
                {!searchQuery && filteredCountries.some(c => POPULAR_COUNTRIES.includes(c.countryCode)) && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Popular</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredCountries
                        .filter(c => POPULAR_COUNTRIES.includes(c.countryCode))
                        .map((country) => (
                          <SelectionButton
                            key={country.countryCode}
                            onClick={() => handleCountrySelect(country)}
                            selected={selectedCountry?.countryCode === country.countryCode}
                            size="sm"
                            icon={<Flag countryCode={country.countryCode} size="lg" />}
                          >
                            {country.countryName}
                          </SelectionButton>
                        ))}
                    </div>
                  </div>
                )}

                {/* Show All Countries Button (only when no search and not showing all) */}
                {!searchQuery && !showAllCountries && filteredCountries.some(c => !POPULAR_COUNTRIES.includes(c.countryCode)) && (
                  <button
                    onClick={() => setShowAllCountries(true)}
                    className="w-full py-2 text-sm text-[#faa819] font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Show All Countries ({filteredCountries.filter(c => !POPULAR_COUNTRIES.includes(c.countryCode)).length})
                  </button>
                )}

                {/* All Countries / Search Results */}
                {(searchQuery || showAllCountries) && (
                  <div>
                    {searchQuery && (
                      <p className="text-xs text-gray-500 mb-2">
                        {filteredCountries.length > 0 ? `Found ${filteredCountries.length} countries` : 'No results'}
                      </p>
                    )}
                    
                    {!searchQuery && showAllCountries && (
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">All Countries</p>
                        <button
                          onClick={() => setShowAllCountries(false)}
                          className="text-xs text-[#faa819] font-medium hover:underline"
                        >
                          Show Less
                        </button>
                      </div>
                    )}
                    
                    {filteredCountries.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No countries found matching "{searchQuery}"
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {filteredCountries
                          .filter(c => {
                            // When searching, show all filtered results
                            // When showing all, show only non-popular countries (popular ones shown separately)
                            return searchQuery ? true : !POPULAR_COUNTRIES.includes(c.countryCode);
                          })
                          .map((country) => (
                            <SelectionButton
                              key={country.countryCode}
                              onClick={() => handleCountrySelect(country)}
                              selected={selectedCountry?.countryCode === country.countryCode}
                              size="sm"
                              icon={<Flag countryCode={country.countryCode} size="lg" />}
                            >
                              {country.countryName}
                            </SelectionButton>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Service Selection Section */}
          <Card className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select Service
              {loadingServices && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            </p>
            
            {!selectedCountry ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Please select a country first
              </div>
            ) : loadingServices ? (
              <div className="text-center py-8">
                <Icon name="refresh" size={32} className="text-[#faa819] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No services available for this country
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {services.map((service) => (
                  <SelectionButton
                    key={service.Id}
                    onClick={() => handleServiceSelect(service)}
                    selected={selectedService?.Id === service.Id}
                    size="md"
                    iconName={getServiceIconName(service.Name)}
                  >
                    {service.Name}
                  </SelectionButton>
                ))}
              </div>
            )}
          </Card>

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-4">
            Secure payment powered by Getbucks Bank
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 shadow-lg z-40"
        >
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              loading={loadingServices}
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

export default CountryServiceSelection;

