export interface Locale {
  id?: string;
  countryCode: string;
  dateFormat: string;
  firstDayOfWeek: number;
  decimalSeparator: string;
  groupSeparator: string;
  decimalDigits: number;
  currencyCode: string;
  currencySymbol: string;
  currencyPattern: number;
  currencySample?: string;
}

export interface LocaleService {
  getLocale(id: string): Locale;
  getLocaleOrDefault(id: string): Locale;
  getZeroCurrencyByLanguage(language: string): void;
  getZeroCurrency(locale: Locale): void;
  formatCurrency(value: any, currencyCode: string, locale: Locale, includingCurrencySymbol?: boolean): string;
  formatInteger(value: any, locale: Locale): string;
  formatNumber(value: number, scale: number, locale: Locale): string;
  format(v: number, format: string, locale: Locale): string;
}
