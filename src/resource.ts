export interface Resource {
  resource(): StringMap;
}
export interface StringMap {
  [key: string]: string;
}
