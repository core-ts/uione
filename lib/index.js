"use strict";
var __assign = (this && this.__assign) || function(){
  __assign = Object.assign || function(t){
    for (var s, i = 1, n = arguments.length; i < n; i++){
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(exports,"__esModule",{value:true});
var Gender;
(function(Gender){
  Gender["Male"] = "M";
  Gender["Female"] = "F";
  Gender["Unknown"] = "U";
})(Gender = exports.Gender || (exports.Gender = {}));
function toMap(map, forms){
  if (!map || !forms){
    return;
  }
  for (var _i = 0, forms_1 = forms; _i < forms_1.length; _i++){
    var form = forms_1[_i];
    map.set(form.path, form);
  }
  for (var _a = 0, forms_2 = forms; _a < forms_2.length; _a++){
    var form = forms_2[_a];
    if (form.children && Array.isArray(form.children)){
      toMap(map, form.children);
    }
  }
}
exports.toMap = toMap;
function sortPrivileges(forms){
  forms.sort(sortBySequence);
  for (var _i = 0, forms_3 = forms; _i < forms_3.length; _i++){
    var form = forms_3[_i];
    if (form.children && Array.isArray(form.children)){
      form.children = sortPrivileges(form.children);
    }
  }
  return forms;
}
exports.sortPrivileges = sortPrivileges;
function sortBySequence(a, b){
  if (!a.sequence){
    a.sequence = 99;
  }
  if (!b.sequence){
    b.sequence = 99;
  }
  return (a.sequence - b.sequence);
}
exports.sortBySequence = sortBySequence;
var DefaultResourceService=(function(){
  function DefaultResourceService(){
    this.resource = this.resource.bind(this);
    this.value = this.value.bind(this);
    this.format = this.format.bind(this);
  }
  DefaultResourceService.prototype.resource=function(){
    return storage.getResource();
  };
  DefaultResourceService.prototype.value=function(key, param){
    var resource = this.resource();
    if (typeof resource !== 'undefined'){
      var str = resource[key];
      if (!str || str.length === 0){
        return str;
      }
      if (!param){
        return str;
      }
      else {
        if (typeof param === 'string'){
          var paramValue = resource[param];
          if (!paramValue){
            paramValue = param;
          }
          return this.format(str, paramValue);
        }
      }
    }
    else {
      return '';
    }
  };
  DefaultResourceService.prototype.format=function(){
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++){
      args[_i] = arguments[_i];
    }
    var formatted = args[0];
    if (!formatted || formatted === ''){
      return '';
    }
    if (args.length > 1 && Array.isArray(args[1])){
      var params = args[1];
      for (var i = 0; i < params.length; i++){
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, params[i]);
      }
    }
    else {
      for (var i = 1; i < args.length; i++){
        var regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
        formatted = formatted.replace(regexp, args[i]);
      }
    }
    return formatted;
  };
  return DefaultResourceService;
}());
exports.DefaultResourceService = DefaultResourceService;
var storage = (function(){
  function storage(){
  }
  storage.getRedirectUrl=function(){
    return encodeURIComponent(storage.redirectUrl);
  };
  storage.setForms=function(forms){
    var f2 = forms;
    storage._privileges.clear();
    if (forms){
      f2 = sortPrivileges(forms);
      toMap(storage._privileges, f2);
    }
    storage._forms = f2;
    if (storage._sessionStorageAllowed === true){
      try {
        if (forms != null){
          sessionStorage.setItem('forms', JSON.stringify(forms));
        }
        else {
          sessionStorage.removeItem('forms');
        }
      }
      catch (err){
        storage._sessionStorageAllowed = false;
      }
    }
  };
  storage.privileges=function(){
    return storage._privileges;
  };
  storage.forms=function(){
    var forms = storage._forms;
    if (!forms){
      if (storage._sessionStorageAllowed === true){
        try {
          var rawForms = sessionStorage.getItem('forms');
          if (rawForms){
            storage._forms = JSON.parse(rawForms);
            forms = storage._forms;
          }
        }
        catch (err){
          storage._sessionStorageAllowed = false;
        }
      }
    }
    if (forms){
      return forms;
    }
    else {
      return [];
    }
  };
  storage.setUser=function(user){
    storage._user = user;
    if (user && user.privileges && Array.isArray(user.privileges)){
      user.privileges = sortPrivileges(user.privileges);
    }
    if (storage._sessionStorageAllowed === true){
      try {
        if (user != null){
          sessionStorage.setItem('authService', JSON.stringify(user));
        }
        else {
          sessionStorage.removeItem('authService');
        }
      }
      catch (err){
        storage._sessionStorageAllowed = false;
      }
    }
  };
  storage.getUser=function(){
    var user = storage._user;
    if (!user){
      if (storage._sessionStorageAllowed === true){
        try {
          var authService = sessionStorage.getItem('authService');
          if (authService){
            storage._user = JSON.parse(authService);
            user = storage._user;
          }
        }
        catch (err){
          storage._sessionStorageAllowed = false;
        }
      }
    }
    return user;
  };
  storage.getUserId=function(){
    var user = storage.getUser();
    if (!user){
      return '';
    }
    else {
      return user.userId;
    }
  };
  storage.getUserName=function(){
    var user = storage.getUser();
    if (!user){
      return '';
    }
    else {
      return user.username;
    }
  };
  storage.getToken=function(){
    var user = storage.getUser();
    if (!user){
      return null;
    }
    else {
      return user.token;
    }
  };
  storage.getUserType=function(){
    var user = storage.getUser();
    if (!user){
      return null;
    }
    else {
      return user.userType;
    }
  };
  storage.getDateFormat=function(){
    var user = storage.getUser();
    var localeService = storage.locale();
    if (user){
      if (user.dateFormat){
        var x = user.dateFormat;
        return (storage.moment ? x.toUpperCase() : x);
      }
      else if (user.language){
        var locale = localeService.getLocaleOrDefault(user.language);
        var x = locale.dateFormat;
        return (storage.moment ? x.toUpperCase() : x);
      }
      else {
        var language = storage.getBrowserLanguage();
        var locale = localeService.getLocaleOrDefault(language);
        var x = locale.dateFormat;
        return (storage.moment ? x.toUpperCase() : x);
      }
    }
    else {
      var language = storage.getBrowserLanguage();
      var locale = localeService.getLocaleOrDefault(language);
      var x = locale.dateFormat;
      return (storage.moment ? x.toUpperCase() : x);
    }
  };
  storage.getLanguage=function(){
    var user = storage.getUser();
    if (user && user.language){
      return user.language;
    }
    else {
      return storage.getBrowserLanguage();
    }
  };
  storage.getBrowserLanguage=function(){
    var browserLanguage = navigator.languages && navigator.languages[0]
      || navigator.language
      || navigator.userLanguage;
    return browserLanguage;
  };
  storage.getLocale=function(){
    var localeService = storage.locale();
    return localeService.getLocaleOrDefault(storage.getLanguage());
  };
  storage.locale=function(){
    return storage._localeService;
  };
  storage.setLocaleService=function(localeService){
    storage._localeService = localeService;
  };
  storage.currency=function(){
    return storage._currencyService;
  };
  storage.setCurrencyService=function(currencyService){
    storage._currencyService = currencyService;
  };
  storage.alert=function(){
    return storage._alertService;
  };
  storage.setAlertService=function(alertService){
    storage._alertService = alertService;
  };
  storage.loading=function(){
    return storage._loadingService;
  };
  storage.setLoadingService=function(loadingService){
    storage._loadingService = loadingService;
  };
  storage.toast=function(){
    return storage._toastService;
  };
  storage.setToastService=function(toastService){
    storage._toastService = toastService;
  };
  storage.ui=function(){
    return storage._uiService;
  };
  storage.setUIService=function(uiService){
    storage._uiService = uiService;
  };
  storage.getResources=function(){
    return storage._resources;
  };
  storage.setResources=function(resources){
    storage._resources = resources;
  };
  storage.resource=function(){
    return storage._resourceService;
  };
  storage.getResource=function(){
    var resources = storage._resources;
    var resource = resources[storage.getLanguage()];
    return (resource ? resource : resources['en']);
  };
  storage.getResourceByLocale=function(locale){
    return storage._resources[locale];
  };
  storage.setResource=function(locale, overrideResources, lastResources){
    var overrideResourceCopy = Object.assign({}, overrideResources);
    var updateStaticResources = Object.keys(storage._resources).reduce(function(accumulator, currentValue){
      accumulator[currentValue] = __assign(__assign(__assign({}, storage._resources[currentValue]), overrideResourceCopy[currentValue]), lastResources[currentValue]);
      return accumulator;
    }, {});
    var originResources = Object.keys(lastResources).reduce(function(accumulator, currentValue){
      var _a;
      if (accumulator[currentValue]){
        accumulator[currentValue] = __assign(__assign({}, overrideResources[currentValue]), lastResources[currentValue]);
        return accumulator;
      }
      return __assign(__assign({}, accumulator), (_a = {}, _a[currentValue] = lastResources[currentValue], _a));
    }, overrideResourceCopy);
    var updateResources = __assign(__assign({}, originResources), updateStaticResources);
    storage._resources[locale] = updateResources[locale];
  };
  storage.setInitModel=function(init){
    storage._initModel = init;
  };
  storage.getInitModel=function(){
    return storage._initModel;
  };
  storage.redirectUrl = location.origin + '/index.html?redirect=oauth2';
  storage.authentication = 'authentication';
  storage.home = 'home';
  storage.moment = false;
  storage.autoSearch = true;
  storage._user = null;
  storage._forms = null;
  storage._privileges = new Map();
  storage._resources = null;
  storage._alertService = null;
  storage._loadingService = null;
  storage._toastService = null;
  storage._localeService = null;
  storage._currencyService = null;
  storage._resourceService = new DefaultResourceService();
  storage._uiService = null;
  storage._sessionStorageAllowed = true;
  return storage;
}());
exports.storage = storage;
function setSearchPermission(user, url, permissionBuilder, com){
  if (permissionBuilder){
    var permission = permissionBuilder.buildPermission(user, url);
    com.viewable = permission.viewable;
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.approvable = permission.approvable;
    com.deletable = permission.deletable;
  }
}
exports.setSearchPermission = setSearchPermission;
function setEditPermission(user, url, permissionBuilder, com){
  if (permissionBuilder){
    var permission = permissionBuilder.buildPermission(user, url);
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.deletable = permission.deletable;
  }
}
exports.setEditPermission = setEditPermission;
function authenticated(){
  var user = storage.getUser();
  if (user){
    return true;
  }
  else {
    return false;
  }
}
exports.authenticated = authenticated;
var HttpOptionsService = (function(){
  function HttpOptionsService(){
  }
  HttpOptionsService.prototype.getHttpOptions=function(){
    var token = storage.getToken();
    if (token === null){
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      };
    }
    else {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': 'Bearer ' + token
        }
      };
    }
  };
  return HttpOptionsService;
}());
exports.httpOptionsService = new HttpOptionsService();
function initForm(form, initMat){
  if (form){
    if (!form.getAttribute('date-format')){
      var df = storage.getDateFormat();
      form.setAttribute('date-format', df);
    }
    setTimeout(function(){
      if (initMat){
        initMat(form);
      }
      focusFirstElement(form);
    }, 100);
  }
  return form;
}
exports.initForm = initForm;
function focusFirstElement(form){
  var i = 0;
  var len = form.length;
  for (i = 0; i < len; i++){
    var ctrl = form[i];
    if (!(ctrl.readOnly || ctrl.disabled)){
      var nodeName = ctrl.nodeName;
      var type = ctrl.getAttribute('type');
      if (type){
        var t = type.toUpperCase();
        if (t === 'SUBMIT'){
          ctrl.focus();
        }
        if (nodeName === 'INPUT'){
          nodeName = t;
        }
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'CHECKBOX'
        && nodeName !== 'RADIO'){
        ctrl.focus();
        try {
          ctrl.setSelectionRange(0, ctrl.value.length);
        }
        catch (err){
        }
        return;
      }
    }
  }
}
exports.focusFirstElement = focusFirstElement;
function initMaterial(form){
  var ui = storage.ui();
  if (ui){
    ui.initMaterial(form);
  }
}
exports.initMaterial = initMaterial;
function getLocale(){
  return storage.getLocale();
}
exports.getLocale = getLocale;
function showToast(msg){
  storage.toast().showToast(msg);
}
exports.showToast = showToast;
function alertError(msg, header, detail, callback){
  storage.alert().alertError(msg, header, detail, callback);
}
exports.alertError = alertError;
function confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback){
  storage.alert().confirm(msg, header, yesCallback, btnLeftText, btnRightText, noCallback);
}
exports.confirm = confirm;
function numberOnFocus(event){
  event.preventDefault();
  storage.ui().numberOnFocus(event, storage.getLocale());
}
exports.numberOnFocus = numberOnFocus;
function numberOnBlur(event){
  event.preventDefault();
  storage.ui().numberOnBlur(event, storage.getLocale());
}
exports.numberOnBlur = numberOnBlur;
function percentageOnFocus(event){
  event.preventDefault();
  storage.ui().percentageOnFocus(event, storage.getLocale());
}
exports.percentageOnFocus = percentageOnFocus;
function currencyOnFocus(event){
  event.preventDefault();
  storage.ui().currencyOnFocus(event, storage.getLocale(), '');
}
exports.currencyOnFocus = currencyOnFocus;
function currencyOnBlur(event){
  event.preventDefault();
  storage.ui().currencyOnBlur(event, storage.getLocale(), '', false);
}
exports.currencyOnBlur = currencyOnBlur;
function emailOnBlur(event){
  event.preventDefault();
  storage.ui().emailOnBlur(event);
}
exports.emailOnBlur = emailOnBlur;
function urlOnBlur(event){
  event.preventDefault();
  storage.ui().urlOnBlur(event);
}
exports.urlOnBlur = urlOnBlur;
function phoneOnBlur(event){
  event.preventDefault();
  storage.ui().phoneOnBlur(event);
}
exports.phoneOnBlur = phoneOnBlur;
function faxOnBlur(event){
  event.preventDefault();
  storage.ui().phoneOnBlur(event);
}
exports.faxOnBlur = faxOnBlur;
function requiredOnBlur(event){
  event.preventDefault();
  storage.ui().requiredOnBlur(event);
}
exports.requiredOnBlur = requiredOnBlur;
function checkPatternOnBlur(event){
  event.preventDefault();
  storage.ui().patternOnBlur(event);
}
exports.checkPatternOnBlur = checkPatternOnBlur;
