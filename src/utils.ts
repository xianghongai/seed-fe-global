import type { Key, Scope } from './types';

/**
 * 验证作用域是否有效
 */
export function validateScope(scope: Scope): void {
  if (!scope || typeof scope !== 'string') {
    throw new Error('Scope must be a non-empty string');
  }
}

/**
 * 验证键是否有效
 */
export function validateKey(key: Key): void {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a non-empty string');
  }
}
