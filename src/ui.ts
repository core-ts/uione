import {Locale} from './locale';

export interface ErrorMessage {
  field: string;
  code: string;
  message?: string;
}

export interface UIService {
  getValue(ctrl: HTMLInputElement, locale?: Locale, currencyCode?: string): string|number|boolean;
  decodeFromForm(form: HTMLFormElement, locale: Locale, currencyCode: string): any;

  validateForm(form: HTMLFormElement, locale: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: HTMLFormElement): void;
  removeErrorMessage(ctrl: HTMLInputElement): void;
  showFormError(form: HTMLFormElement, errors: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
  buildErrorMessage(errors: ErrorMessage[]): string;

  initMaterial(form: HTMLFormElement): void;
  numberOnFocus(event: Event, locale: Locale): void;
  numberOnBlur(event: Event, locale: Locale): void;
  percentageOnFocus(event: Event, locale: Locale): void;
  currencyOnFocus(event: Event, locale: Locale, currencyCode: string): void;
  currencyOnBlur(event: Event, locale: Locale, currencyCode: string, includingCurrencySymbol: boolean): void;
  emailOnBlur(event: Event): void;
  urlOnBlur(event: Event): void;
  phoneOnBlur(event: Event): void;
  faxOnBlur(event: Event): void;
  requiredOnBlur(event: Event): void;
  patternOnBlur(event: Event): void;
}
