import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Box, Button } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link } from 'react-router-dom';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';

export default function RecentTransactions({ transactions }) {
  // Use the localized date formatting hook
  const { formatDistanceToNow } = useLocalizedDateFormat();

  const getCategoryIcon = (category) => {
    const categoryMap = {
      'Food': <RestaurantIcon />,
      'Transportation': <DirectionsBusIcon />,
      'Fuel': <LocalGasStationIcon />,
      'Shopping': <ShoppingBasketIcon />,
      'Housing': <HomeIcon />,
      'Healthcare': <LocalHospitalIcon />,
      'Education': <SchoolIcon />,
    };
    return categoryMap[category] || <MoreHorizIcon />;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Food': '#FF8042',
      'Transportation': '#0088FE',
      'Fuel': '#00C49F',
      'Shopping': '#FFBB28',
      'Housing': '#8884D8',
      'Healthcare': '#FF6B6B',
      'Education': '#6A5ACD',
    };
    return colorMap[category] || '#9E9E9E';
  };

  // Map category names to translation keys
  const getTranslatedCategory = (category) => {
    const categoryKeyMap = {
      'Food': 'expenseManager.food',
      'Transportation': 'expenseManager.transportation',
      'Fuel': 'expenseManager.transport', // Fuel can map to transport
      'Shopping': 'expenseManager.shopping',
      'Housing': 'expenseManager.housing',
      'Healthcare': 'expenseManager.healthcare',
      'Education': 'expenseManager.education',
      'Utilities': 'expenseManager.utilities', // For electricity, internet bills
      'Travel': 'expenseManager.travel', // For souvenirs
    };
    return categoryKeyMap[category] ? <T>{categoryKeyMap[category]}</T> : category;
  };

  // Determine the display text: use description if available, otherwise use category
  const getDisplayText = (transaction) => {
    if (transaction.description && transaction.description !== transaction.category_name) {
      // If description exists and is different from category, use it as-is (user input)
      return transaction.description;
    }
    // Otherwise, translate the category
    return getTranslatedCategory(transaction.category_name);
  };

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            <T>dashboard.recentTransactions.title</T>
          </Typography>
          <Button component={Link} to="/reports" size="small" color="primary">
            <T>dashboard.recentTransactions.viewAll</T>
          </Button>
        </Box>

        {transactions && transactions.length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id || index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getCategoryColor(transaction.category_name) }}>
                      {getCategoryIcon(transaction.category_name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography component="span" variant="body1" color="text.primary">
                        {getDisplayText(transaction)}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          ${parseFloat(transaction.amount).toFixed(2)}
                        </Typography>
                        {" — "}
                        {formatDistanceToNow(new Date(transaction.date))}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < transactions.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            <T>dashboard.recentTransactions.noTransactions</T>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
