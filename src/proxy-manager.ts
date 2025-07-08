import logger from '@seed-fe/logger';
import type { GlobalValue, Key, Scope } from './types';

/**
 * 代理管理器类
 * 负责创建和缓存代理对象
 */
export class ProxyManager {
  private proxyCache: Map<string, object>;

  constructor() {
    this.proxyCache = new Map();
  }

  /**
   * 为指定的存储对象创建代理
   */
  createScopeProxy(
    scope: Scope,
    store: Record<Scope, Record<Key, GlobalValue>>,
    globalObject: Record<string, unknown>
  ): void {
    // 如果已经存在，先删除
    if (globalObject[scope]) {
      delete globalObject[scope];
    }

    // 使用 Object.defineProperty 定义不可写的属性
    Object.defineProperty(globalObject, scope, {
      enumerable: true,
      configurable: true,
      get: () => {
        // 检查缓存中是否已存在代理对象
        const existingProxy = this.proxyCache.get(scope);
        if (existingProxy) {
          return existingProxy;
        }

        // 创建新的代理对象
        const scopeProxy: Record<string, unknown> = {};

        // 为命名空间中的每个键创建代理
        Object.keys(store[scope] || {}).forEach((key) => {
          Object.defineProperty(scopeProxy, key, {
            enumerable: true,
            configurable: true,
            get: () => store[scope][key],
            set: () => {
              logger.warn(
                `警告: 尝试直接修改 ${scope}.${key} 被阻止。请使用 global.set('${scope}', '${key}', value) 进行修改。`
              );
              return false;
            },
          });
        });

        // 缓存代理对象
        this.proxyCache.set(scope, scopeProxy);

        return scopeProxy;
      },
      set: () => {
        logger.warn(`警告: 尝试直接修改 ${scope} 被阻止。请使用 global.set('${scope}', 'key', value) 进行修改。`);
        return false;
      },
    });
  }

  /**
   * 清除指定作用域的代理缓存
   */
  clearProxyCache(scope: string): void {
    this.proxyCache.delete(scope);
  }
}
