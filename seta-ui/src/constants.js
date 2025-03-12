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
  MoreHoriz as MoreHorizIcon,
  Subscriptions as SubscriptionsIcon,
  DirectionsBus as DirectionsBusIcon,
  Fastfood as FastfoodIcon,
} from '@mui/icons-material';

// Define categories with original names, normalized keys, and associated icons
export const expenseCategories = [
  { name: 'Food & Dining', key: 'foodAndDining', icon: RestaurantIcon },
  { name: 'Transportation', key: 'transportation', icon: DirectionsCarIcon },
  { name: 'Housing', key: 'housing', icon: HomeIcon },
  { name: 'Entertainment', key: 'entertainment', icon: MovieIcon },
  { name: 'Healthcare', key: 'healthcare', icon: LocalHospitalIcon },
  { name: 'Shopping', key: 'shopping', icon: ShoppingCartIcon },
  { name: 'Education', key: 'education', icon: SchoolIcon },
  { name: 'Utilities', key: 'utilities', icon: LightbulbIcon },
  { name: 'Travel', key: 'travel', icon: FlightIcon },
  { name: 'Personal Care', key: 'personalCare', icon: SpaIcon },
  { name: 'Subscriptions', key: 'subscriptions', icon: SubscriptionsIcon },
  { name: 'Transport', key: 'transport', icon: DirectionsBusIcon },
  { name: 'Food', key: 'food', icon: FastfoodIcon },
  { name: 'Others (Specify)', key: 'othersSpecify', icon: MoreHorizIcon },
];
