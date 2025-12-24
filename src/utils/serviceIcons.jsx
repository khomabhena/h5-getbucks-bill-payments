// Service icon mapping using Google Material Icons
// Returns Material Icon name for each service type

export const getServiceIconName = (serviceName) => {
  const icons = {
    'Internet Broadband': 'wifi',
    'Electricity': 'bolt',
    'Gas': 'local_fire_department',
    'DSTV': 'tv',
    'Education': 'school',
    'Water': 'water_drop',
    'Insurance': 'shield',
    'TV': 'tv',
    'Television': 'tv',
    'Phone': 'phone',
    'Local Authorities': 'account_balance',
    'Retail Shops': 'store',
    'Other': 'receipt',
  };
  
  // Try to match service name
  const serviceNameUpper = serviceName?.toUpperCase() || '';
  for (const [key, icon] of Object.entries(icons)) {
    if (serviceNameUpper.includes(key.toUpperCase())) {
      return icon;
    }
  }
  
  return icons['Other'];
};

