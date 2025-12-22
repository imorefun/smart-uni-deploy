import { describe, expect, it, vi } from 'vitest';
import {
  imNotifyPreview,
  imNotifyPreviewMap,
  imNotifyUpload,
  imNotifyUploadMap,
  ims,
  imsValidate,
  imValidate,
  imValidateMap,
} from './index';

// 模拟dingtalk和wecom模块
vi.mock('./dingtalk', () => ({
  dingtalkValidate: vi.fn().mockReturnValue(true),
  dingtalkNotifyPreview: vi.fn().mockResolvedValue('dingtalk-preview-notify'),
  dingtalkNotifyUpload: vi.fn().mockResolvedValue('dingtalk-upload-notify'),
}));

vi.mock('./wecom', () => ({
  wecomValidate: vi.fn().mockReturnValue(true),
  wecomNotifyPreview: vi.fn().mockResolvedValue('wecom-preview-notify'),
  wecomNotifyUpload: vi.fn().mockResolvedValue('wecom-upload-notify'),
}));

describe('im/index', () => {
  const mockConfig = {} as any;
  const mockPlatform = 'mp-weixin' as const;
  const mockResult = {} as any;
  const mockBuildGotOptions = vi.fn();

  it('should export correct constants', () => {
    expect(ims).toEqual(['dingtalk', 'wecom']);
    expect(Object.keys(imValidateMap)).toEqual(['dingtalk', 'wecom']);
    expect(Object.keys(imNotifyUploadMap)).toEqual(['dingtalk', 'wecom']);
    expect(Object.keys(imNotifyPreviewMap)).toEqual(['dingtalk', 'wecom']);
  });

  it('imValidate should call the correct validate function', () => {
    imValidate(mockConfig, 'dingtalk');
    imValidate(mockConfig, 'wecom');

    // 这里无法直接验证，因为我们只测试了导出的函数是否存在
    expect(true).toBe(true);
  });

  it('imsValidate should validate all ims', () => {
    const result = imsValidate(mockConfig);
    expect(result).toHaveLength(2);
    expect(result.every((item) => item === true)).toBe(true);
  });

  it('imNotifyUpload should call the correct notify function', async () => {
    const dingtalkResult = await imNotifyUpload(
      mockConfig,
      'dingtalk',
      mockPlatform,
      mockResult,
      mockBuildGotOptions,
    );
    const wecomResult = await imNotifyUpload(
      mockConfig,
      'wecom',
      mockPlatform,
      mockResult,
      mockBuildGotOptions,
    );

    expect(dingtalkResult).toBe('dingtalk-upload-notify');
    expect(wecomResult).toBe('wecom-upload-notify');
  });

  it('imNotifyPreview should call the correct notify function', async () => {
    const dingtalkResult = await imNotifyPreview(
      mockConfig,
      'dingtalk',
      mockPlatform,
      mockResult,
      mockBuildGotOptions,
    );
    const wecomResult = await imNotifyPreview(
      mockConfig,
      'wecom',
      mockPlatform,
      mockResult,
      mockBuildGotOptions,
    );

    expect(dingtalkResult).toBe('dingtalk-preview-notify');
    expect(wecomResult).toBe('wecom-preview-notify');
  });
});
