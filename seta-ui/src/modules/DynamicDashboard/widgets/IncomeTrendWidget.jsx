// src/modules/DynamicDashboard/widgets/IncomeTrendWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';


export function IncomeTrendWidget({ income = [], isLoading }) {
  const { t } = useTranslation(); // Get t function
  const { format: formatLocaleDate } = useLocalizedDateFormat();

  const dailyData = useMemo(() => {
    if (!income || income.length === 0) return [];

    const dailyMap = income.reduce((acc, inc) => {
      try {
        const date = parseISO(inc.date);
        if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(inc.amount) || 0;
            acc[dateString] = (acc[dateString] || 0) + amount;
        }
      } catch (e) { console.error("Error parsing date for income trend:", inc.date, e); }
      return acc;
    }, {});

    return Object.entries(dailyMap)
      .map(([dateString, total]) => ({
          date: dateString,
          name: formatLocaleDate(parseISO(dateString), 'MMM d'), // X-axis label
          total: total,
       }))
      .sort((a, b) => a.date.localeCompare(b.date));

  }, [income, formatLocaleDate]);

  const CustomTooltipContent = ({ active, payload, label: xAxisLabel }) => {
    const { format: formatTooltipDate } = useLocalizedDateFormat();

    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const fullDate = dataPoint.date ? parseISO(dataPoint.date) : null;
      const displayDate = fullDate && isValid(fullDate) ? formatTooltipDate(fullDate, 'MMM d, yyyy') : xAxisLabel;

      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="caption">{displayDate}</Typography>
          <Typography variant="body2" sx={{ color: payload[0].stroke }}>
              <T>dynamicDashboard.totalIncome</T> : ${payload[0].value.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Add specific translation key
   if (dailyData.length < 2) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}>
            <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForIncomeTrend</T></Typography>
        </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
            dataKey="name"
            style={{ fontSize: '10px' }}
            tickMargin={5}
            interval={dailyData.length > 30 ? Math.floor(dailyData.length / 7) : 'preserveStartEnd'} // Adaptive interval
            />
        <YAxis
            style={{ fontSize: '10px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            allowDecimals={false}
            />
        <Tooltip content={<CustomTooltipContent />} />
        {/* <Legend /> */}
        <Line
            type="monotone"
            dataKey="total"
            stroke="#4CAF50" // Green color for income
            strokeWidth={2}
            activeDot={{ r: 5 }}
            dot={dailyData.length < 60}
            name={t('dynamicDashboard.totalIncome')} // Legend name
            isAnimationActive={true}
            animationDuration={300}
            />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default React.memo(IncomeTrendWidget);
