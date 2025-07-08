import { beforeEach, describe, expect, it } from 'vitest';
import global from '../index';
import type { TestGlobalInstance, TestValue, ValidValue } from '../types';

describe('Global', () => {
  beforeEach(() => {
    // 清理所有已存在的作用域
    const scopes = ['test', 'user', 'app'];
    scopes.forEach((scope) => {
      if (global.has(scope)) {
        global.remove(scope);
      }
    });
  });

  describe('set', () => {
    it('should set a value correctly', () => {
      const value = { name: 'test' };
      global.set('test', 'key', value);
      expect(global.get('test', 'key')).toEqual(value);
    });

    it('should throw error for invalid scope', () => {
      expect(() => global.set('', 'key', 'value')).toThrow('Scope must be a non-empty string');
      expect(() => global.set(null as unknown as string, 'key', 'value')).toThrow('Scope must be a non-empty string');
    });

    it('should throw error for invalid key', () => {
      expect(() => global.set('test', '', 'value')).toThrow('Key must be a non-empty string');
      expect(() => global.set('test', null as unknown as string, 'value')).toThrow('Key must be a non-empty string');
    });
  });

  describe('setMany', () => {
    it('should set multiple values correctly', () => {
      const values = {
        key1: 'value1',
        key2: 'value2',
      };
      global.setMany('test', values);
      expect(global.get('test', 'key1')).toBe('value1');
      expect(global.get('test', 'key2')).toBe('value2');
    });

    it('should throw error for invalid values object', () => {
      expect(() => global.setMany('test', null as unknown as Record<string, ValidValue>)).toThrow(
        'Values must be a non-null object'
      );
      expect(() => global.setMany('test', [] as unknown as Record<string, ValidValue>)).toThrow(
        'Values must be a non-null object'
      );
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent scope', () => {
      expect(global.get('nonexistent', 'key')).toBeUndefined();
    });

    it('should return undefined for non-existent key', () => {
      global.set('test', 'key', 'value');
      expect(global.get('test', 'nonexistent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all values in a scope', () => {
      const values = {
        key1: 'value1',
        key2: 'value2',
      };
      global.setMany('test', values);
      expect(global.getAll('test')).toEqual(values);
    });

    it('should return undefined for non-existent scope', () => {
      expect(global.getAll('nonexistent')).toBeUndefined();
    });

    it('should return a deep copy of values', () => {
      const original: TestValue = { nested: { value: 'test' } };
      global.set('test', 'key', original);
      const retrieved = global.getAll<Record<string, TestValue>>('test');
      if (retrieved) {
        retrieved.key.nested.value = 'modified';
      }
      expect(global.get('test', 'key')).toEqual(original);
    });
  });

  describe('remove', () => {
    it('should remove a specific key', () => {
      global.set('test', 'key', 'value');
      expect(global.remove('test', 'key')).toBe(true);
      expect(global.get('test', 'key')).toBeUndefined();
    });

    it('should remove entire scope', () => {
      global.set('test', 'key', 'value');
      expect(global.remove('test')).toBe(true);
      expect(global.has('test')).toBe(false);
    });

    it('should return false when removing non-existent key', () => {
      expect(global.remove('test', 'nonexistent')).toBe(false);
    });
  });

  describe('has', () => {
    it('should check scope existence', () => {
      global.set('test', 'key', 'value');
      expect(global.has('test')).toBe(true);
      expect(global.has('nonexistent')).toBe(false);
    });

    it('should check key existence', () => {
      global.set('test', 'key', 'value');
      expect(global.has('test', 'key')).toBe(true);
      expect(global.has('test', 'nonexistent')).toBe(false);
    });
  });

  describe('proxy behavior', () => {
    it('should prevent direct modification of global object', () => {
      const scope = 'test';
      const key = 'key';
      const value = 'value';

      global.set(scope, key, value);

      const globalInstance = global as unknown as TestGlobalInstance;
      globalInstance[scope] = { [key]: 'modified' };

      expect(global.get(scope, key)).toBe(value);
    });

    it('should prevent direct modification of scope', () => {
      const scope = 'test';
      const key = 'key';
      const value = 'value';

      global.set(scope, key, value);

      const globalInstance = global as unknown as TestGlobalInstance;
      globalInstance[scope] = {};

      expect(global.get(scope, key)).toBe(value);
    });
  });
});
