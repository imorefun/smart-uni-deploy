import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultConfig, defineConfig, loadConfig, loadEnvConfig } from './config';

// 模拟环境变量
const mockEnvVars = {
  DINGTALK_WEBHOOK: 'mock-dingtalk-webhook',
  MP_ALIPAY_PRIVATE_KEY: 'mock-alipay-key',
  MP_ALIPAY_TOOL_ID: 'mock-alipay-tool',
  MP_WEIXIN_PRIVATE_KEY: 'mock-weixin-key',
  MP_WEIXIN_PRIVATE_KEY_PATH: 'mock-weixin-path',
  WECOM_WEBHOOK: 'mock-wecom-webhook',
};

describe('config', () => {
  beforeEach(() => {
    // 清除环境变量
    for (const key of Object.keys(mockEnvVars)) {
      delete process.env[key];
    }
    vi.clearAllMocks();
  });

  it('defaultConfig', () => {
    expect(defaultConfig).toEqual({
      cwd: process.cwd(),
    });
  });

  it('defineConfig', () => {
    const testConfig = { cwd: '/test' };
    expect(defineConfig(testConfig)).toBe(testConfig);
  });

  it('loadEnvConfig', () => {
    // 设置环境变量
    Object.assign(process.env, mockEnvVars);

    const result = loadEnvConfig();

    expect(result).toEqual({
      dingtalk: {
        webhook: mockEnvVars.DINGTALK_WEBHOOK,
      },
      'mp-alipay': {
        privateKey: mockEnvVars.MP_ALIPAY_PRIVATE_KEY,
        toolId: mockEnvVars.MP_ALIPAY_TOOL_ID,
      },
      'mp-weixin': {
        privateKey: mockEnvVars.MP_WEIXIN_PRIVATE_KEY,
        privateKeyPath: mockEnvVars.MP_WEIXIN_PRIVATE_KEY_PATH,
      },
      wecom: {
        webhook: mockEnvVars.WECOM_WEBHOOK,
      },
    });
  });

  it('loadEnvConfig with no env vars', () => {
    const result = loadEnvConfig();

    expect(result).toEqual({
      dingtalk: {
        webhook: undefined,
      },
      'mp-alipay': {
        privateKey: undefined,
        toolId: undefined,
      },
      'mp-weixin': {
        privateKey: undefined,
        privateKeyPath: undefined,
      },
      wecom: {
        webhook: undefined,
      },
    });
  });

  it('loadConfig with inline config', async () => {
    const inlineConfig = { cwd: '/test' };
    const result = await loadConfig(inlineConfig);

    expect(result.cwd).toBe('/test');
  });
});
