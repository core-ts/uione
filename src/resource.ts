export interface ResourceService {
  resource(): StringMap;
  value(key: string, param?: any): string;
  format(...args: any[]): string;
}
export interface StringMap {
  [key: string]: string;
}
