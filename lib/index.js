"use strict";
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enLocale = {
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
function getBrowserLanguage(profile) {
  var na = s.navigator;
  if (!na && !s.globalNavigator) {
    na = navigator;
  }
  if (na) {
    var browserLanguage = na.languages && na.languages[0]
      || na.language
      || na.userLanguage;
    return browserLanguage;
  }
  return 'en';
}
exports.getBrowserLanguage = getBrowserLanguage;
function toMap(ps, map) {
  if (!map || !ps) {
    return;
  }
  for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
    var form = ps_1[_i];
    if (form.path) {
      map.set(form.path, form);
    }
  }
  for (var _a = 0, ps_2 = ps; _a < ps_2.length; _a++) {
    var p = ps_2[_a];
    if (p.children && Array.isArray(p.children) && p.children.length > 0) {
      toMap(p.children, map);
    }
  }
}
exports.toMap = toMap;
function sortPrivileges(forms) {
  forms.sort(sortBySequence);
  for (var _i = 0, forms_1 = forms; _i < forms_1.length; _i++) {
    var form = forms_1[_i];
    if (form.children && Array.isArray(form.children)) {
      form.children = sortPrivileges(form.children);
    }
  }
  return forms;
}
exports.sortPrivileges = sortPrivileges;
function sortBySequence(a, b) {
  if (!a.sequence) {
    a.sequence = 999;
  }
  if (!b.sequence) {
    b.sequence = 999;
  }
  return (a.sequence - b.sequence);
}
exports.sortBySequence = sortBySequence;
var ResourceService = (function () {
  function ResourceService() {
    this.resource = this.resource.bind(this);
    this.value = this.value.bind(this);
    this.format = this.format.bind(this);
  }
  ResourceService.prototype.resource = function () {
    return s.getResource();
  };
  ResourceService.prototype.value = function (key, param) {
    var r = this.resource();
    if (!r) {
      return '';
    }
    var str = r[key];
    if (!str || str.length === 0) {
      return str;
    }
    if (!param) {
      return str;
    }
    if (typeof param === 'string') {
      var paramValue = r[param];
      if (!paramValue) {
        paramValue = param;
      }
      return this.format(str, paramValue);
    }
    return this.format(str, param);
  };
  ResourceService.prototype.format = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var formatted = args[0];
    if (!formatted || formatted === '') {
      return '';
    }
    if (args.length > 1 && Array.isArray(args[1])) {
      var params = args[1];
      for (var i = 0; i < params.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, params[i]);
      }
    }
    else {
      for (var i = 1; i < args.length; i++) {
        var regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
        formatted = formatted.replace(regexp, args[i]);
      }
    }
    return formatted;
  };
  return ResourceService;
}());
exports.ResourceService = ResourceService;
var s = (function () {
  function s() {
  }
  s.setStatus = function (c, profile) {
    s._status = c;
  };
  s.status = function (profile) {
    return s._status;
  };
  s.setDiff = function (c, profile) {
    s._diff = c;
  };
  s.diff = function (profile) {
    return s._diff;
  };
  s.setPrivileges = function (ps) {
    var f2 = ps;
    var x = new Map();
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
        }
        else {
          sessionStorage.removeItem('forms');
        }
      }
      catch (err) {
        s._sessionStorageAllowed = false;
      }
    }
  };
  s.getPrivileges = function () {
    return s._privileges;
  };
  s.privileges = function () {
    var forms = s._forms;
    if (!forms) {
      if (s._sessionStorageAllowed === true) {
        try {
          var rawForms = sessionStorage.getItem('forms');
          if (rawForms) {
            s._forms = JSON.parse(rawForms);
            forms = s._forms;
          }
        }
        catch (err) {
          s._sessionStorageAllowed = false;
        }
      }
    }
    if (forms) {
      return forms;
    }
    else {
      return [];
    }
  };
  s.setLanguage = function (lang, profile) {
    s._lang = lang;
  };
  s.setUser = function (usr, profile) {
    s._user = usr;
    if (usr && usr.privileges && Array.isArray(usr.privileges)) {
      usr.privileges = sortPrivileges(usr.privileges);
    }
    if (s._sessionStorageAllowed) {
      try {
        if (usr != null) {
          sessionStorage.setItem('authService', JSON.stringify(usr));
        }
        else {
          sessionStorage.removeItem('authService');
        }
      }
      catch (err) {
        s._sessionStorageAllowed = false;
      }
    }
  };
  s.user = function (profile) {
    var u = s._user;
    if (!u) {
      if (s._sessionStorageAllowed) {
        try {
          var authService = sessionStorage.getItem('authService');
          if (authService) {
            s._user = JSON.parse(authService);
            u = s._user;
          }
        }
        catch (err) {
          s._sessionStorageAllowed = false;
        }
      }
    }
    return u;
  };
  s.getUserId = function (profile) {
    var u = s.user(profile);
    return (!u ? '' : u.id);
  };
  s.username = function (profile) {
    var u = s.user(profile);
    return (!u ? '' : u.username);
  };
  s.token = function (profile) {
    var u = s.user(profile);
    return Promise.resolve(!u ? undefined : u.token);
  };
  s.options = function (profile) {
    return s.token().then(function (t) {
      if (t) {
        return {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + t
          }
        };
      }
      else {
        return {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          }
        };
      }
    });
  };
  s.getUserType = function (profile) {
    var u = s.user(profile);
    return (!u ? undefined : u.userType);
  };
  s.getDateFormat = function (profile) {
    var u = s.user(profile);
    var lang;
    if (u) {
      if (u.dateFormat) {
        var z = u.dateFormat;
        return (s.moment ? z.toUpperCase() : z);
      }
      else {
        lang = u.language;
      }
    }
    if (!lang || lang.length === 0) {
      lang = getBrowserLanguage(profile);
    }
    var lc;
    if (s.locale) {
      lc = s.locale(lang);
    }
    var x = (lc ? lc.dateFormat : 'M/d/yyyy');
    return (s.moment ? x.toUpperCase() : x);
  };
  s.getLanguage = function (profile) {
    var l = s._lang;
    if (l && l.length > 0) {
      return l;
    }
    var u = s.user(profile);
    if (u && u.language) {
      return u.language;
    }
    else {
      return getBrowserLanguage(profile);
    }
  };
  s.getLocale = function (profile) {
    if (s.locale) {
      var lang = s.getLanguage(profile);
      var lc = s.locale(lang);
      if (lc) {
        return lc;
      }
    }
    return exports.enLocale;
  };
  s.loading = function () {
    return s._load;
  };
  s.setLoadingService = function (loadingService) {
    s._load = loadingService;
  };
  s.ui = function () {
    return s._ui;
  };
  s.setUIService = function (uiService) {
    s._ui = uiService;
  };
  s.getResources = function (profile) {
    return s._resources;
  };
  s.setResources = function (resources, profile) {
    s._resources = resources;
  };
  s.setResourceService = function (r, profile) {
    s._rs = r;
  };
  s.resource = function (profile) {
    return s._rs;
  };
  s.getResource = function (profile) {
    var resources = s._resources;
    var r = resources[s.getLanguage(profile)];
    return (r ? r : resources['en']);
  };
  s.getResourceByLocale = function (id, profile) {
    return s._resources[id];
  };
  s.setResource = function (lc, overrideResources, lastResources) {
    var overrideResourceCopy = Object.assign({}, overrideResources);
    var updateStaticResources = Object.keys(s._resources).reduce(function (accumulator, currentValue) {
      accumulator[currentValue] = __assign(__assign(__assign({}, s._resources[currentValue]), overrideResourceCopy[currentValue]), lastResources[currentValue]);
      return accumulator;
    }, {});
    var originResources = Object.keys(lastResources).reduce(function (accumulator, currentValue) {
      var _a;
      if (accumulator[currentValue]) {
        accumulator[currentValue] = __assign(__assign({}, overrideResources[currentValue]), lastResources[currentValue]);
        return accumulator;
      }
      return __assign(__assign({}, accumulator), (_a = {}, _a[currentValue] = lastResources[currentValue], _a));
    }, overrideResourceCopy);
    var updateResources = __assign(__assign({}, originResources), updateStaticResources);
    s._resources[lc] = updateResources[lc];
  };
  s.setInitModel = function (init, profile) {
    s._initModel = init;
  };
  s.getInitModel = function (profile) {
    return s._initModel;
  };
  s.setConfig = function (c, profile) {
    s._c = c;
  };
  s.config = function (profile) {
    return s._c;
  };
  s.authentication = 'authentication';
  s.home = 'home';
  s.autoSearch = true;
  s._rs = new ResourceService();
  s._sessionStorageAllowed = true;
  return s;
}());
exports.storage = s;
var Status = (function () {
  function Status() {
  }
  Status.Submitted = 'S';
  Status.Approved = 'A';
  Status.Published = 'P';
  Status.Active = 'A';
  Status.Deleted = 'D';
  Status.Deativated = 'D';
  Status.Inactive = 'I';
  return Status;
}());
exports.Status = Status;
var Gender = (function () {
  function Gender() {
  }
  Gender.Male = 'M';
  Gender.Female = 'F';
  return Gender;
}());
exports.Gender = Gender;
function isSubmitted(s) {
  return s === Status.Submitted;
}
exports.isSubmitted = isSubmitted;
function isApproved(s) {
  return s === Status.Approved;
}
exports.isApproved = isApproved;
function isPublished(s) {
  return s === Status.Published;
}
exports.isPublished = isPublished;
function canSubmitted(s) {
  return s !== Status.Submitted && s !== Status.Approved && s !== Status.Published;
}
exports.canSubmitted = canSubmitted;
function setSearchPermission(c, p) {
  if (c && p) {
    c.viewable = p.viewable;
    c.addable = p.addable;
    c.editable = p.editable;
    c.approvable = p.approvable;
    c.deletable = p.deletable;
  }
}
exports.setSearchPermission = setSearchPermission;
function setEditPermission(c, p) {
  if (c && p) {
    c.addable = p.addable;
    c.readOnly = p.readOnly;
    c.deletable = p.deletable;
  }
}
exports.setEditPermission = setEditPermission;
function authenticated() {
  var usr = s.user();
  return (usr ? true : false);
}
exports.authenticated = authenticated;
function authorized(path, exact) {
  var usr = user();
  if (!usr) {
    return false;
  }
  if (!usr.privileges) {
    return false;
  }
  else {
    var link = trimPath(path);
    return hasPrivilege(usr.privileges, link, exact);
  }
}
exports.authorized = authorized;
function trimPath(path) {
  if (!path || path.length === 0) {
    return '';
  }
  var result = path.trim();
  if (result.endsWith('/')) {
    result = result.substr(0, result.length - 1);
  }
  return result;
}
exports.trimPath = trimPath;
exports.read = 1;
exports.write = 2;
exports.approve = 4;
var Permission = (function () {
  function Permission() {
  }
  Permission.read = 1;
  Permission.write = 2;
  Permission.delete = 4;
  Permission.approve = 8;
  return Permission;
}());
exports.Permission = Permission;
function getPath(s, i) {
  if (!i || i <= 0) {
    return s;
  }
  var count = 0;
  while (count < i) {
    var k = s.lastIndexOf('/');
    if (k < 0) {
      return s;
    }
    s = s.substring(0, k);
    count = count + 1;
  }
  return s;
}
exports.getPath = getPath;
function hasPermission(permission, i, ps) {
  var ps2 = s.getPrivileges();
  if (ps) {
    ps2 = ps;
  }
  var path = getPath(window.location.pathname, i);
  return hasPermissionWithPath(ps2, path, permission, true);
}
exports.hasPermission = hasPermission;
function hasPermissionWithPath(ps, path, permission, exact) {
  var p = getPrivilege(ps, path, exact);
  if (p) {
    if (!permission || permission <= 0 || !p.permissions || p.permissions <= 0) {
      return true;
    }
    return (p.permissions & permission) == permission;
  }
  return false;
}
exports.hasPermissionWithPath = hasPermissionWithPath;
function getPrivilege(ps, path, exact) {
  if (!ps || !path || path.length === 0) {
    return undefined;
  }
  if (Array.isArray(ps)) {
    if (exact) {
      for (var _i = 0, ps_3 = ps; _i < ps_3.length; _i++) {
        var privilege = ps_3[_i];
        if (path === privilege.path) {
          return privilege;
        }
        else if (privilege.children && privilege.children.length > 0) {
          var ok = getPrivilege(privilege.children, path, exact);
          if (ok) {
            return ok;
          }
        }
      }
      return undefined;
    }
    else {
      for (var _a = 0, ps_4 = ps; _a < ps_4.length; _a++) {
        var privilege = ps_4[_a];
        if (privilege.path && path.startsWith(privilege.path)) {
          return privilege;
        }
        else if (privilege.children && privilege.children.length > 0) {
          var ok = getPrivilege(privilege.children, path, exact);
          if (ok) {
            return ok;
          }
        }
      }
      return undefined;
    }
  }
  else {
    return ps.get(path);
  }
}
exports.getPrivilege = getPrivilege;
function hasPrivilege(ps, path, exact) {
  var p = getPrivilege(ps, path, exact);
  return (p != undefined);
}
exports.hasPrivilege = hasPrivilege;
function options() {
  return s.options();
}
exports.options = options;
function initForm(form, initMat) {
  if (form) {
    if (!form.getAttribute('date-format')) {
      var df = s.getDateFormat();
      form.setAttribute('date-format', df);
    }
    setTimeout(function () {
      if (initMat) {
        initMat(form);
      }
      focusFirstElement(form);
    }, 100);
  }
  return form;
}
exports.initForm = initForm;
function focusFirstElement(form) {
  var i = 0;
  var len = form.length;
  for (i = 0; i < len; i++) {
    var ctrl = form[i];
    if (!(ctrl.readOnly || ctrl.disabled)) {
      var nodeName = ctrl.nodeName;
      var type = ctrl.getAttribute('type');
      if (type) {
        var t = type.toUpperCase();
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
        }
        catch (err) {
        }
        return;
      }
    }
  }
}
exports.focusFirstElement = focusFirstElement;
function status(profile) {
  return s.status(profile);
}
exports.status = status;
function setStatus(c, profile) {
  return s.setStatus(c, profile);
}
exports.setStatus = setStatus;
function diff(profile) {
  return s.diff(profile);
}
exports.diff = diff;
function setDiff(c, profile) {
  return s.setDiff(c, profile);
}
exports.setDiff = setDiff;
function setUser(usr, profile) {
  s.setUser(usr, profile);
}
exports.setUser = setUser;
function setPrivileges(ps) {
  s.setPrivileges(ps);
}
exports.setPrivileges = setPrivileges;
function setLanguage(lang, profile) {
  s.setLanguage(lang, profile);
}
exports.setLanguage = setLanguage;
function getLanguage(profile) {
  return s.getLanguage(profile);
}
exports.getLanguage = getLanguage;
function getDateFormat(profile) {
  return s.getDateFormat(profile);
}
exports.getDateFormat = getDateFormat;
function usePrivileges() {
  return s.getPrivileges();
}
exports.usePrivileges = usePrivileges;
function getPrivileges() {
  return s.privileges();
}
exports.getPrivileges = getPrivileges;
function user(profile) {
  return s.user(profile);
}
exports.user = user;
exports.getUser = user;
exports.useUser = user;
function resource(profile) {
  return s.getResource(profile);
}
exports.resource = resource;
exports.useResource = resource;
function username(profile) {
  return s.username(profile);
}
exports.username = username;
exports.getUsername = username;
exports.useUsername = username;
function getUserType(profile) {
  return s.getUserType(profile);
}
exports.getUserType = getUserType;
exports.useUserType = getUserType;
function token(profile) {
  return s.token(profile);
}
exports.token = token;
exports.getToken = token;
exports.useToken = token;
function getUserId(profile) {
  return s.getUserId(profile);
}
exports.getUserId = getUserId;
exports.useUserId = getUserId;
function currency(currencyCode) {
  return s.currency(currencyCode);
}
exports.currency = currency;
exports.getCurrency = currency;
exports.useCurrency = currency;
function locale(id) {
  return s.locale(id);
}
exports.locale = locale;
function getLocale(profile) {
  return s.getLocale(profile);
}
exports.getLocale = getLocale;
exports.useLocale = getLocale;
function getParam(url, i) {
  var ps = url.split('/');
  if (!i || i < 0) {
    i = 0;
  }
  return ps[ps.length - 1 - i];
}
exports.getParam = getParam;
function getInitModel(profile) {
  return s.getInitModel(profile);
}
exports.getInitModel = getInitModel;
function config(profile) {
  return s.config(profile);
}
exports.config = config;
exports.getConfig = config;
exports.useConfig = config;
function message(msg, option) {
  s.message(msg, option);
}
exports.message = message;
exports.showMessage = message;
function alert(msg, header, detail, callback) {
  s.alert(msg, header, detail, callback);
}
exports.alert = alert;
exports.showAlert = alert;
function confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback) {
  s.confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback);
}
exports.confirm = confirm;
exports.showConfirm = confirm;
function getResource(profile) {
  return s.resource(profile);
}
exports.getResource = getResource;
function loading() {
  return s.loading();
}
exports.loading = loading;
function ui() {
  return s.ui();
}
exports.ui = ui;
function removeError(el) {
  var u = s.ui();
  if (u) {
    u.removeError(el);
  }
}
exports.removeError = removeError;
function getValue(el, lc, currencyCode) {
  var u = s.ui();
  if (u) {
    return u.getValue(el, lc, currencyCode);
  }
  else {
    return el.value;
  }
}
exports.getValue = getValue;
function registerEvents(form) {
  var u = s.ui();
  if (u && form && u.registerEvents) {
    u.registerEvents(form);
  }
}
exports.registerEvents = registerEvents;
function numberOnFocus(e, lc) {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  var u = s.ui();
  if (u && u.numberOnFocus) {
    u.numberOnFocus(e, lc);
  }
}
exports.numberOnFocus = numberOnFocus;
function numberOnBlur(e, lc) {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  var u = s.ui();
  if (u && u.numberOnBlur) {
    u.numberOnBlur(e, lc);
  }
}
exports.numberOnBlur = numberOnBlur;
function percentageOnFocus(e, lc) {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  var u = s.ui();
  if (u && u.percentageOnFocus) {
    u.percentageOnFocus(e, lc);
  }
}
exports.percentageOnFocus = percentageOnFocus;
function currencyOnFocus(e, lc, currencyCode) {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  if (!currencyCode) {
    var ctrl = e.currentTarget;
    var x = ctrl.getAttribute('currency-code');
    if (!x && ctrl.form) {
      x = ctrl.form.getAttribute('currency-code');
    }
    currencyCode = (x == null ? undefined : x);
  }
  var u = s.ui();
  if (u && u.currencyOnFocus) {
    u.currencyOnFocus(e, lc, currencyCode);
  }
}
exports.currencyOnFocus = currencyOnFocus;
function currencyOnBlur(e, lc, currencyCode, includingCurrencySymbol) {
  e.preventDefault();
  if (!lc) {
    lc = s.getLocale();
  }
  if (!currencyCode) {
    var ctrl = e.currentTarget;
    var x = ctrl.getAttribute('currency-code');
    if (!x && ctrl.form) {
      x = ctrl.form.getAttribute('currency-code');
    }
    currencyCode = (x == null ? undefined : x);
  }
  var u = s.ui();
  if (u && u.currencyOnBlur) {
    u.currencyOnBlur(e, lc, currencyCode, includingCurrencySymbol);
  }
}
exports.currencyOnBlur = currencyOnBlur;
function emailOnBlur(e) {
  e.preventDefault();
  var u = s.ui();
  if (u && u.emailOnBlur) {
    u.emailOnBlur(e);
  }
}
exports.emailOnBlur = emailOnBlur;
function urlOnBlur(e) {
  e.preventDefault();
  var u = s.ui();
  if (u && u.urlOnBlur) {
    u.urlOnBlur(e);
  }
}
exports.urlOnBlur = urlOnBlur;
function phoneOnBlur(e) {
  e.preventDefault();
  var u = s.ui();
  if (u && u.phoneOnBlur) {
    u.phoneOnBlur(e);
  }
}
exports.phoneOnBlur = phoneOnBlur;
function faxOnBlur(e) {
  e.preventDefault();
  var u = s.ui();
  if (u && u.faxOnBlur) {
    u.faxOnBlur(e);
  }
}
exports.faxOnBlur = faxOnBlur;
function requiredOnBlur(e) {
  e.preventDefault();
  var u = s.ui();
  if (u && u.requiredOnBlur) {
    u.requiredOnBlur(e);
  }
}
exports.requiredOnBlur = requiredOnBlur;
function checkPatternOnBlur(e) {
  e.preventDefault();
  var u = s.ui();
  if (u && u.patternOnBlur) {
    u.patternOnBlur(e);
  }
}
exports.checkPatternOnBlur = checkPatternOnBlur;
function messageByHttpStatus(n, gv) {
  var k = 'status_' + n;
  var msg = gv(k);
  if (!msg || msg.length === 0) {
    msg = gv('error_internal');
  }
  return msg;
}
exports.messageByHttpStatus = messageByHttpStatus;
function error(err, gv, ae) {
  var title = gv('error');
  var msg = gv('error_internal');
  if (!err) {
    ae(msg, title);
    return;
  }
  var data = err && err.response ? err.response : err;
  if (data) {
    var st = data.status;
    if (st && !isNaN(st)) {
      msg = messageByHttpStatus(st, gv);
    }
    ae(msg, title);
  }
  else {
    ae(msg, title);
  }
}
exports.error = error;
function handleError(err) {
  var r = s.resource();
  return error(err, r.value, s.alert);
}
exports.handleError = handleError;
function inputView() {
  var i = {
    resource: s.resource(),
    showError: s.alert,
    getLocale: s.getLocale,
    loading: s.loading()
  };
  return i;
}
exports.inputView = inputView;
function inputSearch(profile) {
  var i = {
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
exports.inputSearch = inputSearch;
function inputEdit(profile) {
  var i = {
    resource: s.resource(profile),
    showMessage: s.message,
    showError: s.alert,
    confirm: s.confirm,
    ui: s.ui(),
    getLocale: s.getLocale,
    loading: s.loading(),
    status: s.status(profile),
  };
  return i;
}
exports.inputEdit = inputEdit;
function inputDiff(profile) {
  var i = {
    resource: s.resource(profile),
    showMessage: s.message,
    showError: s.alert,
    loading: s.loading(),
    status: s.diff(profile)
  };
  return i;
}
exports.inputDiff = inputDiff;
var g = 0.017453292519943295;
var co = Math.cos;
function distance(lat1, lon1, lat2, lon2) {
  var a = 0.5 - co((lat2 - lat1) * g) / 2 + co(lat1 * g) * co(lat2 * g) * (1 - co((lon2 - lon1) * g)) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
}
exports.distance = distance;
function hasClass(className, ele) {
  if (ele && ele.classList.contains(className)) {
    return true;
  }
  return false;
}
exports.hasClass = hasClass;
function parentHasClass(className, ele) {
  if (ele) {
    var parent_1 = ele.parentElement;
    if (parent_1 && parent_1.classList.contains(className)) {
      return true;
    }
  }
  return false;
}
exports.parentHasClass = parentHasClass;
var d = 'data-value';
function handleSelect(ele, attr) {
  var at = attr && attr.length > 0 ? attr : d;
  if (ele.value === '') {
    ele.removeAttribute(at);
  }
  else {
    ele.setAttribute(at, ele.value);
  }
}
exports.handleSelect = handleSelect;
var SessionService = (function () {
  function SessionService(httpRequest, url, url2) {
    this.httpRequest = httpRequest;
    this.url = url;
    this.url2 = url2;
    this.createSession = this.createSession.bind(this);
    this.deleteSession = this.deleteSession.bind(this);
  }
  SessionService.prototype.createSession = function (data) {
    return this.httpRequest.post(this.url, data);
  };
  SessionService.prototype.deleteSession = function (sessionId) {
    return this.httpRequest.delete(this.url2, { headers: { authorization: sessionId } });
  };
  return SessionService;
}());
exports.SessionService = SessionService;
