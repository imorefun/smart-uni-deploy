import { mpAlipayPreview, mpAlipayUpload, mpAlipayValidate } from './mp-alipay';
import { mpWeixinPreview, mpWeixinUpload, mpWeixinValidate } from './mp-weixin';
import type {
  Platform,
  PlatformPreview,
  PlatformPreviewMap,
  PlatformTextMap,
  PlatformUpload,
  PlatformUploadMap,
  PlatformValidate,
  PlatformValidateMap,
  PRetryOptions,
  UniDeployConfig,
} from '../types';

export * from './mp-alipay';
export * from './mp-weixin';

export const platforms: Platform[] = ['mp-weixin', 'mp-alipay'];

export const platformMap: PlatformTextMap = {
  'mp-alipay': '支付宝小程序',
  'mp-weixin': '微信小程序',
};

export const platformValidateMap: PlatformValidateMap = {
  'mp-alipay': mpAlipayValidate,
  'mp-weixin': mpWeixinValidate,
};

export const platformUploadMap: PlatformUploadMap = {
  'mp-alipay': mpAlipayUpload,
  'mp-weixin': mpWeixinUpload,
};

export const platformPreviewMap: PlatformPreviewMap = {
  'mp-alipay': mpAlipayPreview,
  'mp-weixin': mpWeixinPreview,
};

export const platformValidate: PlatformValidate = (config: UniDeployConfig, platform: Platform) =>
  platformValidateMap[platform](config);

export const platformsValidate = (config: UniDeployConfig) =>
  platforms.map((platform) => platformValidate(config, platform));

export const platformUpload: PlatformUpload = (
  config: UniDeployConfig,
  platform: Platform,
  pRetryOptions?: PRetryOptions,
) => platformUploadMap[platform](config, pRetryOptions);

export const platformPreview: PlatformPreview = (
  config: UniDeployConfig,
  platform: Platform,
  pRetryOptions?: PRetryOptions,
) => platformPreviewMap[platform](config, pRetryOptions);
