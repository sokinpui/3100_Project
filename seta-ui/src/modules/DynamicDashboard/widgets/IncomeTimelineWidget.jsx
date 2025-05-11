// src/modules/DynamicDashboard/widgets/IncomeTimelineWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format as formatDateFns, parseISO, isValid } from 'date-fns'; // Added isValid
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat'; // Import date format hook

// Define colors for income sources (can be same or different from expense colors)
const INCOME_COLORS = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#03A9F4', '#00BCD4', '#009688', '#673AB7'];


// Custom Tooltip for Income
const CustomIncomeTooltip = ({ active, payload, label }) => {
    const { t } = useTranslation(); // Use translation hook inside tooltip
    if (active && payload && payload.length) {
        return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>{label}</Typography>
            {payload.map((entry, index) => (
            // Ensure entry.name is the source name used as dataKey
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                {`${entry.name} : $${entry.value.toFixed(2)}`}
            </Typography>
            ))}
        </Box>
        );
    }
    return null;
};


// --- Rename Component and Update Props ---
export function IncomeTimelineWidget({ income, isLoading }) { // Changed prop from expenses to income
    const { t } = useTranslation();
    const { format: formatLocaleDate } = useLocalizedDateFormat(); // Use the hook

    // --- Adapt Data Aggregation Logic for Income ---
    const { timelineData, sourceNames } = useMemo(() => {
        if (!income || income.length === 0) return { timelineData: [], sourceNames: [] }; // Use income prop

        const monthlySourceMap = income.reduce((acc, item) => { // Use income item
        try {
            const date = parseISO(item.date); // Use item.date
            if (!isValid(date)) return acc; // Validate date

            const monthYear = formatDateFns(date, 'yyyy-MM');
            const amount = parseFloat(item.amount) || 0; // Use item.amount
            const sourceName = item.source || t('dynamicDashboard.unknownSource'); // Use item.source

            if (!acc[monthYear]) {
            acc[monthYear] = {};
            }
            acc[monthYear][sourceName] = (acc[monthYear][sourceName] || 0) + amount;
        } catch (e) {
            console.error("Error processing income for timeline:", item, e);
        }
        return acc;
        }, {});

        const allSources = new Set();
        Object.values(monthlySourceMap).forEach(monthData => {
        Object.keys(monthData).forEach(src => allSources.add(src));
        });

        // No complex translation needed for sources typically, use raw names
        const sourceNamesArray = Array.from(allSources);

        const data = Object.entries(monthlySourceMap)
        .map(([monthYear, sources]) => {
            const monthEntry = {
                // Use localized date format for the X-axis label
                name: formatLocaleDate(parseISO(`${monthYear}-01`), 'MMM yyyy'),
                monthYear: monthYear,
            };
            sourceNamesArray.forEach(srcName => {
                monthEntry[srcName] = sources[srcName] || 0; // Use raw source name as key
            });
            return monthEntry;
        })
        .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

        return { timelineData: data, sourceNames: sourceNamesArray }; // Return sourceNames
    }, [income, t, formatLocaleDate]); // Update dependencies

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }

    // --- Update Empty State Message ---
    if (timelineData.length < 2) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}>
                    {/* Add a new translation key */}
                    <Typography color="text.secondary"><T>dynamicDashboard.noIncomeTimelineData</T></Typography>
                </Box>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timelineData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}> {/* Keep bottom margin for legend */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {/* Use localized date format for XAxis */}
            <XAxis dataKey="name" style={{ fontSize: '10px' }} tickMargin={5} />
            <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
            {/* Use the specific income tooltip */}
            <Tooltip content={<CustomIncomeTooltip />} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
            {/* Iterate over sourceNames */}
            {sourceNames.map((srcName, index) => (
            <Area
                key={srcName}
                type="monotone"
                dataKey={srcName} // Use raw source name as dataKey
                stackId="1" // Keep stackId
                stroke={INCOME_COLORS[index % INCOME_COLORS.length]}
                fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                fillOpacity={0.6}
                name={srcName} // Legend/Tooltip name is raw source name
            />
            ))}
        </AreaChart>
        </ResponsiveContainer>
    );
}

export default React.memo(IncomeTimelineWidget); // Export renamed component
