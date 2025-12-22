import pRetry from 'p-retry';
import execa from 'execa';
import { logger } from '../utils.js';
import type { PRetryOptions, UniDeployConfig } from '../types.js';

// 直接使用minidev命令，让系统自动找到正确的路径

export const mpAlipayValidate = (config: UniDeployConfig) => {
  let isValid = true;
  /* appid */
  const appid = config['mp-alipay']?.appid;
  if (!appid) {
    logger.warn('【支付宝小程序】缺少 appid');
    isValid = false;
  }
  /* projectPath */
  const projectPath = config?.['mp-alipay']?.projectPath;
  if (!projectPath) {
    logger.warn('【支付宝小程序】缺少 projectPath');
    isValid = false;
  }
  /* privateKey */
  const privateKey = config?.['mp-alipay']?.privateKey;
  if (!privateKey) {
    logger.warn('【支付宝小程序】缺少 privateKey');
    isValid = false;
  }
  /* toolId */
  const toolId = config?.['mp-alipay']?.toolId;
  if (!toolId) {
    logger.warn('【支付宝小程序】缺少 toolId');
    isValid = false;
  }
  /* version */
  const version = config?.['mp-alipay']?.version;
  if (!version) {
    logger.warn('【支付宝小程序】缺少 version');
    isValid = false;
  }
  return isValid;
};

export const mpAlipayGetProject = (config: UniDeployConfig) => {
  return {
    config: {
      defaults: {
        'alipay.authentication.privateKey': config?.['mp-alipay']?.privateKey,
        'alipay.authentication.toolId': config?.['mp-alipay']?.toolId,
      },
    },
  };
};

export const mpAlipayUpload = async (config: UniDeployConfig, pRetryOptions?: PRetryOptions) => {
  // 直接调用minidev的CLI命令来执行上传
  const { appid, projectPath, version } = config['mp-alipay'] ?? {};

  return pRetry(async () => {
    // 构建minidev上传命令，只使用必要的参数
    const command = `npx minidev upload --app-id ${appid} --project "${projectPath}" --version ${version} --desc "Handled by uni-deploy"`;

    // 执行命令，使用shell:true来让系统处理命令查找
    const result = await execa(command, { shell: true, stdio: 'inherit' });
    return result;
  }, pRetryOptions);
};

export const mpAlipayPreview = async (config: UniDeployConfig, pRetryOptions?: PRetryOptions) => {
  // 直接调用minidev的CLI命令来执行预览
  const { appid, projectPath } = config['mp-alipay'] ?? {};

  return pRetry(async () => {
    // 构建minidev预览命令，只使用必要的参数
    const command = `npx minidev preview --app-id ${appid} --project "${projectPath}"`;

    // 执行命令，使用shell:true来让系统处理命令查找
    const result = await execa(command, { shell: true, stdio: 'inherit' });
    return result;
  }, pRetryOptions);
};
