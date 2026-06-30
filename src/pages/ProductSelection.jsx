import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card } from '../components';
import ProductCard from '../components/ProductCard';
import { appleTreeService } from '../services/appleTreeService';
import { ROUTES } from '../data/constants';
import { colors } from '../data/colors';
import { getServiceIconName } from '../utils/serviceIcons';
import { getDisplayIdentifierLabel } from '../utils/identifierLabel';
import { useSession } from '../context/SessionContext';
import { getDefaultCheckoutCurrency } from '../config/catalogCurrency';

const ProductSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service, provider } = location.state || {};
  const { accountCurrency } = useSession();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categoryStack, setCategoryStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentParentProduct =
    categoryStack.length > 0 ? categoryStack[categoryStack.length - 1].id : null;

  useEffect(() => {
    if (!country || !service || !provider) {
      navigate(ROUTES.PROVIDERS, { replace: true });
    }
  }, [country, service, provider, navigate]);

  const loadProducts = useCallback(async () => {
    if (!country || !service || !provider) return;

    setLoading(true);
    setError(null);
    setSelectedProduct(null);

    try {
      const currency = accountCurrency || getDefaultCheckoutCurrency();
      const filters = currentParentProduct
        ? { parentProduct: currentParentProduct, currency }
        : {
            countryCode: country.countryCode,
            serviceId: service.Id,
            serviceProviderId: provider.Id || provider.id,
            currency,
          };

      const result = await appleTreeService.getProducts(filters);

      if (!result.success) {
        setError(result.error || 'Failed to load products');
        setCategories([]);
        setProducts([]);
        return;
      }

      const allProducts = result.data || [];
      let scopedProducts = allProducts;

      if (!currentParentProduct) {
        scopedProducts = allProducts.filter((product) => {
          if (product.IsCategory === true) return true;
          const productProviderId =
            product.ServiceProvider?.Id ||
            product.ServiceProviderId ||
            product.serviceProviderId;
          const expectedProviderId = provider.Id || provider.id;
          return productProviderId === expectedProviderId;
        });
      }

      const categoryRows = scopedProducts.filter((product) => product.IsCategory === true);
      const leafProducts = scopedProducts.filter((product) => product.IsCategory !== true);

      setCategories(categoryRows);
      setProducts(leafProducts);

      if (leafProducts.length === 1) {
        setSelectedProduct(leafProducts[0]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.name === 'TypeError';

      setError(
        isNetworkError
          ? 'Network connection issue. Please check your internet connection and try again.'
          : err.message || 'Failed to load products. Please try again.'
      );
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [country, service, provider, accountCurrency, currentParentProduct]);

  useEffect(() => {
    if (country && service && provider) {
      loadProducts();
    }
  }, [country, service, provider, loadProducts]);

  const handleCategoryOpen = (category) => {
    setCategoryStack((prev) => [
      ...prev,
      { id: category.Id || category.id, name: category.Name || category.name },
    ]);
  };

  const handleHeaderBack = () => {
    if (categoryStack.length > 0) {
      setCategoryStack((prev) => prev.slice(0, -1));
    } else {
      navigate(-1);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleContinue = () => {
    if (selectedProduct && !selectedProduct.IsCategory && country && service && provider) {
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

  const canContinue =
    selectedProduct && !selectedProduct.IsCategory && country && service && provider;

  const creditPartyIdentifier = selectedProduct?.CreditPartyIdentifiers?.[0];
  const identifierLabel = getDisplayIdentifierLabel(
    creditPartyIdentifier?.Title,
    {
      serviceName: service?.Name,
      providerName: provider?.Name || provider?.name,
      productName: selectedProduct?.Name,
    }
  );

  const headerTitle =
    categoryStack.length > 0
      ? categoryStack[categoryStack.length - 1].name
      : 'Select Product';

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        <Header title={headerTitle} showBackButton={true} onBack={handleHeaderBack} />

        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 overflow-y-auto border-x border-gray-200">
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

          <Card className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {currentParentProduct ? 'Products' : 'Available Products'}
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <Icon name="refresh" size={32} className="text-[#faa819] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Icon name="error" size={32} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm mb-2">{error}</p>
                <Button onClick={loadProducts} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            ) : categories.length === 0 && products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No products available for this provider
              </div>
            ) : (
              <div className="space-y-6 mt-2">
                {categories.map((category) => (
                  <ProductCard
                    key={category.Id || category.id}
                    product={category}
                    isCategory={true}
                    onClick={() => handleCategoryOpen(category)}
                    service={service}
                    provider={provider}
                  />
                ))}
                {products.map((product) => {
                  const productId = product.Id || product.id;
                  const selectedId = selectedProduct?.Id || selectedProduct?.id;
                  const isSelected =
                    selectedProduct && selectedId && selectedId === productId;

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

          {selectedProduct && !selectedProduct.IsCategory && (
            <Card className="mb-6">
              <div className="flex items-start space-x-2">
                <Icon name="info" size={20} className="text-[#faa819] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Next Step</p>
                  <p className="text-xs text-gray-600">
                    You'll need to enter your {identifierLabel.toLowerCase()} to continue
                  </p>
                </div>
              </div>
            </Card>
          )}

          <p className="text-xs text-center text-gray-500 mb-4">
            Select the product you want to purchase
          </p>
        </div>

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
