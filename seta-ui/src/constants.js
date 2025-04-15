// file name: src/constants.js (or wherever you keep project constants)

import {
  Restaurant as RestaurantIcon,          // For Food & Dining, Food
  DirectionsCar as DirectionsCarIcon,      // For Transportation
  Home as HomeIcon,                      // For Housing
  Movie as MovieIcon,                    // For Entertainment
  LocalHospital as LocalHospitalIcon,    // For Healthcare
  ShoppingCart as ShoppingCartIcon,      // For Shopping
  School as SchoolIcon,                  // For Education
  Lightbulb as LightbulbIcon,            // For Utilities
  Flight as FlightIcon,                  // For Travel
  Spa as SpaIcon,                        // For Personal Care
  Subscriptions as SubscriptionsIcon,    // For Subscriptions
  DirectionsBus as DirectionsBusIcon,    // For Transport (Alternative)
  MoreHoriz as MoreHorizIcon,            // For Others (Specify)
  // Add any other icons you might need
  ReceiptLong as ReceiptLongIcon,        // Default/Fallback icon
} from '@mui/icons-material';

// Define categories with original names, stable keys for translation, and associated icons
export const expenseCategories = [
  // Categories from your snippet, ensure keys are unique and match locale files
  { name: 'Food & Dining',   key: 'foodAndDining',   icon: RestaurantIcon },
  { name: 'Transportation',  key: 'transportation',  icon: DirectionsCarIcon }, // Consider if this or 'Transport' is primary
  { name: 'Housing',         key: 'housing',         icon: HomeIcon },
  { name: 'Entertainment',   key: 'entertainment',   icon: MovieIcon },
  { name: 'Healthcare',      key: 'healthcare',      icon: LocalHospitalIcon },
  { name: 'Shopping',        key: 'shopping',        icon: ShoppingCartIcon },
  { name: 'Education',       key: 'education',       icon: SchoolIcon },
  { name: 'Utilities',       key: 'utilities',       icon: LightbulbIcon },
  { name: 'Travel',          key: 'travel',          icon: FlightIcon },
  { name: 'Personal Care',   key: 'personalCare',    icon: SpaIcon },
  { name: 'Subscriptions',   key: 'subscriptions',   icon: SubscriptionsIcon },
  { name: 'Transport',       key: 'transport',       icon: DirectionsBusIcon }, // Matches a specific entry in your snippet
  { name: 'Food',            key: 'food',            icon: RestaurantIcon }, // Simpler 'Food' entry from snippet
  { name: 'Others (Specify)',key: 'othersSpecify',   icon: MoreHorizIcon },

  // Add any other categories your application supports
  // { name: 'Gifts & Donations', key: 'giftsDonations', icon: CardGiftcardIcon },
  // { name: 'Investments',     key: 'investments',     icon: TrendingUpIcon },
];

// Helper function to get category details (including key and icon) by name
export const getCategoryDetails = (categoryName) => {
    // Find the category matching the provided name
    const category = expenseCategories.find(cat => cat.name === categoryName);
    // Return the found category object or null/undefined if not found
    return category;
};

// Helper function to get only the icon component for a category name
export const getCategoryIcon = (categoryName) => {
    const category = getCategoryDetails(categoryName);
    // Return the specific icon or a default fallback icon
    return category ? category.icon : ReceiptLongIcon; // Use a sensible default
};

// Optional: Export a list of just the names if needed elsewhere
export const expenseCategoryNames = expenseCategories.map(cat => cat.name);
