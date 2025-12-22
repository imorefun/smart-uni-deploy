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

export const wecomValidate = (config: UniDeployConfig) => {
  let isValid = true;
  /* webhook */
  // 优先从 config.im.wecom 获取配置，保持向后兼容
  const wecomConfig = config?.im?.wecom || config?.wecom;
  const webhook = wecomConfig?.webhook;
  if (!webhook || (Array.isArray(webhook) && webhook.length === 0)) {
    logger.warn('【企业微信】缺少 webhook');
    isValid = false;
  }
  return isValid;
};

export const wecomNotifyUpload = async (
  config: UniDeployConfig,
  platform: Platform,
  result: any | Promise<any>,
  buildGotOptions?: SpecificImNotifyUploadBuildGotOptions,
) => {
  // 优先从 config.im.wecom 获取配置，保持向后兼容
  const wecomConfig = config?.im?.wecom || config?.wecom;
  const webhook = wecomConfig?.webhook!;
  const res = await result;
  const gotOptions: GotOptions = {
    json: {
      msgtype: 'markdown',
      markdown: {
        content: `${platformMap[platform]}上传完毕。<br/><br/>原始响应：${res}`,
      },
    },
    method: 'POST',
    throwHttpErrors: true,
    ...buildGotOptions?.(config, platform, result),
  };

  const sendRequest = async (webhookUrl: string) => {
    logger.debug(`【企业微信】发送请求到: ${webhookUrl}`);
    logger.debug(`【企业微信】请求内容: ${JSON.stringify(gotOptions.json)}`);

    const response = await got(webhookUrl, gotOptions);
    logger.debug(`【企业微信】响应状态码: ${response.statusCode}`);
    logger.debug(`【企业微信】响应内容: ${response.body}`);

    // 检查响应内容
    const responseBody = JSON.parse(response.body);
    if (responseBody.errcode !== 0) {
      throw new Error(`企业微信通知发送失败: ${responseBody.errmsg} (errcode: ${responseBody.errcode})`);
    }

    return response;
  };

  return Array.isArray(webhook)
    ? Promise.all(webhook.map((w) => sendRequest(w)))
    : sendRequest(webhook);
};

export const wecomNotifyPreview = async (
  config: UniDeployConfig,
  platform: Platform,
  result: any | Promise<any>,
  buildGotOptions?: SpecificImNotifyPreviewBuildGotOptions,
) => {
  // 优先从 config.im.wecom 获取配置，保持向后兼容
  const wecomConfig = config?.im?.wecom || config?.wecom;
  const webhook = wecomConfig?.webhook!;
  const res = await result;
  const gotOptions: GotOptions = {
    json: {
      msgtype: 'markdown',
      markdown: {
        content: `${platformMap[platform]}预览完毕。<br/><br/>原始响应：${res}`,
      },
    },
    method: 'POST',
    throwHttpErrors: true,
    ...buildGotOptions?.(config, platform, result),
  };

  const sendRequest = async (webhookUrl: string) => {
    logger.debug(`【企业微信】发送请求到: ${webhookUrl}`);
    logger.debug(`【企业微信】请求内容: ${JSON.stringify(gotOptions.json)}`);

    const response = await got(webhookUrl, gotOptions);
    logger.debug(`【企业微信】响应状态码: ${response.statusCode}`);
    logger.debug(`【企业微信】响应内容: ${response.body}`);

    // 检查响应内容
    const responseBody = JSON.parse(response.body);
    if (responseBody.errcode !== 0) {
      throw new Error(`企业微信通知发送失败: ${responseBody.errmsg} (errcode: ${responseBody.errcode})`);
    }

    return response;
  };

  return Array.isArray(webhook)
    ? Promise.all(webhook.map((w) => sendRequest(w)))
    : sendRequest(webhook);
};
