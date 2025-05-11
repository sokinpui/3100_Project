// src/modules/DynamicDashboard/widgets/NetFlowTrendWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat'; // Import the hook


export function NetFlowTrendWidget({ expenses = [], income = [], isLoading }) {
  const { t } = useTranslation();
  const { format: formatLocaleDate } = useLocalizedDateFormat(); // Use the date formatting hook

  // --- Calculate daily data AND min/max net flow ---
  const { dailyNetFlowData, minNetFlow, maxNetFlow } = useMemo(() => {
    if ((!expenses || expenses.length === 0) && (!income || income.length === 0)) {
        return { dailyNetFlowData: [], minNetFlow: 0, maxNetFlow: 0 };
    }

    const dailyMap = {};
    let overallMin = Infinity;
    let overallMax = -Infinity;

    income.forEach(inc => {
      try {
        const date = parseISO(inc.date);
        if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(inc.amount) || 0;
            if (!dailyMap[dateString]) dailyMap[dateString] = { income: 0, expense: 0 };
            dailyMap[dateString].income += amount;
        }
      } catch (e) { /* ignore */ }
    });

    expenses.forEach(exp => {
      try {
        const date = parseISO(exp.date);
         if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(exp.amount) || 0;
            if (!dailyMap[dateString]) dailyMap[dateString] = { income: 0, expense: 0 };
            dailyMap[dateString].expense += amount;
        }
      } catch (e) { /* ignore */ }
    });

    const chartData = Object.entries(dailyMap)
      .map(([dateString, totals]) => {
          const netFlow = totals.income - totals.expense;
          // Update min/max
          if (netFlow < overallMin) overallMin = netFlow;
          if (netFlow > overallMax) overallMax = netFlow;
          return {
              date: dateString,
              name: formatLocaleDate(parseISO(dateString), 'MMM d'),
              netFlow: netFlow,
          }
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Handle cases where min/max remain at initial values (e.g., no data)
    if (overallMin === Infinity) overallMin = 0;
    if (overallMax === -Infinity) overallMax = 0;

    return { dailyNetFlowData: chartData, minNetFlow: overallMin, maxNetFlow: overallMax };

  }, [expenses, income, formatLocaleDate]); // Add formatLocaleDate dependency

  // --- Calculate Y-axis domain with padding ---
   const yAxisDomain = useMemo(() => {
        const padding = Math.max(50, Math.abs(maxNetFlow - minNetFlow) * 0.1); // Add padding (at least 50)
        let domainMin = minNetFlow - padding;
        let domainMax = maxNetFlow + padding;

        // Ensure 0 is included if the range crosses it
        if (minNetFlow < 0 && maxNetFlow > 0) {
            // Domain already covers 0
        } else if (minNetFlow >= 0) {
            domainMin = 0; // Start at 0 if all values are non-negative
        } else { // maxNetFlow <= 0
            domainMax = 0; // End at 0 if all values are non-positive
        }

        // Round to nearest nice number if desired (e.g., multiple of 50 or 100), optional
        // domainMin = Math.floor(domainMin / 50) * 50;
        // domainMax = Math.ceil(domainMax / 50) * 50;

        return [domainMin, domainMax];
   }, [minNetFlow, maxNetFlow]);

  const CustomTooltipContent = ({ active, payload, label: xAxisLabel }) => {
    const { t: t_tooltip } = useTranslation();
    const { format: formatTooltipDate } = useLocalizedDateFormat();

    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const fullDate = dataPoint.date ? parseISO(dataPoint.date) : null;
      const displayDate = fullDate && isValid(fullDate) ? formatTooltipDate(fullDate, 'MMM d, yyyy') : xAxisLabel;

      const value = payload[0].value;
      const color = value >= 0 ? '#4CAF50' : '#f44336';

      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="caption">{displayDate}</Typography>
          <Typography variant="body2" sx={{ color: color }}>
            {t_tooltip('dynamicDashboard.netFlow')} : ${value.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   if (dailyNetFlowData.length < 2) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}>
            <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForNetFlowTrend</T></Typography>
        </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyNetFlowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
            dataKey="name"
            style={{ fontSize: '10px' }}
            tickMargin={5}
            interval={dailyNetFlowData.length > 30 ? Math.floor(dailyNetFlowData.length / 7) : 'preserveStartEnd'}
            />
        <YAxis
            style={{ fontSize: '10px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            allowDecimals={false}
            allowDataOverflow={true} // Keep this
            domain={yAxisDomain} // Explicitly set the domain
            />
        <Tooltip content={<CustomTooltipContent />} />
        <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
        {/* <Legend /> */}
        <Line
            type="monotone"
            dataKey="netFlow"
            stroke="#ff7300" // Orange color for net flow
            strokeWidth={2}
            activeDot={{ r: 5 }}
            dot={dailyNetFlowData.length < 60}
            name={t('dynamicDashboard.netFlow')} // Legend name
            isAnimationActive={true}
            animationDuration={300}
            />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default React.memo(NetFlowTrendWidget);
