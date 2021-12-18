export interface Resource {
  resource(): StringMap;
  value(key: string, param?: any): string;
  format(f: string, ...args: any[]): string;
}
export interface StringMap {
  [key: string]: string;
}
