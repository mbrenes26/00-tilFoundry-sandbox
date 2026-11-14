import { MAP_VERSION, RULES_VERSION } from '../game/contracts';
import type { PolicyV1 } from './policy';

export const POLICY_MAX_BYTES = 2 * 1024 * 1024;
export const ARCHITECTURE = Object.freeze({ input: 36, hidden: 64, output: 4, activation: 'relu', outputActivation: 'linear', weightOrder: 'output-major' });
export function requireValid(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Archivo inválido o incompatible: ${label}.`);
}
export function object(value: unknown, label: string): Record<string, unknown> {
  requireValid(value !== null && typeof value === 'object' && !Array.isArray(value), label);
  return value as Record<string, unknown>;
}
export function exactKeys(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  requireValid(Object.keys(value).length === keys.length && Object.keys(value).every(key => keys.includes(key)), `${label}: campos del formato`);
}
export function integer(value: unknown, min: number, max: number, label: string): asserts value is number {
  requireValid(typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max, label);
}
export function finite(value: unknown, min: number, max: number, label: string): asserts value is number {
  requireValid(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max, label);
}
export function numericArray(value: unknown, length: number, min: number, max: number, label: string, integers = false): asserts value is number[] {
  requireValid(Array.isArray(value) && value.length === length, `${label}: dimensiones`);
  for (const n of value) { finite(n, min, max, label); if (integers) integer(n, min, max, label); }
}
export function compatible(value: Record<string, unknown>): void {
  requireValid(value.schemaVersion === 1 && value.mapVersion === MAP_VERSION && value.rulesVersion === RULES_VERSION, 'versiones de formato, mapa o reglas');
}
export function validateParameters(value: unknown): asserts value is PolicyV1['parameters'] {
  const p = object(value, 'parámetros'); exactKeys(p, ['w1', 'b1', 'w2', 'b2'], 'parámetros');
  for (const [key, size] of [['w1', 36 * 64], ['b1', 64], ['w2', 64 * 4], ['b2', 4]] as const)
    numericArray(p[key], size, -Number.MAX_VALUE, Number.MAX_VALUE, key);
}
export function validateArchitecture(value: unknown): void {
  const a = object(value, 'arquitectura'); exactKeys(a, Object.keys(ARCHITECTURE), 'arquitectura');
  for (const [key, expected] of Object.entries(ARCHITECTURE)) requireValid(a[key] === expected, `arquitectura ${key}`);
}
/** No Node/Phaser: la misma validación se importa desde el navegador y desde Node. */
export function validatePolicy(value: unknown): asserts value is PolicyV1 {
  const p = object(value, 'política'); exactKeys(p, ['schemaVersion', 'rulesVersion', 'mapVersion', 'architecture', 'parameters', 'metadata'], 'política'); compatible(p); validateArchitecture(p.architecture); validateParameters(p.parameters);
  const m = object(p.metadata, 'metadatos'); exactKeys(m, ['seed', 'trainingSteps', 'updates'], 'metadatos');
  integer(m.seed, 0, 0xffffffff, 'semilla'); integer(m.trainingSteps, 0, Number.MAX_SAFE_INTEGER, 'pasos');
  integer(m.updates, 0, m.trainingSteps, 'actualizaciones');
}
export function checkBytes(bytes: number, maximum: number): void {
  requireValid(bytes <= maximum, `tamaño máximo ${maximum / 1024 / 1024} MiB`);
}
/** Cuenta UTF-8 sin asignar otro array del tamaño del archivo. Surrogates aislados = U+FFFD (3 bytes). */
export function utf8Bytes(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes++;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length && text.charCodeAt(i + 1) >= 0xdc00 && text.charCodeAt(i + 1) <= 0xdfff) { bytes += 4; i++; }
    else bytes += 3;
  }
  return bytes;
}
export function parseLimited(text: string, maximum: number): unknown {
  checkBytes(utf8Bytes(text), maximum);
  try { return JSON.parse(text) as unknown; } catch { throw new Error('Archivo JSON corrupto: no se puede leer su contenido.'); }
}
export function parsePolicy(text: string): PolicyV1 {
  const p = parseLimited(text, POLICY_MAX_BYTES); validatePolicy(p); return p;
}
export function serializePolicy(policy: PolicyV1): string {
  validatePolicy(policy); const text = JSON.stringify(policy); checkBytes(utf8Bytes(text), POLICY_MAX_BYTES); return text;
}
