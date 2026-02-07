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
  }
  ResourceService.prototype.resource = function () {
    return s.getResource();
  };
  return ResourceService;
}());
exports.ResourceService = ResourceService;
var s = (function () {
  function s() {
  }
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
  s.getStatusName = function (status, m) {
    return status;
  };
  s.getFlowStatusName = function (status, m) {
    return status;
  };
  s.canApprove = function (s) {
    return s === Status.Submitted;
  };
  s.afterSubmitted = function (s) {
    return s === Status.Approved || s === Status.Published;
  };
  s.isApproved = function (s) {
    return s === Status.Approved;
  };
  s.canPublish = function (s) {
    return s === Status.Approved;
  };
  s.isPublished = function (s) {
    return s === Status.Published;
  };
  s.canSubmit = function (s) {
    return s !== Status.Submitted && s !== Status.Approved && s !== Status.Published && s !== Status.Expired;
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
  s.getUser = function (profile) {
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
    var u = s.getUser(profile);
    return (!u ? '' : u.id);
  };
  s.getUsername = function (profile) {
    var u = s.getUser(profile);
    return (!u ? '' : u.username);
  };
  s.getToken = function (profile) {
    var u = s.getUser(profile);
    return Promise.resolve(!u ? undefined : u.token);
  };
  s.getOptions = function (profile) {
    return s.getToken().then(function (t) {
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
    var u = s.getUser(profile);
    return (!u ? undefined : u.userType);
  };
  s.getDateFormat = function (profile) {
    var u = s.getUser(profile);
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
    var u = s.getUser(profile);
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
  Status.Draft = 'D';
  Status.Submitted = 'S';
  Status.Rejected = 'R';
  Status.Approved = 'A';
  Status.Published = 'P';
  Status.Expired = 'E';
  Status.RequestToEdit = 'T';
  Status.Active = 'A';
  Status.Inactive = 'I';
  Status.Deativated = 'D';
  Status.Deleted = 'D';
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
function getStatusName(status, m) {
  return s.getStatusName(status, m);
}
exports.getStatusName = getStatusName;
function getFlowStatusName(status, m) {
  return s.getFlowStatusName(status, m);
}
exports.getFlowStatusName = getFlowStatusName;
function canApprove(status) {
  return s.canApprove(status);
}
exports.canApprove = canApprove;
function afterSubmitted(status) {
  return s.afterSubmitted(status);
}
exports.afterSubmitted = afterSubmitted;
function isApproved(status) {
  return s.isApproved(status);
}
exports.isApproved = isApproved;
function canPublish(status) {
  return s.canPublish(status);
}
exports.canPublish = canPublish;
function isPublished(status) {
  return s.isPublished(status);
}
exports.isPublished = isPublished;
function canSubmit(status) {
  return s.canSubmit(status);
}
exports.canSubmit = canSubmit;
function authenticated() {
  var usr = s.getUser();
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
    result = result.substring(0, result.length - 1);
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
function getOptions() {
  return s.getOptions();
}
exports.getOptions = getOptions;
exports.options = getOptions;
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
  return s.getUser(profile);
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
  return s.getUsername(profile);
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
  return s.getToken(profile);
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
function alert(msg, callback, header, detail) {
  s.alert(msg, callback, header, detail);
}
exports.alert = alert;
exports.showAlert = alert;
function confirm(msg, yesCallback, header, btnLeftText, btnRightText, noCallback) {
  s.confirm(msg, yesCallback, header, btnLeftText, btnRightText, noCallback);
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
function messageByHttpStatus(n, r) {
  var k = 'error_' + n;
  var msg = r[k];
  if (!msg || msg.length === 0) {
    msg = r.error_500;
  }
  return msg;
}
exports.messageByHttpStatus = messageByHttpStatus;
function error(err, r, ae) {
  var title = r.error;
  var msg = r.error_500;
  if (!err) {
    ae(msg, undefined, title);
    return;
  }
  var data = err && err.response ? err.response : err;
  if (data) {
    var st = data.status;
    if (st && !isNaN(st)) {
      msg = messageByHttpStatus(st, r);
    }
    ae(msg, undefined, title);
  }
  else {
    ae(msg, undefined, title);
  }
}
exports.error = error;
function handleError(err) {
  var r = s.resource();
  return error(err, r.resource(), s.alert);
}
exports.handleError = handleError;
function inputSearch(profile) {
  var i = {
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
    showMessage: s.message,
    showError: s.alert,
    confirm: s.confirm,
    ui: s.ui(),
    getLocale: s.getLocale,
    loading: s.loading(),
  };
  return i;
}
exports.inputEdit = inputEdit;
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
