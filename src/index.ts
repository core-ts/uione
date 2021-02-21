import {Locale} from './locale';
import {ResourceService, StringMap} from './resource';
import {UIService} from './ui';

export interface Currency {
  currencyCode?: string;
  currencySymbol: string;
  decimalDigits: number;
}
export const enLocale = {
  'id': 'en-US',
  'countryCode': 'US',
  'dateFormat': 'M/d/yyyy',
  'firstDayOfWeek': 1,
  'decimalSeparator': '.',
  'groupSeparator': ',',
  'decimalDigits': 2,
  'currencyCode': 'USD',
  'currencySymbol': '$',
  'currencyPattern': 0
};
export interface Resources {
  [key: string]: StringMap;
}
export interface Privilege {
  id?: string;
  name: string;
  resource?: string;
  path?: string;
  icon?: string;
  sequence?: number;
  children?: Privilege[];
}
export interface UserAccount {
  id?: string;
  username?: string;
  contact?: string;
  email?: string;
  phone?: string;
  displayName?: string;
  passwordExpiredTime?: Date;
  token?: string;
  tokenExpiredTime?: Date;
  newUser?: boolean;
  userType?: string;
  roles?: string[];
  privileges?: Privilege[];
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
  gender?: string;
  imageURL?: string;
}
export function getBrowserLanguage(): string {
  const browserLanguage = navigator.languages && navigator.languages[0] // Chrome / Firefox
    || navigator.language   // All
    // @ts-ignore
    || navigator.userLanguage; // IE <= 10
  return browserLanguage;
}
export function toMap(map: Map<string, Privilege>, forms: Privilege[]): void {
  if (!map || !forms) {
    return;
  }
  for (const form of forms) {
    map.set(form.path, form);
  }
  for (const form of forms) {
    if (form.children && Array.isArray(form.children)) {
      toMap(map, form.children);
    }
  }
}
export function sortPrivileges(forms: Privilege[]): Privilege[] {
  forms.sort(sortBySequence);
  for (const form of forms) {
    if (form.children && Array.isArray(form.children)) {
      form.children = sortPrivileges(form.children);
    }
  }
  return forms;
}
interface ISequence {
  sequence?: number;
}
export function sortBySequence(a: ISequence, b: ISequence): number {
  if (!a.sequence) {
    a.sequence = 999;
  }
  if (!b.sequence) {
    b.sequence = 999;
  }
  return (a.sequence - b.sequence);
}

export interface LoadingService {
  showLoading(firstTime?: boolean): void;
  hideLoading(): void;
}

export class DefaultResourceService implements ResourceService {
  constructor() {
    this.resource = this.resource.bind(this);
    this.value = this.value.bind(this);
    this.format = this.format.bind(this);
  }
  resource(): StringMap {
    return storage.getResource();
  }
  value(key: string, param?: any): string {
    const r = this.resource();
    if (!r) {
      return '';
    }
    const str = r[key];
    if (!str || str.length === 0) {
      return str;
    }
    if (!param) {
      return str;
    }
    if (typeof param === 'string') {
      let paramValue = r[param];
      if (!paramValue) {
        paramValue = param;
      }
      return this.format(str, paramValue);
    }
    return this.format(str, param);
  }
  format(...args: any[]): string {
    let formatted = args[0];
    if (!formatted || formatted === '') {
      return '';
    }
    if (args.length > 1 && Array.isArray(args[1])) {
      const params = args[1];
      for (let i = 0; i < params.length; i++) {
        const regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, params[i]);
      }
    } else {
      for (let i = 1; i < args.length; i++) {
        const regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
        formatted = formatted.replace(regexp, args[i]);
      }
    }
    return formatted;
  }
}

// tslint:disable-next-line:class-name
export class storage {
  static redirectUrl = location.origin + '/index.html?redirect=oauth2';
  static authentication = 'authentication';
  static home = 'home';
  static moment: boolean;
  static autoSearch = true;

  private static _user: UserAccount;
  private static _forms: Privilege[];
  private static _privileges: Map<string, Privilege> = new Map<string, Privilege>();
  private static _resources: Resources;
  private static _loadingService: LoadingService;
  static message: (msg: string, option?: string) => void;
  static alert: (msg: string, header?: string, detail?: string, callback?: () => void) => void;
  static confirm: (msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  static locale: (id: string) => Locale;
  static currency: (currencyCode: string) => Currency;
  private static _resourceService: ResourceService = new DefaultResourceService();
  private static _uiService: UIService;
  static _sessionStorageAllowed = true;
  private static _initModel: any;
  private static _c: any;

  static getRedirectUrl(): string {
    return encodeURIComponent(storage.redirectUrl);
  }

  static setPrivileges(forms: Privilege[]): void {
    let f2 = forms;
    storage._privileges.clear();
    if (forms) {
      f2 = sortPrivileges(forms);
      toMap(storage._privileges, f2);
    }
    storage._forms = f2;
    if (storage._sessionStorageAllowed === true) {
      try {
        if (forms != null) {
          sessionStorage.setItem('forms', JSON.stringify(forms));
        } else {
          sessionStorage.removeItem('forms');
        }
      } catch (err) {
        storage._sessionStorageAllowed = false;
      }
    }
  }
  static getPrivileges(): Map<string, Privilege> {
    return storage._privileges;
  }
  static privileges(): Privilege[] {
    let forms = storage._forms;
    if (!forms) {
      if (storage._sessionStorageAllowed === true) {
        try {
          const rawForms = sessionStorage.getItem('forms');
          if (rawForms) {
            storage._forms = JSON.parse(rawForms);
            forms = storage._forms;
          }
        } catch (err) {
          storage._sessionStorageAllowed = false;
        }
      }
    }
    if (forms) {
      return forms;
    } else {
      return [];
    }
  }

  static setUser(usr: UserAccount): void {
    storage._user = usr;
    if (usr && usr.privileges && Array.isArray(usr.privileges)) {
      usr.privileges = sortPrivileges(usr.privileges);
    }
    if (storage._sessionStorageAllowed) {
      try {
        if (usr != null) {
          sessionStorage.setItem('authService', JSON.stringify(usr));
        } else {
          sessionStorage.removeItem('authService');
        }
      } catch (err) {
        storage._sessionStorageAllowed = false;
      }
    }
  }
  static user(profile?: string): UserAccount {
    let u = storage._user;
    if (!u) {
      if (storage._sessionStorageAllowed) {
        try {
          const authService = sessionStorage.getItem('authService');
          if (authService) {
            storage._user = JSON.parse(authService);
            u = storage._user;
          }
        } catch (err) {
          storage._sessionStorageAllowed = false;
        }
      }
    }
    return u;
  }
  static username(profile?: string): string {
    const u = storage.user(profile);
    return (!u ? '' : u.username);
  }
  static token(profile?: string): string {
    const u = storage.user(profile);
    return (!u ? null : u.token);
  }
  static getUserType(profile?: string): string {
    const u = storage.user(profile);
    return (!u ? null : u.userType);
  }
  static getDateFormat(profile?: string): string {
    const u = storage.user(profile);
    let lang: string;
    if (u) {
      if (u.dateFormat) {
        const z = u.dateFormat;
        return (storage.moment ? z.toUpperCase() : z);
      } else {
        lang = u.language;
      }
    }
    if (!lang || lang.length === 0) {
      lang = getBrowserLanguage();
    }
    let lc: Locale;
    if (storage.locale) {
      lc = storage.locale(lang);
    }
    const x = (lc ? lc.dateFormat : lc.dateFormat);
    return (storage.moment ? x.toUpperCase() : x);
  }
  static language(profile?: string): string {
    const u = storage.user(profile);
    if (u && u.language) {
      return u.language;
    } else {
      return getBrowserLanguage();
    }
  }

  static getLocale(profile?: string): Locale {
    if (storage.locale) {
      const lang = storage.language(profile);
      const lc = storage.locale(lang);
      if (lc) {
        return lc;
      }
    }
    return enLocale;
  }

  static loading(): LoadingService {
    return storage._loadingService;
  }

  static setLoadingService(loadingService: LoadingService): void {
    storage._loadingService = loadingService;
  }

  static ui(): UIService {
    return storage._uiService;
  }

  static setUIService(uiService: UIService): void {
    storage._uiService = uiService;
  }

  static getResources(): Resources {
    return storage._resources;
  }

  static setResources(resources: Resources): void {
    storage._resources = resources;
  }
  static setResourceService(r: ResourceService): void {
    storage._resourceService = r;
  }
  static resource(): ResourceService {
    return storage._resourceService;
  }

  static getResource(): StringMap {
    const resources = storage._resources;
    const r = resources[storage.language()];
    return (r ? r : resources['en']);
  }

  static getResourceByLocale(id: string): StringMap {
    return storage._resources[id];
  }

  static setResource(lc: string, overrideResources?: Resources, lastResources?: Resources): void {
    const overrideResourceCopy = Object.assign({}, overrideResources);
    const updateStaticResources = Object.keys(storage._resources).reduce(
      (accumulator, currentValue) => {
        accumulator[currentValue] = {
          ...storage._resources[currentValue],
          ...overrideResourceCopy[currentValue],
          ...lastResources[currentValue]
        };
        return accumulator;
      }, {});

    const originResources = Object.keys(lastResources).reduce(
      (accumulator, currentValue) => {
        if (accumulator[currentValue]) {
            accumulator[currentValue] = {
            ...overrideResources[currentValue],
            ...lastResources[currentValue]
          };
          return accumulator;
        }
        return { ...accumulator, [currentValue]: lastResources[currentValue]};
      }, overrideResourceCopy);

    const updateResources: Resources = {
      ...originResources,
      ...updateStaticResources
    };
    storage._resources[lc] = updateResources[lc];
  }

  static setInitModel(init: any): void {
    storage._initModel = init;
  }
  static getInitModel(): any {
    return storage._initModel;
  }
  static setConfig(c: any): void {
    storage._c = c;
  }
  static config(): any {
    return storage._c;
  }
}

export interface PermissionBuilder<T> {
  buildPermission(user: UserAccount, url: string): T;
}
export interface EditPermission {
  addable: boolean;
  editable: boolean;
  deletable?: boolean;
}
export interface SearchPermission {
  viewable?: boolean;
  addable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  approvable?: boolean;
}
export interface EditPermissionBuilder extends PermissionBuilder<EditPermission> {
}
export interface SearchPermissionBuilder extends PermissionBuilder<SearchPermission> {
}
export interface Editable  {
  addable: boolean;
  editable: boolean;
  deletable?: boolean;
}
export interface Searchable {
  viewable: boolean;
  addable: boolean;
  editable: boolean;
  approvable?: boolean;
  deletable?: boolean;
}
export function setSearchPermission(usr: UserAccount, url: string, permissionBuilder: SearchPermissionBuilder, com: Searchable) {
  if (permissionBuilder) {
    const permission = permissionBuilder.buildPermission(usr, url);
    com.viewable = permission.viewable;
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.approvable = permission.approvable;
    com.deletable = permission.deletable;
  }
}
export function setEditPermission(usr: UserAccount, url: string, permissionBuilder: SearchPermissionBuilder, com: Editable) {
  if (permissionBuilder) {
    const permission = permissionBuilder.buildPermission(usr, url);
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.deletable = permission.deletable;
  }
}

export function authenticated(): boolean {
  const usr = storage.user();
  return (usr ? true : false);
}

interface Headers {
  [key: string]: any;
}
export function options(): { headers?: Headers } {
  const t = storage.token();
    if (t) {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': 'Bearer ' + t
        }
      };
    } else {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      };
    }
}
export function initForm(form: HTMLFormElement, initMat?: (f: HTMLFormElement) => void): HTMLFormElement {
  if (form) {
    if (!form.getAttribute('date-format')) {
      const df = storage.getDateFormat();
      form.setAttribute('date-format', df);
    }
    setTimeout(() => {
      if (initMat) {
        initMat(form);
      }
      focusFirstElement(form);
    }, 100);
  }
  return form;
}
export function focusFirstElement(form: HTMLFormElement): void {
  let i = 0;
  const len = form.length;
  for (i = 0; i < len; i++) {
    const ctrl = form[i] as HTMLInputElement;
    if (!(ctrl.readOnly || ctrl.disabled)) {
      let nodeName = ctrl.nodeName;
      const type = ctrl.getAttribute('type');
      if (type) {
        const t = type.toUpperCase();
        if (t === 'BUTTON' || t === 'SUBMIT') {
          ctrl.focus();
        }
        if (nodeName === 'INPUT') {
          nodeName = t;
        }
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'CHECKBOX'
        && nodeName !== 'RADIO') {
        ctrl.focus();
        try {
          ctrl.setSelectionRange(0, ctrl.value.length);
        } catch (err) {
        }
        return;
      }
    }
  }
}
export function language(profile?: string): string {
  return storage.language(profile);
}
export function getDateFormat(profile?: string): string {
  return storage.getDateFormat(profile);
}
export function getPrivileges(): Map<string, Privilege> {
  return storage.getPrivileges();
}
export function privileges(): Privilege[] {
  return storage.privileges();
}
export function user(profile?: string) {
  return storage.user(profile);
}
export function username(profile?: string) {
  return storage.username(profile);
}
export function getUserType(profile?: string) {
  return storage.getUserType(profile);
}
export function token(profile?: string) {
  return storage.token(profile);
}
export function currency(currencyCode: string): Currency {
  return storage.currency(currencyCode);
}
export function locale(id: string): Locale {
  return storage.locale(id);
}
export function getLocale(profile?: string): Locale {
  return storage.getLocale(profile);
}
export function getInitModel(): any {
  return storage.getInitModel();
}
export function config(): any {
  return storage.config();
}
export function message(msg: string, option?: string): void {
  storage.message(msg, option);
}
export function alert(msg: string, header?: string, detail?: string, callback?: () => void): void {
  storage.alert(msg, header, detail, callback);
}
export function confirm(msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void): void {
  storage.confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback);
}
export function resource(): ResourceService {
  return storage.resource();
}
export function loading(): LoadingService {
  return storage.loading();
}
export function ui(): UIService {
  return storage.ui();
}
export function removeError(el: HTMLInputElement): void {
  const u = storage.ui();
  if (u) {
    u.removeError(el);
  }
}
export function getValue(el: HTMLInputElement, lc?: Locale, currencyCode?: string): string|number|boolean {
  const u = storage.ui();
  if (u) {
    return u.getValue(el, lc, currencyCode);
  } else {
    return el.value;
  }
}
export function registerEvents(form: HTMLFormElement): void {
  const u = storage.ui();
  if (u && form) {
    u.registerEvents(form);
  }
}

export function numberOnFocus(event: Event|any, lc?: Locale): void {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  storage.ui().numberOnFocus(event, lc);
}
export function numberOnBlur(event: Event|any, lc?: Locale): void {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  storage.ui().numberOnBlur(event, lc);
}
export function percentageOnFocus(event: Event|any, lc?: Locale): void {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  storage.ui().percentageOnFocus(event, lc);
}
export function currencyOnFocus(event: Event|any, lc?: Locale, currencyCode?: string): void {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  if (!currencyCode) {
    const ctrl = event.currentTarget as HTMLInputElement;
    currencyCode = ctrl.getAttribute('currency-code');
    if (!currencyCode) {
      currencyCode = ctrl.form.getAttribute('currency-code');
    }
  }
  storage.ui().currencyOnFocus(event, lc, currencyCode);
}
export function currencyOnBlur(event: Event|any, lc?: Locale, currencyCode?: string, includingCurrencySymbol?: boolean): void {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  if (!currencyCode) {
    const ctrl = event.currentTarget as HTMLInputElement;
    currencyCode = ctrl.getAttribute('currency-code');
    if (!currencyCode) {
      currencyCode = ctrl.form.getAttribute('currency-code');
    }
  }
  storage.ui().currencyOnBlur(event, lc, currencyCode, includingCurrencySymbol);
}
export function emailOnBlur(event: Event|any): void {
  event.preventDefault();
  storage.ui().emailOnBlur(event);
}
export function urlOnBlur(event: Event|any): void {
  event.preventDefault();
  storage.ui().urlOnBlur(event);
}
export function phoneOnBlur(event: Event|any): void {
  event.preventDefault();
  storage.ui().phoneOnBlur(event);
}
export function faxOnBlur(event: Event|any): void {
  event.preventDefault();
  storage.ui().phoneOnBlur(event);
}
export function requiredOnBlur(event: Event|any): void {
  event.preventDefault();
  storage.ui().requiredOnBlur(event);
}
export function checkPatternOnBlur(event: Event|any): void {
  event.preventDefault();
  storage.ui().patternOnBlur(event);
}
export function messageByHttpStatus(status: number, r: ResourceService): string {
  let msg = r.value('error_internal');
  if (status === 401) {
    msg = r.value('error_unauthorized');
  } else if (status === 403) {
    msg = r.value('error_forbidden');
  } else if (status === 404) {
    msg = r.value('error_not_found');
  } else if (status === 410) {
    msg = r.value('error_gone');
  } else if (status === 503) {
    msg = r.value('error_service_unavailable');
  }
  return msg;
}
export function error(err: any, r: ResourceService, ae: (msg: string, header?: string, detail?: string, callback?: () => void) => void): void {
  const title = r.value('error');
  let msg = r.value('error_internal');
  if (!err) {
    ae(msg, title);
    return;
  }
  const data = err && err.response ? err.response : err;
  if (data) {
    const status = data.status;
    if (status && !isNaN(status)) {
      msg = messageByHttpStatus(status, r);
    }
    ae(msg, title);
  } else {
    ae(msg, title);
  }
}
export function handleError(err: any): void {
  const r = storage.resource();
  return error(err, r, storage.alert);
}
export interface ViewParameter {
  resource: ResourceService;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export function inputView(): ViewParameter {
  const i: ViewParameter = {
    resource: storage.resource(),
    showError: storage.alert,
    getLocale: storage.getLocale,
    loading: storage.loading()
  };
  return i;
}
export interface SearchParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export function inputSearch(): SearchParameter {
  const i: SearchParameter = {
    resource: storage.resource(),
    showMessage: storage.message,
    showError: storage.alert,
    ui: storage.ui(),
    getLocale: storage.getLocale,
    loading: storage.loading()
  };
  return i;
}
export interface EditParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export function inputEdit(): EditParameter {
  const i: EditParameter = {
    resource: storage.resource(),
    showMessage: storage.message,
    showError: storage.alert,
    confirm: storage.confirm,
    ui: storage.ui(),
    getLocale: storage.getLocale,
    loading: storage.loading()
  };
  return i;
}
export interface DiffParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  loading?: LoadingService;
}
export function inputDiff(): DiffParameter {
  const i: DiffParameter = {
    resource: storage.resource(),
    showMessage: storage.message,
    showError: storage.alert,
    loading: storage.loading()
  };
  return i;
}

export * from './locale';
export * from './resource';
export * from './ui';
