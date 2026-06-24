import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Criptografa uma senha em texto claro usando scrypt e gera o hash combinado com o salt.
 * Retorna no formato "salt:hash".
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifica se a senha em texto claro corresponde ao hash combinado armazenado ("salt:hash").
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const testHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch (err) {
    return false;
  }
}
