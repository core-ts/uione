import {Locale} from './locale';
import {ResourceService, StringMap} from './resource';
import {UIService} from './ui';

export enum Status {
  Active = 'A',
  Inactive = 'I',
  Deactivated = 'D',
  Deleted = 'D'
}
export enum Gender {
  Male = 'M',
  Female = 'F'
}
export interface Module {
  id?: string|number;
  path?: string;
  route?: string;
}
export interface ModuleLoader {
  load(): Promise<Module[]>;
}
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
export interface PrivilegeMap {
  [key: string]: Privilege;
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
export function getBrowserLanguage(profile?: string): string {
  const browserLanguage = navigator.languages && navigator.languages[0] // Chrome / Firefox
    || navigator.language   // All
    // @ts-ignore
    || navigator.userLanguage; // IE <= 10
  return browserLanguage;
}
export function toMap(ps: Privilege[], map: PrivilegeMap): void {
  if (!map || !ps) {
    return;
  }
  for (const form of ps) {
    map[form.path] = form;
  }
  for (const p of ps) {
    if (p.children && Array.isArray(p.children) && p.children.length > 0) {
      toMap(p.children, map);
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
interface SequenceModel {
  sequence?: number;
}
export function sortBySequence(a: SequenceModel, b: SequenceModel): number {
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

  private static _status: EditStatusConfig;
  private static _diff: DiffStatusConfig;
  private static _user: UserAccount;
  private static _lang: string;
  private static _forms: Privilege[];
  private static _privileges: PrivilegeMap;
  private static _resources: Resources;
  private static _load: LoadingService;
  static message: (msg: string, option?: string) => void;
  static alert: (msg: string, header?: string, detail?: string, callback?: () => void) => void;
  static confirm: (msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  static locale: (id: string) => Locale;
  static currency: (currencyCode: string) => Currency;
  private static _rs: ResourceService = new DefaultResourceService();
  private static _ui: UIService;
  static _sessionStorageAllowed = true;
  private static _initModel: any;
  private static _c: any;

  static getRedirectUrl(): string {
    return encodeURIComponent(storage.redirectUrl);
  }

  static setStatus(s: EditStatusConfig, profile?: string): void {
    storage._status = s;
  }
  static status(profile?: string) {
    return storage._status;
  }
  static setDiff(s: DiffStatusConfig, profile?: string): void {
    storage._diff = s;
  }
  static diff(profile?: string): DiffStatusConfig {
    return storage._diff;
  }
  static setPrivileges(ps: Privilege[]): void {
    let f2 = ps;
    const x: any = {};
    if (ps) {
      f2 = sortPrivileges(ps);
      toMap(f2, x);
    }
    storage._privileges = x;
    storage._forms = f2;
    if (storage._sessionStorageAllowed === true) {
      try {
        if (ps != null) {
          sessionStorage.setItem('forms', JSON.stringify(ps));
        } else {
          sessionStorage.removeItem('forms');
        }
      } catch (err) {
        storage._sessionStorageAllowed = false;
      }
    }
  }
  static getPrivileges(): PrivilegeMap {
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

  static setLanguage(lang: string, profile?: string) {
    storage._lang = lang;
  }
  static setUser(usr: UserAccount, profile?: string): void {
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
  static getUserId(profile?: string): string {
    const u = storage.user(profile);
    return (!u ? '' : u.id);
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
      lang = getBrowserLanguage(profile);
    }
    let lc: Locale;
    if (storage.locale) {
      lc = storage.locale(lang);
    }
    const x = (lc ? lc.dateFormat : lc.dateFormat);
    return (storage.moment ? x.toUpperCase() : x);
  }
  static language(profile?: string): string {
    const l = storage._lang;
    if (l && l.length > 0) {
      return l;
    }
    const u = storage.user(profile);
    if (u && u.language) {
      return u.language;
    } else {
      return getBrowserLanguage(profile);
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
    return storage._load;
  }

  static setLoadingService(loadingService: LoadingService): void {
    storage._load = loadingService;
  }

  static ui(): UIService {
    return storage._ui;
  }

  static setUIService(uiService: UIService): void {
    storage._ui = uiService;
  }

  static getResources(profile?: string): Resources {
    return storage._resources;
  }

  static setResources(resources: Resources, profile?: string): void {
    storage._resources = resources;
  }
  static setResourceService(r: ResourceService, profile?: string): void {
    storage._rs = r;
  }
  static resource(profile?: string): ResourceService {
    return storage._rs;
  }

  static getResource(profile?: string): StringMap {
    const resources = storage._resources;
    const r = resources[storage.language(profile)];
    return (r ? r : resources['en']);
  }

  static getResourceByLocale(id: string, profile?: string): StringMap {
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

  static setInitModel(init: any, profile?: string): void {
    storage._initModel = init;
  }
  static getInitModel(profile?: string): any {
    return storage._initModel;
  }
  static setConfig(c: any, profile?: string): void {
    storage._c = c;
  }
  static config(profile?: string): any {
    return storage._c;
  }
}

export interface PermissionBuilder<T> {
  buildPermission(user: UserAccount, url: string): T;
}
export interface EditPermission {
  addable?: boolean;
  readOnly?: boolean;
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
export function setSearchPermission(com: SearchPermission, permission: SearchPermission): void {
  if (com && permission) {
    com.viewable = permission.viewable;
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.approvable = permission.approvable;
    com.deletable = permission.deletable;
  }
}
export function setEditPermission(com: EditPermission, permission: EditPermission): void {
  if (com && permission) {
    com.addable = permission.addable;
    com.readOnly = permission.readOnly;
    com.deletable = permission.deletable;
  }
}

export function authenticated(): boolean {
  const usr = storage.user();
  return (usr ? true : false);
}
export function authorized(path: string, exact?: boolean): boolean {
  const usr = user();
  if (!usr) {
    return false;
  }
  if (!usr.privileges) {
    return false;
  } else {
    const link = trimPath(path);
    return hasPrivilege(usr.privileges, link, exact);
  }
}
export function trimPath(path: string): string {
  if (!path || path.length === 0) {
    return '';
  }
  let result = path.trim();
  if (result.endsWith('/')) {
    result = result.substr(0, result.length - 1);
  }
  return result;
}
export function hasPrivilege(ps: Privilege[]|PrivilegeMap, path: string, exact?: boolean): boolean {
  if (!ps || !path || path.length === 0) {
    return false;
  }
  if (Array.isArray(ps)) {
    if (exact) {
      for (const privilege of ps) {
        if (path === privilege.path) {
          return true;
        } else if (privilege.children && privilege.children.length > 0) {
          const ok = hasPrivilege(privilege.children, path, exact);
          if (ok) {
            return true;
          }
        }
      }
    } else {
      for (const privilege of ps) {
        if (path.startsWith(privilege.path)) {
          return true;
        } else if (privilege.children && privilege.children.length > 0) {
          const ok = hasPrivilege(privilege.children, path, exact);
          if (ok) {
            return true;
          }
        }
      }
    }
  } else {
    const x = ps[path];
    return (x ? true : false);
  }
  return false;
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
export function status(profile?: string): EditStatusConfig {
  return storage.status(profile);
}
export function setStatus(s: EditStatusConfig, profile?: string): void {
  return storage.setStatus(s, profile);
}
export function diff(profile?: string): DiffStatusConfig {
  return storage.diff(profile);
}
export function setDiff(s: DiffStatusConfig, profile?: string): void {
  return storage.setDiff(s, profile);
}
export function setUser(usr: UserAccount, profile?: string): void {
  storage.setUser(usr, profile);
}
export function setLanguage(lang: string, profile?: string): void {
  storage.setLanguage(lang, profile);
}
export function language(profile?: string): string {
  return storage.language(profile);
}
export function getDateFormat(profile?: string): string {
  return storage.getDateFormat(profile);
}
export function getPrivileges(): PrivilegeMap {
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
export function getUserId(profile?: string) {
  return storage.getUserId(profile);
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
export function getInitModel(profile?: string): any {
  return storage.getInitModel(profile);
}
export function config(profile?: string): any {
  return storage.config(profile);
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
export function resource(profile?: string): ResourceService {
  return storage.resource(profile);
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
export function messageByHttpStatus(s: number, gv: (k: string) => string): string {
  const k = 'status_' + s;
  let msg = gv(k);
  if (!msg || msg.length === 0) {
    msg = gv('error_internal');
  }
  return msg;
}
export function error(err: any, gv: (k: string) => string, ae: (msg: string, header?: string, detail?: string, callback?: () => void) => void): void {
  const title = gv('error');
  let msg = gv('error_internal');
  if (!err) {
    ae(msg, title);
    return;
  }
  const data = err && err.response ? err.response : err;
  if (data) {
    const s = data.status;
    if (s && !isNaN(s)) {
      msg = messageByHttpStatus(s, gv);
    }
    ae(msg, title);
  } else {
    ae(msg, title);
  }
}
export function handleError(err: any): void {
  const r = storage.resource();
  return error(err, r.value, storage.alert);
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
  auto?: boolean;
}
export function inputSearch(profile?: string): SearchParameter {
  const i: SearchParameter = {
    resource: storage.resource(profile),
    showMessage: storage.message,
    showError: storage.alert,
    ui: storage.ui(),
    getLocale: storage.getLocale,
    loading: storage.loading(),
    auto: storage.autoSearch
  };
  return i;
}
export interface EditStatusConfig {
  duplicate_key: number|string;
  not_found: number|string;
  success: number|string;
  version_error: number|string;
  error?: number|string;
  data_corrupt?: number|string;
}
export interface EditParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
  status?: EditStatusConfig;
}
export function inputEdit(profile?: string): EditParameter {
  const i: EditParameter = {
    resource: storage.resource(profile),
    showMessage: storage.message,
    showError: storage.alert,
    confirm: storage.confirm,
    ui: storage.ui(),
    getLocale: storage.getLocale,
    loading: storage.loading(),
    status: storage.status(profile),
  };
  return i;
}
export interface DiffStatusConfig {
  not_found: number|string;
  success: number|string;
  version_error: number|string;
  error?: number|string;
}
export interface DiffParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  loading?: LoadingService;
  status?: DiffStatusConfig;
}
export function inputDiff(profile?: string): DiffParameter {
  const i: DiffParameter = {
    resource: storage.resource(profile),
    showMessage: storage.message,
    showError: storage.alert,
    loading: storage.loading(),
    status: storage.diff(profile)
  };
  return i;
}

export * from './locale';
export * from './resource';
export * from './ui';
