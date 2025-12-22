import got from 'got';
import { platformMap } from '../platform';
import { logger } from '../utils';
import type {
  GotOptions,
  Platform,
  SpecificImNotifyPreviewBuildGotOptions,
  SpecificImNotifyUploadBuildGotOptions,
  UniDeployConfig,
} from '../types';

export const dingtalkValidate = (config: UniDeployConfig) => {
  let isValid = true;
  /* webhook */
  // 优先从 config.im.dingtalk 获取配置，保持向后兼容
  const dingtalkConfig = config?.im?.dingtalk || config?.dingtalk;
  const webhook = dingtalkConfig?.webhook;
  if (!webhook || (Array.isArray(webhook) && webhook.length === 0)) {
    logger.warn('【钉钉】缺少 webhook');
    isValid = false;
  }
  return isValid;
};

export const dingtalkNotifyUpload = async (
  config: UniDeployConfig,
  platform: Platform,
  result: any | Promise<any>,
  buildGotOptions?: SpecificImNotifyUploadBuildGotOptions,
) => {
  // 优先从 config.im.dingtalk 获取配置，保持向后兼容
  const dingtalkConfig = config?.im?.dingtalk || config?.dingtalk;
  const webhook = dingtalkConfig?.webhook!;
  const res = await result;
  const gotOptions: GotOptions = {
    json: {
      msgtype: 'markdown',
      text: {
        content: `${platformMap[platform]}上传完毕。<br/><br/>原始响应：${res}`,
      },
    },
    method: 'POST',
    ...buildGotOptions?.(config, platform, result),
  };
  return Array.isArray(webhook)
    ? Promise.all(webhook.map((w) => got(w, gotOptions)))
    : got(webhook, gotOptions);
};

export const dingtalkNotifyPreview = async (
  config: UniDeployConfig,
  platform: Platform,
  result: any | Promise<any>,
  buildGotOptions?: SpecificImNotifyPreviewBuildGotOptions,
) => {
  // 优先从 config.im.dingtalk 获取配置，保持向后兼容
  const dingtalkConfig = config?.im?.dingtalk || config?.dingtalk;
  const webhook = dingtalkConfig?.webhook!;
  const res = await result;
  const gotOptions: GotOptions = {
    json: {
      msgtype: 'markdown',
      text: {
        content: `${platformMap[platform]}预览完毕。<br/><br/>原始响应：${res}`,
      },
    },
    method: 'POST',
    ...buildGotOptions?.(config, platform, result),
  };
  return Array.isArray(webhook)
    ? Promise.all(webhook.map((w) => got(w, gotOptions)))
    : got(webhook, gotOptions);
};
