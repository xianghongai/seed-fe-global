/**
 * 向全局环境添加变量
 */

import { cloneDeep } from 'lodash-es';
import { ProxyManager } from './proxy-manager';
import type { GlobalConfig, GlobalValue, Key, Scope } from './types';
import { validateKey, validateScope } from './utils';

/**
 * 检查是否在浏览器环境中
 */
const isBrowser = typeof window !== 'undefined';

/**
 * 全局对象，在浏览器环境中为window，在Node环境中为globalThis
 */
const globalObject: Record<string, unknown> = isBrowser ? window : globalThis;

/**
 * 全局变量管理器
 */
class Global {
  /**
   * 存储所有设置的值，避免直接暴露在全局对象上
   */
  private store: Record<Scope, Record<Key, GlobalValue>>;
  private proxyManager: ProxyManager;
  private config: Required<GlobalConfig>;

  constructor(config: GlobalConfig = {}) {
    this.store = {};
    this.proxyManager = new ProxyManager();
    this.config = {
      enableCache: config.enableCache ?? true,
    };

    // 初始化时创建代理
    this.setupGlobalProxy();
  }

  /**
   * 设置全局对象的代理，防止直接修改
   */
  private setupGlobalProxy(): void {
    // 遍历已有的命名空间，为每个命名空间设置代理
    Object.keys(this.store).forEach((scope) => {
      this.proxyManager.createScopeProxy(scope, this.store, globalObject);
    });
  }

  /**
   * 设置全局变量
   */
  set<T extends GlobalValue>(scope: Scope, key: Key, value: T): T {
    validateScope(scope);
    validateKey(key);

    // 确保命名空间存在
    if (!this.store[scope]) {
      this.store[scope] = {};
    }

    // 设置值到存储中
    this.store[scope][key] = value;

    // 更新代理
    if (this.config.enableCache) {
      this.proxyManager.clearProxyCache(scope);
    }
    this.proxyManager.createScopeProxy(scope, this.store, globalObject);

    return value;
  }

  /**
   * 一次性设置多个全局变量
   */
  setMany<T extends Record<Key, GlobalValue>>(scope: Scope, values: T): T {
    validateScope(scope);

    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      throw new Error('Values must be a non-null object');
    }

    // 确保命名空间存在
    if (!this.store[scope]) {
      this.store[scope] = {};
    }

    // 设置所有值到存储中
    Object.entries(values).forEach(([key, value]) => {
      validateKey(key);
      this.store[scope][key] = value;
    });

    // 更新代理
    if (this.config.enableCache) {
      this.proxyManager.clearProxyCache(scope);
    }
    this.proxyManager.createScopeProxy(scope, this.store, globalObject);

    return values;
  }

  /**
   * 获取全局变量
   */
  get<T extends GlobalValue>(scope: Scope, key: Key): T | undefined {
    validateScope(scope);
    validateKey(key);

    if (!this.store[scope]) {
      return undefined;
    }

    return this.store[scope][key] as T;
  }

  /**
   * 获取命名空间下的所有变量
   */
  getAll<T extends Record<Key, GlobalValue>>(scope: Scope): T | undefined {
    validateScope(scope);

    if (!this.store[scope]) {
      return undefined;
    }

    return cloneDeep(this.store[scope]) as T;
  }

  /**
   * 删除全局变量
   */
  remove(scope: Scope, key?: Key): boolean {
    validateScope(scope);

    if (key === undefined) {
      if (this.store[scope]) {
        delete this.store[scope];
        if (globalObject[scope]) {
          delete globalObject[scope];
        }
        return true;
      }
      return false;
    }

    validateKey(key);

    if (this.store[scope] && this.store[scope][key] !== undefined) {
      delete this.store[scope][key];

      // 更新代理
      if (this.config.enableCache) {
        this.proxyManager.clearProxyCache(scope);
      }
      this.proxyManager.createScopeProxy(scope, this.store, globalObject);

      return true;
    }

    return false;
  }

  /**
   * 检查全局变量是否存在
   */
  has(scope: Scope, key?: Key): boolean {
    validateScope(scope);

    if (key === undefined) {
      return this.store[scope] !== undefined;
    }

    validateKey(key);
    return this.store[scope] && this.store[scope][key] !== undefined;
  }
}

// 创建单例实例
export const global = new Global();

// 导出类型
export type { GlobalValue, GlobalConfig };

// 默认导出
export default global;
