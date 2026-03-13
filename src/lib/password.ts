import { scrypt, timingSafeEqual, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const SALT_LEN = 16;
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${salt.toString("base64")}.${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, keyB64] = stored.split(".");
  if (!saltB64 || !keyB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  const expected = Buffer.from(keyB64, "base64");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
