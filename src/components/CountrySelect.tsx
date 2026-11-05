'use client';

import { COUNTRY_OPTIONS } from '@/lib/country-options';

interface CountrySelectProps {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CountrySelect({ id, value, disabled, onChange, placeholder = 'Seleccione un país' }: CountrySelectProps) {
  const isLegacyValue = value && !COUNTRY_OPTIONS.some(country => country.name === value);
  return (
    <select
      id={id}
      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#102B46] focus:ring-2 focus:ring-[#102B46]/20 outline-none transition-all disabled:bg-slate-50"
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {isLegacyValue && <option value={value}>{value} (registrado)</option>}
      {COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.name}>{country.name}</option>)}
    </select>
  );
}
