import React from 'react';
import { useAppTranslation } from './useTranslation';

export const withTranslation = (Component, namespace) => {
  return function WrappedComponent(props) {
    const translation = useAppTranslation(namespace);
    return <Component {...props} t={translation.t} />;
  };
};
