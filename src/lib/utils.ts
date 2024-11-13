import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeBase64WithSalt(base64: string) {
  const salt = process.env.BASE64_SALT || '';
  const base64Standard = base64.replace(/-/g, '+').replace(/_/g, '/');
  const buffer = Buffer.from(base64Standard, 'base64');
  const decoded = buffer.toString('utf-8');
  return decoded.replace(salt, '');
}

export function encodeBase64WithSalt(string: string) {
  const salt = process.env.BASE64_SALT || '';
  const saltedString = string + salt;
  const buffer = Buffer.from(saltedString, 'utf-8');
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function isArrayOfObjects(obj: unknown): obj is { [key: string]: string }[] {
  return Array.isArray(obj) && obj.every((item) => typeof item === 'object' && item !== null);
}

export function convertArrayOfObjectsToFormat(updatesArray: { [key: string]: string }[]): { field: string, value: string }[] {
  return updatesArray.map(update => {
    const [field, value] = Object.entries(update)[0];
    return { field, value };
  })
}

export function validatesForDatabaseRequiredFormat(body: { [key: string]: string }[]) {
  const isArray = isArrayOfObjects(body);
  if(!isArray) return false;
  return convertArrayOfObjectsToFormat(body);
}