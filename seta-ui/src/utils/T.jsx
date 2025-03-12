import React from 'react';
import { useTranslation } from 'react-i18next';

const T = ({ children, namespace, ...options }) => {
  const { t } = useTranslation(namespace || 'translation');
  // If children is a string, translate it; otherwise, render as-is
  return typeof children === 'string' ? t(children, options) : children;
};

export default T;
