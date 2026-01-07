import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card } from '../components';
import ProductCard from '../components/ProductCard';
import { appleTreeService } from '../services/appleTreeService';
import { ROUTES } from '../data/constants';
import { colors } from '../data/colors';
import { getServiceIconName } from '../utils/serviceIcons';
import { getDisplayIdentifierLabel } from '../utils/identifierLabel';

const ProductSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service, provider } = location.state || {};

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if no country/service/provider selected
  useEffect(() => {
    if (!country || !service || !provider) {
      navigate(ROUTES.PROVIDERS, { replace: true });
    }
  }, [country, service, provider, navigate]);

  // Load products when component mounts
  useEffect(() => {
    if (country && service && provider) {
      loadProducts();
    }
  }, [country, service, provider]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appleTreeService.getProducts({
        countryCode: country.countryCode,
        serviceId: service.Id,
        serviceProviderId: provider.Id || provider.id
      });

      if (result.success) {
        // Filter products by selected provider (client-side filtering as backup)
        const allProducts = result.data || [];
        const filteredProducts = allProducts.filter(product => {
          // Match by ServiceProvider ID
          const productProviderId = product.ServiceProvider?.Id || 
                                   product.ServiceProviderId || 
                                   product.serviceProviderId;
          const expectedProviderId = provider.Id || provider.id;
          
          return productProviderId === expectedProviderId;
        });
        
        console.log(`Loaded ${filteredProducts.length} products for ${provider.Name || provider.name} (from ${allProducts.length} total)`);
        setProducts(filteredProducts);
        
        // If only one product, auto-select it
        if (filteredProducts.length === 1) {
          setSelectedProduct(filteredProducts[0]);
        }
      } else {
        setError(result.error || 'Failed to load products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      
      // Check if it's a network error
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.message?.includes('NetworkError') ||
                            error.name === 'TypeError';
      
      if (isNetworkError) {
        setError('Network connection issue. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'Failed to load products. Please try again.');
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleContinue = () => {
    if (selectedProduct && country && service && provider) {
      navigate(ROUTES.ACCOUNT, {
        state: {
          country,
          service,
          provider,
          product: selectedProduct,
        },
      });
    }
  };

  const canContinue = selectedProduct && country && service && provider;

  // Get identifier label for next step
  const creditPartyIdentifier = selectedProduct?.CreditPartyIdentifiers?.[0];
  const identifierLabel = getDisplayIdentifierLabel(
    creditPartyIdentifier?.Name || creditPartyIdentifier?.Title,
    {
      serviceName: service?.Name,
      providerName: provider?.Name || provider?.name,
      productName: selectedProduct?.Name
    }
  );

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title="Select Product" showBackButton={true} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 overflow-y-auto">
          {/* Provider Info */}
          <div className="mb-6">
            <Card>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icon 
                    name={getServiceIconName(provider?.Name || provider?.name)} 
                    size={32} 
                    className="text-[#faa819]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-800 truncate">
                    {provider?.Name || provider?.name || 'Provider'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {service?.Name || 'Service'} • {country?.countryName || 'Country'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Products Section */}
          <Card className="mb-6">
            {loading && (
              <p className="text-sm font-medium text-gray-700 mb-3">
                <span className="text-xs text-gray-500">Loading...</span>
              </p>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <Icon name="refresh" size={32} className="text-[#faa819] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Icon name="error" size={32} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm mb-2">{error}</p>
                <Button
                  onClick={loadProducts}
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No products available for this provider
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const productId = product.Id || product.id;
                  const selectedId = selectedProduct?.Id || selectedProduct?.id;
                  const isSelected = selectedProduct && selectedId && selectedId === productId;
                  
                  return (
                    <ProductCard
                      key={productId}
                      product={product}
                      selected={!!isSelected}
                      onClick={() => handleProductSelect(product)}
                      service={service}
                      provider={provider}
                    />
                  );
                })}
              </div>
            )}
          </Card>

          {/* Next Step Info */}
          {selectedProduct && (
            <Card className="mb-6">
              <div className="flex items-start space-x-2">
                <Icon name="info" size={20} className="text-[#faa819] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Next Step
                  </p>
                  <p className="text-xs text-gray-600">
                    You'll need to enter your {identifierLabel.toLowerCase()} to continue
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-4">
            Select the product you want to purchase
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white pb-6 z-40"
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

export default ProductSelection;

