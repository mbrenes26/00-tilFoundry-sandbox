import { open, readFile, rename, stat, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { CHECKPOINT_MAX_BYTES, parseCheckpoint, restoreCheckpoint, serializeCheckpoint, type CheckpointV1, type TrainingState } from './checkpoint';
import type { PolicyV1 } from './policy';
import { POLICY_MAX_BYTES, checkBytes, parsePolicy, serializePolicy } from './policy-format';

interface TemporaryHandle {
  writeFile(text: string): Promise<void>; sync(): Promise<void>; close(): Promise<void>;
}
/** Inyección de fallos para pruebas; producción usa fs real, sin dobles. */
export interface FileOperations {
  open(path: string, flags: string): Promise<TemporaryHandle>;
  rename(from: string, to: string): Promise<void>;
  unlink(path: string): Promise<void>;
  stat(path: string): Promise<{ size: number }>;
  readFile(path: string): Promise<Buffer>;
}
export const defaultFileOperations: FileOperations = { open, rename, unlink, stat, readFile };
function detail(error: unknown): string { return error instanceof Error ? error.message : 'Error de archivo desconocido'; }
/** Temporal único en la misma carpeta/dispositivo. Nunca borra el destino antes de rename.
 * sync del archivo antes del reemplazo; si write/sync/close/rename fallan se limpia el temporal.
 * No garantiza persistencia ante corte eléctrico, ni semántica de todos los sistemas de archivos.
 * Si Windows niega reemplazar un archivo abierto, se informa sin destruir el anterior.
 * Cargas/validaciones no escriben. Una falla de limpieza se informa junto al error original. */
async function atomicSave(path: string, text: string, fs: FileOperations): Promise<void> {
  const temporary = `${path}.${randomUUID()}.tmp`;
  let handle: TemporaryHandle | undefined, created = false;
  try {
    handle = await fs.open(temporary, 'wx'); created = true;
    await handle.writeFile(text); await handle.sync(); await handle.close(); handle = undefined;
    await fs.rename(temporary, path); created = false;
  } catch (error) {
    const cleanup: string[] = [];
    if (handle) try { await handle.close(); } catch (closeError) { cleanup.push(detail(closeError)); }
    if (created) try { await fs.unlink(temporary); } catch (unlinkError) { cleanup.push(detail(unlinkError)); }
    throw new Error(`No se pudo guardar el archivo. No se eliminó el destino anterior. ${detail(error)}${cleanup.length ? ` Limpieza del temporal pendiente: ${cleanup.join('; ')}.` : ''}`);
  }
}
async function limitedRead(path: string, maximum: number, fs: FileOperations): Promise<string> {
  try {
    checkBytes((await fs.stat(path)).size, maximum);
    const bytes = await fs.readFile(path); checkBytes(bytes.byteLength, maximum);
    // Rechaza UTF-8 inválido, no lo reemplaza silenciosamente por U+FFFD.
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) { throw new Error(`No se pudo leer el archivo. ${detail(error)}`); }
}
export async function savePolicy(path: string, policy: PolicyV1, fs = defaultFileOperations): Promise<void> {
  const text = serializePolicy(policy); await atomicSave(path, text, fs);
}
export async function loadPolicy(path: string, fs = defaultFileOperations): Promise<PolicyV1> {
  return parsePolicy(await limitedRead(path, POLICY_MAX_BYTES, fs));
}
export async function saveCheckpoint(path: string, checkpoint: CheckpointV1, fs = defaultFileOperations): Promise<void> {
  const text = serializeCheckpoint(checkpoint); await atomicSave(path, text, fs);
}
export async function loadCheckpoint(path: string, fs = defaultFileOperations): Promise<TrainingState> {
  return restoreCheckpoint(parseCheckpoint(await limitedRead(path, CHECKPOINT_MAX_BYTES, fs)));
}
