import { existsSync } from 'node:fs';
import ci from 'miniprogram-ci';
const { Project } = ci;
import pRetry from 'p-retry';
import { logger } from '../utils.js';
import type { PRetryOptions, UniDeployConfig } from '../types.js';

type WechatCreateProjectOptions = ConstructorParameters<typeof Project>[0];
type WechatUploadOptions = any;
interface WechatUploadResult {
  devPluginId?: string;
  pluginInfo?: { pluginProviderAppid: string; size: number; version: string; }[];
  strUint64Version?: string;
  subPackageInfo?: { name: string; size: number }[];
}

export const mpWeixinValidate = (config: UniDeployConfig) => {
  let isValid = true;
  /* appid */
  const appid = config['mp-weixin']?.appid;
  if (!appid) {
    logger.warn('【微信小程序】缺少 appid');
    isValid = false;
  }
  /* projectPath */
  const projectPath = config?.['mp-weixin']?.projectPath;
  if (!projectPath) {
    logger.warn('【微信小程序】缺少 projectPath');
    isValid = false;
  }
  /* privateKey & privateKeyPath */
  const privateKey = config?.['mp-weixin']?.privateKey;
  const privateKeyPath = config?.['mp-weixin']?.privateKeyPath;
  if (!privateKey && !privateKeyPath) {
    logger.warn('【微信小程序】缺少 privateKey');
    isValid = false;
  }
  if (!privateKey && privateKeyPath && !existsSync(privateKeyPath)) {
    logger.warn('【微信小程序】privateKeyPath 没有对应文件');
    isValid = false;
  }
  /* version */
  const version = config?.['mp-weixin']?.version;
  if (!version) {
    logger.warn('【微信小程序】缺少 version');
    isValid = false;
  }
  return isValid;
};

export const mpWeixinGetProject = (config: UniDeployConfig) =>
  new Project({
    ...config?.['mp-weixin'],
  } as WechatCreateProjectOptions);

export const mpWeixinUpload = async (config: UniDeployConfig, pRetryOptions?: PRetryOptions) =>
  pRetry(
    () =>
      ci.upload({
        ...config?.['mp-weixin'],
        onProgressUpdate: config?.['mp-weixin']?.onProgressUpdate ?? ((task) => {
          if (typeof task === 'string') {
            logger.debug(`【微信小程序】${task}`);
          } else {
            logger.debug(`【微信小程序】${task.message} (${task.status})`);
          }
        }),
        project: mpWeixinGetProject(config),
      } as WechatUploadOptions),
    pRetryOptions,
  ) as Promise<WechatUploadResult>;

export const mpWeixinPreview = async (config: UniDeployConfig, pRetryOptions?: PRetryOptions): Promise<any> =>
  pRetry(
    () =>
      ci.preview({
        ...config?.['mp-weixin'],
        onProgressUpdate: config?.['mp-weixin']?.onProgressUpdate ?? ((task) => {
          if (typeof task === 'string') {
            logger.debug(`【微信小程序】${task}`);
          } else {
            logger.debug(`【微信小程序】${task.message} (${task.status})`);
          }
        }),
        project: mpWeixinGetProject(config),
      } as WechatUploadOptions & { test?: true }),
    pRetryOptions,
  );
