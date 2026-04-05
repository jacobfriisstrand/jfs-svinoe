import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");

function resolveKey(key: string): string {
  const resolved = join(UPLOAD_DIR, key);
  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error("Invalid key");
  }
  return resolved;
}

export function getPublicUrl(key: string): string {
  return `/api/files/${key}`;
}

export function uploadFile(
  key: string,
  body: Buffer,
  _contentType: string
): string {
  const filePath = resolveKey(key);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, body);
  return getPublicUrl(key);
}

export function deleteFile(key: string): void {
  const filePath = resolveKey(key);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export function fileExists(key: string): boolean {
  return existsSync(resolveKey(key));
}
