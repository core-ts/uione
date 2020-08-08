export interface AlertService {
  confirm(msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void): void;
  alertError(msg: string, header?: string, detail?: string, callback?: () => void): void;
  alertWarning(msg: string, header?: string, callback?: () => void): void;
  alertInfo(msg: string, header?: string, callback?: () => void): void;
  alertSuccess(msg: string, detail?: string, callback?: () => void): void;
}
