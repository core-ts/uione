import {Locale} from './locale';

export interface ErrorMessage {
  field: string;
  code: string;
  message?: string;
}

export interface UIService {
  validateForm(form?: HTMLFormElement | null, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: HTMLFormElement): void;
  removeError(el?: HTMLInputElement | null): void;
  showFormError(form?: HTMLFormElement | null, errors?: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
  buildErrorMessage(errors: ErrorMessage[]): string;

  registerEvents?(form: HTMLFormElement): void;
}
