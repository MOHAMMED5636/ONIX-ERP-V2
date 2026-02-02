import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPreferences as fetchPreferencesAPI } from '../services/authAPI';

const DEFAULT_PREFERENCES = {
  defaultCurrency: 'AED',
  lengthUnit: 'meter',
  areaUnit: 'sqm',
  volumeUnit: 'm3',
  heightUnit: 'meter',
  weightUnit: 'kg',
};

const DEFAULT_CONVERSION_FACTORS = {
  currency: { code: 'AED', fromBase: 1 },
  length: 1,
  area: 1,
  volume: 1,
  height: 1,
  weight: 1,
};

const DEFAULT_OPTIONS = {
  currencies: ['AED', 'USD', 'EUR', 'INR', 'SAR'],
  lengthUnits: ['meter', 'feet'],
  areaUnits: ['sqm', 'sqft'],
  volumeUnits: ['m3', 'ft3'],
  heightUnits: ['meter', 'feet'],
  weightUnits: ['kg', 'ton'],
};

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [conversionFactors, setConversionFactors] = useState(DEFAULT_CONVERSION_FACTORS);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPreferencesAPI();
      if (response.success && response.data) {
        setPreferences(response.data.preferences || DEFAULT_PREFERENCES);
        setConversionFactors(response.data.conversionFactors || DEFAULT_CONVERSION_FACTORS);
        setOptions(response.data.options || DEFAULT_OPTIONS);
      }
    } catch (err) {
      console.error('PreferencesContext: failed to load preferences', err);
      setError(err.message);
      setPreferences(DEFAULT_PREFERENCES);
      setConversionFactors(DEFAULT_CONVERSION_FACTORS);
      setOptions(DEFAULT_OPTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const refreshPreferences = useCallback(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  /** Convert base value to display value (e.g. meter -> feet) */
  const toDisplay = useCallback((value, type) => {
    if (value == null || value === '') return value;
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    switch (type) {
      case 'currency': return num * (conversionFactors.currency?.fromBase ?? 1);
      case 'length': return num * (conversionFactors.length ?? 1);
      case 'area': return num * (conversionFactors.area ?? 1);
      case 'volume': return num * (conversionFactors.volume ?? 1);
      case 'height': return num * (conversionFactors.height ?? 1);
      case 'weight': return num * (conversionFactors.weight ?? 1);
      default: return num;
    }
  }, [conversionFactors]);

  /** Convert display value to base for API (e.g. feet -> meter) */
  const toBase = useCallback((value, type) => {
    if (value == null || value === '') return value;
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    const fromBase = type === 'currency' ? (conversionFactors.currency?.fromBase ?? 1) : (conversionFactors[type] ?? 1);
    if (!fromBase) return num;
    return num / fromBase;
  }, [conversionFactors]);

  const value = {
    preferences,
    conversionFactors,
    options,
    loading,
    error,
    refreshPreferences,
    toDisplay,
    toBase,
    currencyCode: preferences.defaultCurrency || 'AED',
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
