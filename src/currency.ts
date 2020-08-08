export interface Currency {
  currencyCode?: string;
  currencySymbol: string;
  decimalDigits: number;
}

export interface CurrencyService {
  getCurrency(currencyCode: string): Currency;
}
