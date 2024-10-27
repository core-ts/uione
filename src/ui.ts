import {Locale} from './locale';

export interface ErrorMessage {
  field: string;
  code: string;
  message?: string;
}

export interface UIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string|number|boolean|null|undefined;
  decodeFromForm(form: HTMLFormElement, locale?: Locale, currencyCode?: string|null): any;

  validateForm(form?: HTMLFormElement, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: HTMLFormElement): void;
  removeError(el: HTMLInputElement): void;
  showFormError(form?: HTMLFormElement, errors?: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
  buildErrorMessage(errors: ErrorMessage[]): string;

  registerEvents?(form: HTMLFormElement): void;
  numberOnFocus?(event: Event|any, locale: Locale): void;
  numberOnBlur?(event: Event|any, locale: Locale): void;
  percentageOnFocus?(event: Event|any, locale: Locale): void;
  currencyOnFocus?(event: Event|any, locale: Locale, currencyCode?: string): void;
  currencyOnBlur?(event: Event|any, locale: Locale, currencyCode?: string, includingCurrencySymbol?: boolean): void;
  emailOnBlur?(event: Event|any): void;
  urlOnBlur?(event: Event|any): void;
  phoneOnBlur?(event: Event|any): void;
  faxOnBlur?(event: Event|any): void;
  requiredOnBlur?(event: Event|any): void;
  patternOnBlur?(event: Event|any): void;
}
