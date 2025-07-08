/**
 * 基础类型定义
 */
export type Scope = string;
export type Key = string;
export type ValidValue = string | number | boolean | object | null | undefined;
export type GlobalValue = ValidValue;

/**
 * 配置相关类型
 */
export type GlobalConfig = {
  /**
   * 是否启用缓存
   * @default true
   */
  enableCache?: boolean;
};

/**
 * 测试相关类型
 */
export type TestValue = {
  nested: {
    value: string;
  };
};

export type TestGlobalInstance = {
  [key: string]: unknown;
};
