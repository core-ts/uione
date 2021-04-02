"use strict";
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
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
function getBrowserLanguage() {
  var browserLanguage = navigator.languages && navigator.languages[0]
    || navigator.language
    || navigator.userLanguage;
  return browserLanguage;
}
exports.getBrowserLanguage = getBrowserLanguage;
function toMap(map, forms) {
  if (!map || !forms) {
    return;
  }
  for (var _i = 0, forms_1 = forms; _i < forms_1.length; _i++) {
    var form = forms_1[_i];
    map.set(form.path, form);
  }
  for (var _a = 0, forms_2 = forms; _a < forms_2.length; _a++) {
    var form = forms_2[_a];
    if (form.children && Array.isArray(form.children)) {
      toMap(map, form.children);
    }
  }
}
exports.toMap = toMap;
function sortPrivileges(forms) {
  forms.sort(sortBySequence);
  for (var _i = 0, forms_3 = forms; _i < forms_3.length; _i++) {
    var form = forms_3[_i];
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
var DefaultResourceService = (function () {
  function DefaultResourceService() {
    this.resource = this.resource.bind(this);
    this.value = this.value.bind(this);
    this.format = this.format.bind(this);
  }
  DefaultResourceService.prototype.resource = function () {
    return storage.getResource();
  };
  DefaultResourceService.prototype.value = function (key, param) {
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
  DefaultResourceService.prototype.format = function () {
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
  return DefaultResourceService;
}());
exports.DefaultResourceService = DefaultResourceService;
var storage = (function () {
  function storage() {
  }
  storage.getRedirectUrl = function () {
    return encodeURIComponent(storage.redirectUrl);
  };
  storage.setPrivileges = function (forms) {
    var f2 = forms;
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
        }
        else {
          sessionStorage.removeItem('forms');
        }
      }
      catch (err) {
        storage._sessionStorageAllowed = false;
      }
    }
  };
  storage.getPrivileges = function () {
    return storage._privileges;
  };
  storage.privileges = function () {
    var forms = storage._forms;
    if (!forms) {
      if (storage._sessionStorageAllowed === true) {
        try {
          var rawForms = sessionStorage.getItem('forms');
          if (rawForms) {
            storage._forms = JSON.parse(rawForms);
            forms = storage._forms;
          }
        }
        catch (err) {
          storage._sessionStorageAllowed = false;
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
  storage.setUser = function (usr) {
    storage._user = usr;
    if (usr && usr.privileges && Array.isArray(usr.privileges)) {
      usr.privileges = sortPrivileges(usr.privileges);
    }
    if (storage._sessionStorageAllowed) {
      try {
        if (usr != null) {
          sessionStorage.setItem('authService', JSON.stringify(usr));
        }
        else {
          sessionStorage.removeItem('authService');
        }
      }
      catch (err) {
        storage._sessionStorageAllowed = false;
      }
    }
  };
  storage.user = function (profile) {
    var u = storage._user;
    if (!u) {
      if (storage._sessionStorageAllowed) {
        try {
          var authService = sessionStorage.getItem('authService');
          if (authService) {
            storage._user = JSON.parse(authService);
            u = storage._user;
          }
        }
        catch (err) {
          storage._sessionStorageAllowed = false;
        }
      }
    }
    return u;
  };
  storage.getUserId = function (profile) {
    var u = storage.user(profile);
    return (!u ? '' : u.id);
  };
  storage.username = function (profile) {
    var u = storage.user(profile);
    return (!u ? '' : u.username);
  };
  storage.token = function (profile) {
    var u = storage.user(profile);
    return (!u ? null : u.token);
  };
  storage.getUserType = function (profile) {
    var u = storage.user(profile);
    return (!u ? null : u.userType);
  };
  storage.getDateFormat = function (profile) {
    var u = storage.user(profile);
    var lang;
    if (u) {
      if (u.dateFormat) {
        var z = u.dateFormat;
        return (storage.moment ? z.toUpperCase() : z);
      }
      else {
        lang = u.language;
      }
    }
    if (!lang || lang.length === 0) {
      lang = getBrowserLanguage();
    }
    var lc;
    if (storage.locale) {
      lc = storage.locale(lang);
    }
    var x = (lc ? lc.dateFormat : lc.dateFormat);
    return (storage.moment ? x.toUpperCase() : x);
  };
  storage.language = function (profile) {
    var u = storage.user(profile);
    if (u && u.language) {
      return u.language;
    }
    else {
      return getBrowserLanguage();
    }
  };
  storage.getLocale = function (profile) {
    if (storage.locale) {
      var lang = storage.language(profile);
      var lc = storage.locale(lang);
      if (lc) {
        return lc;
      }
    }
    return exports.enLocale;
  };
  storage.loading = function () {
    return storage._loadingService;
  };
  storage.setLoadingService = function (loadingService) {
    storage._loadingService = loadingService;
  };
  storage.ui = function () {
    return storage._uiService;
  };
  storage.setUIService = function (uiService) {
    storage._uiService = uiService;
  };
  storage.getResources = function () {
    return storage._resources;
  };
  storage.setResources = function (resources) {
    storage._resources = resources;
  };
  storage.setResourceService = function (r) {
    storage._resourceService = r;
  };
  storage.resource = function () {
    return storage._resourceService;
  };
  storage.getResource = function () {
    var resources = storage._resources;
    var r = resources[storage.language()];
    return (r ? r : resources['en']);
  };
  storage.getResourceByLocale = function (id) {
    return storage._resources[id];
  };
  storage.setResource = function (lc, overrideResources, lastResources) {
    var overrideResourceCopy = Object.assign({}, overrideResources);
    var updateStaticResources = Object.keys(storage._resources).reduce(function (accumulator, currentValue) {
      accumulator[currentValue] = __assign(__assign(__assign({}, storage._resources[currentValue]), overrideResourceCopy[currentValue]), lastResources[currentValue]);
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
    storage._resources[lc] = updateResources[lc];
  };
  storage.setInitModel = function (init) {
    storage._initModel = init;
  };
  storage.getInitModel = function () {
    return storage._initModel;
  };
  storage.setConfig = function (c) {
    storage._c = c;
  };
  storage.config = function () {
    return storage._c;
  };
  storage.redirectUrl = location.origin + '/index.html?redirect=oauth2';
  storage.authentication = 'authentication';
  storage.home = 'home';
  storage.autoSearch = true;
  storage._privileges = new Map();
  storage._resourceService = new DefaultResourceService();
  storage._sessionStorageAllowed = true;
  return storage;
}());
exports.storage = storage;
function setSearchPermission(usr, url, permissionBuilder, com) {
  if (permissionBuilder) {
    var permission = permissionBuilder.buildPermission(usr, url);
    com.viewable = permission.viewable;
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.approvable = permission.approvable;
    com.deletable = permission.deletable;
  }
}
exports.setSearchPermission = setSearchPermission;
function setEditPermission(usr, url, permissionBuilder, com) {
  if (permissionBuilder) {
    var permission = permissionBuilder.buildPermission(usr, url);
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.deletable = permission.deletable;
  }
}
exports.setEditPermission = setEditPermission;
function authenticated() {
  var usr = storage.user();
  return (usr ? true : false);
}
exports.authenticated = authenticated;
function options() {
  var t = storage.token();
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
}
exports.options = options;
function initForm(form, initMat) {
  if (form) {
    if (!form.getAttribute('date-format')) {
      var df = storage.getDateFormat();
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
function language(profile) {
  return storage.language(profile);
}
exports.language = language;
function getDateFormat(profile) {
  return storage.getDateFormat(profile);
}
exports.getDateFormat = getDateFormat;
function getPrivileges() {
  return storage.getPrivileges();
}
exports.getPrivileges = getPrivileges;
function privileges() {
  return storage.privileges();
}
exports.privileges = privileges;
function user(profile) {
  return storage.user(profile);
}
exports.user = user;
function username(profile) {
  return storage.username(profile);
}
exports.username = username;
function getUserType(profile) {
  return storage.getUserType(profile);
}
exports.getUserType = getUserType;
function token(profile) {
  return storage.token(profile);
}
exports.token = token;
function getUserId(profile) {
  return storage.getUserId(profile);
}
exports.getUserId = getUserId;
function currency(currencyCode) {
  return storage.currency(currencyCode);
}
exports.currency = currency;
function locale(id) {
  return storage.locale(id);
}
exports.locale = locale;
function getLocale(profile) {
  return storage.getLocale(profile);
}
exports.getLocale = getLocale;
function getInitModel() {
  return storage.getInitModel();
}
exports.getInitModel = getInitModel;
function config() {
  return storage.config();
}
exports.config = config;
function message(msg, option) {
  storage.message(msg, option);
}
exports.message = message;
function alert(msg, header, detail, callback) {
  storage.alert(msg, header, detail, callback);
}
exports.alert = alert;
function confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback) {
  storage.confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback);
}
exports.confirm = confirm;
function resource() {
  return storage.resource();
}
exports.resource = resource;
function loading() {
  return storage.loading();
}
exports.loading = loading;
function ui() {
  return storage.ui();
}
exports.ui = ui;
function removeError(el) {
  var u = storage.ui();
  if (u) {
    u.removeError(el);
  }
}
exports.removeError = removeError;
function getValue(el, lc, currencyCode) {
  var u = storage.ui();
  if (u) {
    return u.getValue(el, lc, currencyCode);
  }
  else {
    return el.value;
  }
}
exports.getValue = getValue;
function registerEvents(form) {
  var u = storage.ui();
  if (u && form) {
    u.registerEvents(form);
  }
}
exports.registerEvents = registerEvents;
function numberOnFocus(event, lc) {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  storage.ui().numberOnFocus(event, lc);
}
exports.numberOnFocus = numberOnFocus;
function numberOnBlur(event, lc) {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  storage.ui().numberOnBlur(event, lc);
}
exports.numberOnBlur = numberOnBlur;
function percentageOnFocus(event, lc) {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  storage.ui().percentageOnFocus(event, lc);
}
exports.percentageOnFocus = percentageOnFocus;
function currencyOnFocus(event, lc, currencyCode) {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  if (!currencyCode) {
    var ctrl = event.currentTarget;
    currencyCode = ctrl.getAttribute('currency-code');
    if (!currencyCode) {
      currencyCode = ctrl.form.getAttribute('currency-code');
    }
  }
  storage.ui().currencyOnFocus(event, lc, currencyCode);
}
exports.currencyOnFocus = currencyOnFocus;
function currencyOnBlur(event, lc, currencyCode, includingCurrencySymbol) {
  event.preventDefault();
  if (!lc) {
    lc = storage.getLocale();
  }
  if (!currencyCode) {
    var ctrl = event.currentTarget;
    currencyCode = ctrl.getAttribute('currency-code');
    if (!currencyCode) {
      currencyCode = ctrl.form.getAttribute('currency-code');
    }
  }
  storage.ui().currencyOnBlur(event, lc, currencyCode, includingCurrencySymbol);
}
exports.currencyOnBlur = currencyOnBlur;
function emailOnBlur(event) {
  event.preventDefault();
  storage.ui().emailOnBlur(event);
}
exports.emailOnBlur = emailOnBlur;
function urlOnBlur(event) {
  event.preventDefault();
  storage.ui().urlOnBlur(event);
}
exports.urlOnBlur = urlOnBlur;
function phoneOnBlur(event) {
  event.preventDefault();
  storage.ui().phoneOnBlur(event);
}
exports.phoneOnBlur = phoneOnBlur;
function faxOnBlur(event) {
  event.preventDefault();
  storage.ui().phoneOnBlur(event);
}
exports.faxOnBlur = faxOnBlur;
function requiredOnBlur(event) {
  event.preventDefault();
  storage.ui().requiredOnBlur(event);
}
exports.requiredOnBlur = requiredOnBlur;
function checkPatternOnBlur(event) {
  event.preventDefault();
  storage.ui().patternOnBlur(event);
}
exports.checkPatternOnBlur = checkPatternOnBlur;
function messageByHttpStatus(status, gv) {
  var msg = gv('error_internal');
  if (status === 401) {
    msg = gv('error_unauthorized');
  }
  else if (status === 403) {
    msg = gv('error_forbidden');
  }
  else if (status === 404) {
    msg = gv('error_not_found');
  }
  else if (status === 410) {
    msg = gv('error_gone');
  }
  else if (status === 503) {
    msg = gv('error_service_unavailable');
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
    var status_1 = data.status;
    if (status_1 && !isNaN(status_1)) {
      msg = messageByHttpStatus(status_1, gv);
    }
    ae(msg, title);
  }
  else {
    ae(msg, title);
  }
}
exports.error = error;
function handleError(err) {
  var r = storage.resource();
  return error(err, r.value, storage.alert);
}
exports.handleError = handleError;
function inputView() {
  var i = {
    resource: storage.resource(),
    showError: storage.alert,
    getLocale: storage.getLocale,
    loading: storage.loading()
  };
  return i;
}
exports.inputView = inputView;
function inputSearch() {
  var i = {
    resource: storage.resource(),
    showMessage: storage.message,
    showError: storage.alert,
    ui: storage.ui(),
    getLocale: storage.getLocale,
    loading: storage.loading(),
    auto: storage.autoSearch
  };
  return i;
}
exports.inputSearch = inputSearch;
function inputEdit() {
  var i = {
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
exports.inputEdit = inputEdit;
function inputDiff() {
  var i = {
    resource: storage.resource(),
    showMessage: storage.message,
    showError: storage.alert,
    loading: storage.loading()
  };
  return i;
}
exports.inputDiff = inputDiff;
