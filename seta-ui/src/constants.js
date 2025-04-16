// src/constants.js
import {
  Restaurant as RestaurantIcon,
  DirectionsCar as DirectionsCarIcon,
  Home as HomeIcon,
  Movie as MovieIcon,
  LocalHospital as LocalHospitalIcon,
  ShoppingCart as ShoppingCartIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Flight as FlightIcon,
  Spa as SpaIcon,
  Subscriptions as SubscriptionsIcon,
  // DirectionsBus is no longer needed if we remove 'Transport'
  MoreHoriz as MoreHorizIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';

// --- Cleaned List ---
export const expenseCategories = [
  { name: 'Food & Dining',   key: 'foodAndDining',   icon: RestaurantIcon },      // Kept this one
  { name: 'Transportation',  key: 'transportation',  icon: DirectionsCarIcon },   // Kept this one
  { name: 'Housing',         key: 'housing',         icon: HomeIcon },
  { name: 'Entertainment',   key: 'entertainment',   icon: MovieIcon },
  { name: 'Healthcare',      key: 'healthcare',      icon: LocalHospitalIcon },
  { name: 'Shopping',        key: 'shopping',        icon: ShoppingCartIcon },
  { name: 'Education',       key: 'education',       icon: SchoolIcon },
  { name: 'Utilities',       key: 'utilities',       icon: LightbulbIcon },
  { name: 'Travel',          key: 'travel',          icon: FlightIcon },
  { name: 'Personal Care',   key: 'personalCare',    icon: SpaIcon },             // Ensure key is 'personalCare'
  { name: 'Subscriptions',   key: 'subscriptions',   icon: SubscriptionsIcon },
  // { name: 'Transport',       key: 'transport',       icon: DirectionsBusIcon }, // REMOVED
  // { name: 'Food',            key: 'food',            icon: RestaurantIcon },    // REMOVED
  { name: 'Others (Specify)',key: 'othersSpecify',   icon: MoreHorizIcon },
];
// --- End Cleaned List ---

// Helper function to get category details (including key and icon) by name
export const getCategoryDetails = (categoryName) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    return category;
};

// Helper function to get only the icon component for a category name
export const getCategoryIcon = (categoryName) => {
    const category = getCategoryDetails(categoryName);
    return category ? category.icon : ReceiptLongIcon;
};

// Optional: Export a list of just the names if needed elsewhere
export const expenseCategoryNames = expenseCategories.map(cat => cat.name);
