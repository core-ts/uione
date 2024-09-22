import {Locale} from './locale';
import {Resource, StringMap} from './resource';
import {UIService} from './ui';
/*
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
*/
export interface Module {
  id?: string|number;
  path?: string;
  route?: string;
}
export interface ModuleLoader {
  load(): Promise<Module[]>;
}
export interface Currency {
  code: string;
  symbol: string;
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
  permissions?: number;
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
  let na = s.navigator;
  if (!na && !s.globalNavigator) {
    na = navigator;
  }
  if (na) {
    const browserLanguage = na.languages && na.languages[0] // Chrome / Firefox
      || na.language   // All
      // @ts-ignore
      || na.userLanguage; // IE <= 10
    return browserLanguage;
  }
  return 'en';
}
export function toMap(ps: Privilege[], map: Map<string,Privilege>): void {
  if (!map || !ps) {
    return;
  }
  for (const form of ps) {
    if (form.path) {
      map.set(form.path, form);
      // map[form.path] = form;
    }
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

export class ResourceService implements Resource {
  constructor() {
    this.resource = this.resource.bind(this);
    this.value = this.value.bind(this);
    this.format = this.format.bind(this);
  }
  resource(): StringMap {
    return s.getResource();
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
class s {
  // static redirectUrl = location.origin + '/index.html?redirect=oauth2';
  static authentication = 'authentication';
  static home = 'home';
  static moment: boolean;
  static autoSearch = true;
  static navigator: any;
  static globalNavigator?: boolean;
  // private static _status: EditStatusConfig;
  // private static _diff: DiffStatusConfig;
  private static _user: UserAccount|null|undefined;
  private static _lang: string;
  private static _forms: Privilege[]|null|undefined;
  private static _privileges: Map<string,Privilege>;// PrivilegeMap;
  private static _resources: Resources;
  private static _load: LoadingService;
  static message: (msg: string, option?: string) => void;
  static alert: (msg: string, header?: string, detail?: string, callback?: () => void) => void;
  static confirm: (msg: string, header?: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  static locale: (id: string) => Locale|undefined;
  static currency: (currencyCode: string) => Currency|undefined;
  private static _rs: Resource = new ResourceService();
  private static _ui: UIService;
  static _sessionStorageAllowed = true;
  private static _initModel: any;
  private static _c: any;
/*
  static getRedirectUrl(): string {
    return encodeURIComponent(s.redirectUrl);
  } */
  /*
  static setStatus(c: EditStatusConfig, profile?: string): void {
    s._status = c;
  }
  static status(profile?: string) {
    return s._status;
  }
  static setDiff(c: DiffStatusConfig, profile?: string): void {
    s._diff = c;
  }
  static diff(profile?: string): DiffStatusConfig {
    return s._diff;
  }
  */
  static setPrivileges(ps: Privilege[]|null|undefined): void {
    let f2 = ps;
    const x = new Map<string, Privilege>();
    if (ps) {
      f2 = sortPrivileges(ps);
      toMap(f2, x);
    }
    s._privileges = x;
    s._forms = f2;
    if (s._sessionStorageAllowed === true) {
      try {
        if (ps != null) {
          sessionStorage.setItem('forms', JSON.stringify(ps));
        } else {
          sessionStorage.removeItem('forms');
        }
      } catch (err) {
        s._sessionStorageAllowed = false;
      }
    }
  }
  static getPrivileges(): Map<string, Privilege> {// PrivilegeMap {
    return s._privileges;
  }
  static privileges(): Privilege[] {
    let forms = s._forms;
    if (!forms) {
      if (s._sessionStorageAllowed === true) {
        try {
          const rawForms = sessionStorage.getItem('forms');
          if (rawForms) {
            s._forms = JSON.parse(rawForms);
            forms = s._forms;
          }
        } catch (err) {
          s._sessionStorageAllowed = false;
        }
      }
    }
    if (forms) {
      return forms;
    } else {
      return [];
    }
  }
  static getStatusName(status?: string, m?: StringMap): string | undefined {
    return status;
  }
  static setLanguage(lang: string, profile?: string) {
    s._lang = lang;
  }
  static setUser(usr: UserAccount|null|undefined, profile?: string): void {
    s._user = usr;
    if (usr && usr.privileges && Array.isArray(usr.privileges)) {
      usr.privileges = sortPrivileges(usr.privileges);
    }
    if (s._sessionStorageAllowed) {
      try {
        if (usr != null) {
          sessionStorage.setItem('authService', JSON.stringify(usr));
        } else {
          sessionStorage.removeItem('authService');
        }
      } catch (err) {
        s._sessionStorageAllowed = false;
      }
    }
  }
  static user(profile?: string): UserAccount|null|undefined {
    let u = s._user;
    if (!u) {
      if (s._sessionStorageAllowed) {
        try {
          const authService = sessionStorage.getItem('authService');
          if (authService) {
            s._user = JSON.parse(authService);
            u = s._user;
          }
        } catch (err) {
          s._sessionStorageAllowed = false;
        }
      }
    }
    return u;
  }
  static getUserId(profile?: string): string|undefined {
    const u = s.user(profile);
    return (!u ? '' : u.id);
  }
  static username(profile?: string): string|undefined {
    const u = s.user(profile);
    return (!u ? '' : u.username);
  }
  static token(profile?: string): Promise<string|undefined> {
    const u = s.user(profile);
    return Promise.resolve(!u ? undefined : u.token);
  }
  static options(profile?: string): Promise<{ headers?: Headers }> {
    return s.token().then(t => {
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
    });
  }
  static getUserType(profile?: string): string|undefined {
    const u = s.user(profile);
    return (!u ? undefined : u.userType);
  }
  static getDateFormat(profile?: string): string {
    const u = s.user(profile);
    let lang: string|undefined;
    if (u) {
      if (u.dateFormat) {
        const z = u.dateFormat;
        return (s.moment ? z.toUpperCase() : z);
      } else {
        lang = u.language;
      }
    }
    if (!lang || lang.length === 0) {
      lang = getBrowserLanguage(profile);
    }
    let lc: Locale|undefined;
    if (s.locale) {
      lc = s.locale(lang);
    }
    const x = (lc ? lc.dateFormat : 'M/d/yyyy');
    return (s.moment ? x.toUpperCase() : x);
  }
  static getLanguage(profile?: string): string {
    const l = s._lang;
    if (l && l.length > 0) {
      return l;
    }
    const u = s.user(profile);
    if (u && u.language) {
      return u.language;
    } else {
      return getBrowserLanguage(profile);
    }
  }

  static getLocale(profile?: string): Locale {
    if (s.locale) {
      const lang = s.getLanguage(profile);
      const lc = s.locale(lang);
      if (lc) {
        return lc;
      }
    }
    return enLocale;
  }

  static loading(): LoadingService {
    return s._load;
  }

  static setLoadingService(loadingService: LoadingService): void {
    s._load = loadingService;
  }

  static ui(): UIService {
    return s._ui;
  }

  static setUIService(uiService: UIService): void {
    s._ui = uiService;
  }

  static getResources(profile?: string): Resources {
    return s._resources;
  }

  static setResources(resources: Resources, profile?: string): void {
    s._resources = resources;
  }
  static setResourceService(r: Resource, profile?: string): void {
    s._rs = r;
  }
  static resource(profile?: string): Resource {
    return s._rs;
  }

  static getResource(profile?: string): StringMap {
    const resources = s._resources;
    const r = resources[s.getLanguage(profile)];
    return (r ? r : resources['en']);
  }

  static getResourceByLocale(id: string, profile?: string): StringMap {
    return s._resources[id];
  }

  static setResource(lc: string, overrideResources?: Resources, lastResources?: Resources): void {
    const overrideResourceCopy = Object.assign({}, overrideResources);
    const updateStaticResources = Object.keys(s._resources).reduce(
      (accumulator, currentValue) => {
        (accumulator as any)[currentValue] = {
          ...s._resources[currentValue],
          ...overrideResourceCopy[currentValue],
          ...(lastResources as any)[currentValue]
        };
        return accumulator;
      }, {});

    const originResources = Object.keys(lastResources as any).reduce(
      (accumulator, currentValue) => {
        if (accumulator[currentValue]) {
            accumulator[currentValue] = {
            ...(overrideResources as any)[currentValue],
            ...(lastResources as any)[currentValue]
          };
          return accumulator;
        }
        return { ...accumulator, [currentValue]: (lastResources as any)[currentValue]};
      }, overrideResourceCopy);

    const updateResources: Resources = {
      ...originResources,
      ...updateStaticResources
    };
    s._resources[lc] = updateResources[lc];
  }

  static setInitModel(init: any, profile?: string): void {
    s._initModel = init;
  }
  static getInitModel(profile?: string): any {
    return s._initModel;
  }
  static setConfig(c: any, profile?: string): void {
    s._c = c;
  }
  static config(profile?: string): any {
    return s._c;
  }
}
export const storage = s;
export class Status {
  static Submitted = 'S';
  static Approved = 'A';
  static Published = 'P';
  static Active = 'A';
  static Deleted = 'D';
  static Deativated = 'D';
  static Inactive = 'I';
}
export class Gender {
  static Male = 'M';
  static Female = 'F';
}
export function getStatusName(status?: string, m?: StringMap): string | undefined {
  return s.getStatusName(status, m);
}
export function isSubmitted(s?: string): boolean {
  return s === Status.Submitted;
}
export function afterSubmitted(s?: string): boolean {
  return s === Status.Approved || s === Status.Published;
}
export function isApproved(s?: string): boolean {
  return s === Status.Approved;
}
export function isPublished(s?: string): boolean {
  return s === Status.Published;
}
export function canSubmit(s?: string): boolean {
  return s !== Status.Submitted && s !== Status.Approved && s !== Status.Published
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
export function setSearchPermission(c: SearchPermission, p: SearchPermission): void {
  if (c && p) {
    c.viewable = p.viewable;
    c.addable = p.addable;
    c.editable = p.editable;
    c.approvable = p.approvable;
    c.deletable = p.deletable;
  }
}
export function setEditPermission(c: EditPermission, p: EditPermission): void {
  if (c && p) {
    c.addable = p.addable;
    c.readOnly = p.readOnly;
    c.deletable = p.deletable;
  }
}

export function authenticated(): boolean {
  const usr = s.user();
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
export const read = 1;
export const write = 2;
export const approve = 4;
export class Permission {
  static read = 1;
  static write = 2;
  static delete = 4;
  static approve = 8;
}
export function getPath(s: string, i?: number): string {
  if (!i || i <= 0) {
    return s;
  }
  let count = 0;
  while (count < i) {
    const k = s.lastIndexOf('/');
    if (k < 0) {
      return s;
    }
    s = s.substring(0, k);
    count = count + 1;
  }
  return s;
}
export function hasPermission(permission?: number, i?: number, ps?: Privilege[]|Map<string, Privilege>): boolean {
  let ps2: Privilege[]|Map<string, Privilege> = s.getPrivileges();
  if (ps) {
    ps2 = ps;
  }
  const path = getPath(window.location.pathname, i);
  return hasPermissionWithPath(ps2, path, permission, true);
}
export function hasPermissionWithPath(ps: Privilege[]|Map<string, Privilege>, path: string, permission?: number, exact?: boolean): boolean {
  const p = getPrivilege(ps, path, exact);
  if (p) {
    if (!permission || permission <= 0 || !p.permissions || p.permissions <= 0) {
      return true;
    }
    return (p.permissions & permission) == permission;
  }
  return false;
}
export function getPrivilege(ps: Privilege[]|Map<string, Privilege>, path: string, exact?: boolean): Privilege|undefined {
  if (!ps || !path || path.length === 0) {
    return undefined;
  }
  if (Array.isArray(ps)) {
    if (exact) {
      for (const privilege of ps) {
        if (path === privilege.path) {
          return privilege;
        } else if (privilege.children && privilege.children.length > 0) {
          const ok = getPrivilege(privilege.children, path, exact);
          if (ok) {
            return ok;
          }
        }
      }
      return undefined;
    } else {
      for (const privilege of ps) {
        if (privilege.path && path.startsWith(privilege.path)) {
          return privilege;
        } else if (privilege.children && privilege.children.length > 0) {
          const ok = getPrivilege(privilege.children, path, exact);
          if (ok) {
            return ok;
          }
        }
      }
      return undefined;
    }
  } else {
    return ps.get(path) // ps[path];
  }
}
export function hasPrivilege(ps: Privilege[]|Map<string, Privilege>, path: string, exact?: boolean): boolean {
  const p = getPrivilege(ps, path, exact);
  return (p != undefined);
}

interface Headers {
  [key: string]: any;
}
export function options(): Promise<{ headers?: Headers }> {
  return s.options();
}
export function initForm(form: HTMLFormElement, initMat?: (f: HTMLFormElement) => void): HTMLFormElement {
  if (form) {
    if (!form.getAttribute('date-format')) {
      const df = s.getDateFormat();
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
/*
export function status(profile?: string): EditStatusConfig {
  return s.status(profile);
}
export function setStatus(c: EditStatusConfig, profile?: string): void {
  return s.setStatus(c, profile);
}
export function diff(profile?: string): DiffStatusConfig {
  return s.diff(profile);
}
export function setDiff(c: DiffStatusConfig, profile?: string): void {
  return s.setDiff(c, profile);
}
*/
export function setUser(usr: UserAccount|undefined|null, profile?: string): void {
  s.setUser(usr, profile);
}
export function setPrivileges(ps: Privilege[]|null|undefined): void {
  s.setPrivileges(ps);
}
export function setLanguage(lang: string, profile?: string): void {
  s.setLanguage(lang, profile);
}
export function getLanguage(profile?: string): string {
  return s.getLanguage(profile);
}
export function getDateFormat(profile?: string): string {
  return s.getDateFormat(profile);
}
export function usePrivileges(): Map<string, Privilege> {
  return s.getPrivileges();
}
export function getPrivileges(): Privilege[] {
  return s.privileges();
}
export function user(profile?: string): UserAccount|null|undefined {
  return s.user(profile);
}
export const getUser = user;
export const useUser = user;
export function resource(profile?: string): StringMap {
  return s.getResource(profile);
}
export const useResource = resource;
export function username(profile?: string) {
  return s.username(profile);
}
export const getUsername = username;
export const useUsername = username;
export function getUserType(profile?: string) {
  return s.getUserType(profile);
}
export const useUserType = getUserType;
export function token(profile?: string): Promise<string|undefined> {
  return s.token(profile);
}
export const getToken = token;
export const useToken = token;
export function getUserId(profile?: string) {
  return s.getUserId(profile);
}
export const useUserId = getUserId;
export function currency(currencyCode: string): Currency|undefined {
  return s.currency(currencyCode);
}
export const getCurrency = currency;
export const useCurrency = currency;
export function locale(id: string): Locale|undefined {
  return s.locale(id);
}
export function getLocale(profile?: string): Locale {
  return s.getLocale(profile);
}
export const useLocale = getLocale;
export function getParam(url: string, i?: number): string {
  const ps = url.split('/');
  if (!i || i < 0) {
    i = 0;
  }
  return ps[ps.length - 1 - i];
}
export function getInitModel(profile?: string): any {
  return s.getInitModel(profile);
}
export function config(profile?: string): any {
  return s.config(profile);
}
export const getConfig = config;
export const useConfig = config;
export function message(msg: string, option?: string): void {
  s.message(msg, option);
}
export const showMessage = message;
export function alert(msg: string, header?: string, detail?: string, callback?: () => void): void {
  s.alert(msg, header, detail, callback);
}
export const showAlert = alert;
export function confirm(msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void): void {
  s.confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback);
}
export const showConfirm = confirm;
export function getResource(profile?: string): Resource {
  return s.resource(profile);
}
export function loading(): LoadingService {
  return s.loading();
}
export function ui(): UIService {
  return s.ui();
}
export function removeError(el: HTMLInputElement): void {
  const u = s.ui();
  if (u) {
    u.removeError(el);
  }
}
export function getValue(el: HTMLInputElement, lc?: Locale, currencyCode?: string): string|number|boolean|null|undefined {
  const u = s.ui();
  if (u) {
    return u.getValue(el, lc, currencyCode);
  } else {
    return el.value;
  }
}
export function registerEvents(form: HTMLFormElement): void {
  const u = s.ui();
  if (u && form && u.registerEvents) {
    u.registerEvents(form);
  }
}

export function numberOnFocus(e: Event|any, lc?: Locale): void {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  const u = s.ui();
  if (u && u.numberOnFocus) {
    u.numberOnFocus(e, lc);
  }
}
export function numberOnBlur(e: Event|any, lc?: Locale): void {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  const u = s.ui();
  if (u && u.numberOnBlur) {
    u.numberOnBlur(e, lc);
  }
}
export function percentageOnFocus(e: Event|any, lc?: Locale): void {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  const u = s.ui();
  if (u && u.percentageOnFocus) {
    u.percentageOnFocus(e, lc);
  }
}
export function currencyOnFocus(e: Event|any, lc?: Locale, currencyCode?: string): void {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  if (!currencyCode) {
    const ctrl = e.currentTarget as HTMLInputElement;
    let x = ctrl.getAttribute('currency-code');
    if (!x && ctrl.form) {
      x = ctrl.form.getAttribute('currency-code');
    }
    currencyCode = (x == null ? undefined : x);
  }
  const u = s.ui();
  if (u && u.currencyOnFocus) {
    u.currencyOnFocus(e, lc, currencyCode);
  }
}
export function currencyOnBlur(e: Event|any, lc?: Locale, currencyCode?: string, includingCurrencySymbol?: boolean): void {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  if (!currencyCode) {
    const ctrl = e.currentTarget as HTMLInputElement;
    let x = ctrl.getAttribute('currency-code');
    if (!x && ctrl.form) {
      x = ctrl.form.getAttribute('currency-code');
    }
    currencyCode = (x == null ? undefined : x);
  }
  const u = s.ui();
  if (u && u.currencyOnBlur) {
    u.currencyOnBlur(e, lc, currencyCode, includingCurrencySymbol);
  }
}
export function emailOnBlur(e: Event|any): void {
  e.preventDefault();
  const u = s.ui();
  if (u && u.emailOnBlur) {
    u.emailOnBlur(e);
  }
}
export function urlOnBlur(e: Event|any): void {
  e.preventDefault();
  const u = s.ui();
  if (u && u.urlOnBlur) {
    u.urlOnBlur(e);
  }
}
export function phoneOnBlur(e: Event|any): void {
  e.preventDefault();
  const u = s.ui();
  if (u && u.phoneOnBlur) {
    u.phoneOnBlur(e);
  }
}
export function faxOnBlur(e: Event|any): void {
  e.preventDefault();
  const u = s.ui();
  if (u && u.faxOnBlur) {
    u.faxOnBlur(e);
  }
}
export function requiredOnBlur(e: Event|any): void {
  e.preventDefault();
  const u = s.ui();
  if (u && u.requiredOnBlur) {
    u.requiredOnBlur(e);
  }
}
export function checkPatternOnBlur(e: Event|any): void {
  e.preventDefault();
  const u = s.ui();
  if (u && u.patternOnBlur) {
    u.patternOnBlur(e);
  }
}
export function messageByHttpStatus(n: number, gv: StringMap): string {
  const k = 'status_' + n;
  let msg = gv[k];
  if (!msg || msg.length === 0) {
    msg = gv['error_internal'];
  }
  return msg;
}
export function error(err: any, gv: StringMap, ae: (msg: string, header?: string, detail?: string, callback?: () => void) => void): void {
  const title = gv['error'];
  let msg = gv['error_internal'];
  if (!err) {
    ae(msg, title);
    return;
  }
  const data = err && err.response ? err.response : err;
  if (data) {
    const st = data.status;
    if (st && !isNaN(st)) {
      msg = messageByHttpStatus(st, gv);
    }
    ae(msg, title);
  } else {
    ae(msg, title);
  }
}
export function handleError(err: any): void {
  const r = s.resource();
  return error(err, r.resource(), s.alert);
}
export interface ViewParameter {
  resource: Resource;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export function inputView(): ViewParameter {
  const i: ViewParameter = {
    resource: s.resource(),
    showError: s.alert,
    getLocale: s.getLocale,
    loading: s.loading()
  };
  return i;
}
export interface SearchParameter {
  resource: Resource;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
  auto?: boolean;
}
export function inputSearch(profile?: string): SearchParameter {
  const i: SearchParameter = {
    resource: s.resource(profile),
    showMessage: s.message,
    showError: s.alert,
    ui: s.ui(),
    getLocale: s.getLocale,
    loading: s.loading(),
    auto: s.autoSearch
  };
  return i;
}
/*
export interface EditStatusConfig {
  duplicate_key: number|string;
  not_found: number|string;
  success: number|string;
  version_error: number|string;
  error?: number|string;
  data_corrupt?: number|string;
}
*/
export interface EditParameter {
  resource: Resource;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  confirm: (m2: string, header?: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
  // status?: EditStatusConfig;
}
export function inputEdit(profile?: string): EditParameter {
  const i: EditParameter = {
    resource: s.resource(profile),
    showMessage: s.message,
    showError: s.alert,
    confirm: s.confirm,
    ui: s.ui(),
    getLocale: s.getLocale,
    loading: s.loading(),
    // status: s.status(profile),
  };
  return i;
}
/*
export interface DiffStatusConfig {
  not_found: number|string;
  success: number|string;
  version_error: number|string;
  error?: number|string;
}
*/
export interface DiffParameter {
  resource: Resource;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  loading?: LoadingService;
  // status?: DiffStatusConfig;
}
export function inputDiff(profile?: string): DiffParameter {
  const i: DiffParameter = {
    resource: s.resource(profile),
    showMessage: s.message,
    showError: s.alert,
    loading: s.loading(),
    // status: s.diff(profile)
  };
  return i;
}
const g = 0.017453292519943295;  // Math.PI / 180
const co = Math.cos;
export function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a = 0.5 - co((lat2 - lat1) * g) / 2 + co(lat1 * g) * co(lat2 * g) * (1 - co((lon2 - lon1) * g)) / 2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
export function hasClass(className: string, ele: HTMLElement | null | undefined): boolean {
  if (ele && ele.classList.contains(className)) {
    return true;
  }
  return false;
}
export function parentHasClass(className: string, ele: HTMLElement | null | undefined): boolean {
  if (ele) {
    const parent = ele.parentElement;
    if (parent && parent.classList.contains(className)) {
      return true;
    }
  }
  return false;
}
const d = 'data-value';
export function handleSelect(ele: HTMLSelectElement, attr?: string): void {
  const at = attr && attr.length > 0 ? attr : d;
  if (ele.value === '') {
    ele.removeAttribute(at);
  } else {
    ele.setAttribute(at, ele.value);
  }
}
/*
export interface SessionData {
  token: string;
  data: string;
  ref: string;
}
export interface SessionResponse {
  token: string;
  data: string;
}
*/
export interface HttpRequest {
  get<T>(url: string, options?: { headers?: Headers; }): Promise<T>;
  delete<T>(url: string, options?: { headers?: Headers; }): Promise<T>;
  post<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
  put<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
  patch<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T>;
}
/*
export class SessionService<T, R> {
  constructor(public httpRequest: HttpRequest, public url: string, public url2: string) {
    this.createSession = this.createSession.bind(this);
    this.deleteSession = this.deleteSession.bind(this);
  }
  createSession(data: T): Promise<R> {
    return this.httpRequest.post(this.url, data);
  }
  deleteSession(sessionId: string): Promise<number> {
    return this.httpRequest.delete(this.url2, {headers:{authorization: sessionId}});
  }
}
*/
export * from './locale';
export * from './resource';
export * from './ui';
