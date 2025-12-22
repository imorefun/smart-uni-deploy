import { dingtalkNotifyPreview, dingtalkNotifyUpload, dingtalkValidate } from './dingtalk';
import { wecomNotifyPreview, wecomNotifyUpload, wecomValidate } from './wecom';
import type {
  Im,
  ImNotifyPreview,
  ImNotifyPreviewMap,
  ImNotifyUpload,
  ImNotifyUploadMap,
  ImValidate,
  ImValidateMap,
  UniDeployConfig,
} from '../types';

export * from './dingtalk';
export * from './wecom';

export const ims: Im[] = ['dingtalk', 'wecom'];

export const imValidateMap: ImValidateMap = {
  dingtalk: dingtalkValidate,
  wecom: wecomValidate,
};

export const imNotifyUploadMap: ImNotifyUploadMap = {
  dingtalk: dingtalkNotifyUpload,
  wecom: wecomNotifyUpload,
};

export const imNotifyPreviewMap: ImNotifyPreviewMap = {
  dingtalk: dingtalkNotifyPreview,
  wecom: wecomNotifyPreview,
};

export const imValidate: ImValidate = (config: UniDeployConfig, im: Im) =>
  imValidateMap[im](config);

export const imsValidate = (config: UniDeployConfig) => ims.map((im) => imValidate(config, im));

export const imNotifyUpload: ImNotifyUpload = (config, im, platform, result, buildGotOptions) =>
  imNotifyUploadMap[im](
    config,
    platform,
    result,
    buildGotOptions ? (c, p, r) => buildGotOptions(c, im, p, r) : undefined,
  );

export const imNotifyPreview: ImNotifyPreview = (config, im, platform, result, buildGotOptions) => {
  return imNotifyPreviewMap[im](
    config,
    platform,
    result,
    buildGotOptions ? (c, p, r) => buildGotOptions(c, im, p, r) : undefined,
  );
};
