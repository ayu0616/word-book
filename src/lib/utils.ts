import bcrypt from "bcryptjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashPassword(plain: string) {
  const saltRounds = 12;
  return bcrypt.hashSync(plain, saltRounds);
}

export function verifyPassword(plain: string, stored: string) {
  return bcrypt.compareSync(plain, stored);
}
