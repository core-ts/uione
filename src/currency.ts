export interface Currency {
  currencyCode?: string;
  currencySymbol: string;
  decimalDigits: number;
}

export interface CurrencyService {
  currency(currencyCode: string): Currency;
}
