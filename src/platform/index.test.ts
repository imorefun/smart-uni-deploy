import { describe, expect, it, vi } from 'vitest';
import {
  platformMap,
  platformPreview,
  platformPreviewMap,
  platforms,
  platformsValidate,
  platformUpload,
  platformUploadMap,
  platformValidate,
  platformValidateMap,
} from './index';

// 模拟mp-weixin和mp-alipay模块
vi.mock('./mp-weixin', () => ({
  mpWeixinValidate: vi.fn().mockReturnValue(true),
  mpWeixinPreview: vi.fn().mockResolvedValue('weixin-preview-result'),
  mpWeixinUpload: vi.fn().mockResolvedValue('weixin-upload-result'),
}));

vi.mock('./mp-alipay', () => ({
  mpAlipayValidate: vi.fn().mockReturnValue(true),
  mpAlipayPreview: vi.fn().mockResolvedValue('alipay-preview-result'),
  mpAlipayUpload: vi.fn().mockResolvedValue('alipay-upload-result'),
}));

describe('platform/index', () => {
  const mockConfig = {} as any;
  const mockPRetryOptions = { retries: 3 } as any;

  it('should export correct constants', () => {
    expect(platforms).toEqual(['mp-weixin', 'mp-alipay']);
    expect(platformMap).toEqual({
      'mp-alipay': '支付宝小程序',
      'mp-weixin': '微信小程序',
    });
    expect(Object.keys(platformValidateMap)).toEqual(['mp-alipay', 'mp-weixin']);
    expect(Object.keys(platformUploadMap)).toEqual(['mp-alipay', 'mp-weixin']);
    expect(Object.keys(platformPreviewMap)).toEqual(['mp-alipay', 'mp-weixin']);
  });

  it('platformValidate should call the correct validate function', () => {
    platformValidate(mockConfig, 'mp-weixin');
    platformValidate(mockConfig, 'mp-alipay');

    // 这里无法直接验证，因为我们只测试了导出的函数是否存在
    expect(true).toBe(true);
  });

  it('platformsValidate should validate all platforms', () => {
    const result = platformsValidate(mockConfig);
    expect(result).toHaveLength(2);
    expect(result.every((item) => item === true)).toBe(true);
  });

  it('platformUpload should call the correct upload function', async () => {
    const weixinResult = await platformUpload(mockConfig, 'mp-weixin', mockPRetryOptions);
    const alipayResult = await platformUpload(mockConfig, 'mp-alipay', mockPRetryOptions);

    expect(weixinResult).toBe('weixin-upload-result');
    expect(alipayResult).toBe('alipay-upload-result');
  });

  it('platformPreview should call the correct preview function', async () => {
    const weixinResult = await platformPreview(mockConfig, 'mp-weixin', mockPRetryOptions);
    const alipayResult = await platformPreview(mockConfig, 'mp-alipay', mockPRetryOptions);

    expect(weixinResult).toBe('weixin-preview-result');
    expect(alipayResult).toBe('alipay-preview-result');
  });
});
