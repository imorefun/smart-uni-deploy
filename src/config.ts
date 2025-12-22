import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { loadConfig as _loadConfig } from 'unconfig';
import { getFileDir, getFileField, getVersionField } from './utils';
import type { MiniProgramCI as Wechat } from 'miniprogram-ci/dist/@types/types';
import type { UniDeployConfig, UniDeployUserConfig } from './types';

export const defaultConfig: UniDeployConfig = {
  cwd: process.cwd(),
};

export const defineConfig = (config: UniDeployUserConfig) => config;

export const loadEnvConfig = (loadEnvFile = true) => {
  // 尝试加载环境变量文件，但忽略错误
  if (loadEnvFile) {
    try {
      dotenvExpand.expand(dotenv.config({ path: 'env/.env' }));
    } catch (error) {
      // 忽略错误，继续执行
    }
  }
  const envConfig = {
    dingtalk: {
      webhook: process.env.DINGTALK_WEBHOOK,
    },
    'mp-alipay': {
      privateKey: process.env.MP_ALIPAY_PRIVATE_KEY,
      toolId: process.env.MP_ALIPAY_TOOL_ID,
    },
    'mp-weixin': {
      privateKey: process.env.MP_WEIXIN_PRIVATE_KEY,
      privateKeyPath: process.env.MP_WEIXIN_PRIVATE_KEY_PATH,
    },
    wecom: {
      webhook: process.env.WECOM_WEBHOOK,
    },
  };
  return structuredClone(envConfig) as UniDeployUserConfig;
};

export const loadConfig = async (inlineConfig: UniDeployUserConfig = {}, cwd = process.cwd()) => {
  const envConfig = loadEnvConfig();
  const { config: loadedConfig = {} } = await _loadConfig<UniDeployUserConfig>({
    cwd,
    merge: true,
    sources: [{
      extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs'],
      files: 'uni-deploy.config',
    }],
  });

  // 提取im配置
  const loadedImConfig = loadedConfig.im ?? {};
  const inlineImConfig = inlineConfig.im ?? {};

  // 合并钉钉配置：envConfig.dingtalk -> loadedConfig.dingtalk -> loadedConfig.im.dingtalk -> inlineConfig.dingtalk -> inlineConfig.im.dingtalk
  const mergedDingtalkConfig = {
    ...envConfig.dingtalk,
    ...loadedConfig.dingtalk,
    ...loadedImConfig.dingtalk,
    ...inlineConfig.dingtalk,
    ...inlineImConfig.dingtalk,
  };

  // 合并企业微信配置：envConfig.wecom -> loadedConfig.wecom -> loadedConfig.im.wecom -> inlineConfig.wecom -> inlineConfig.im.wecom
  const mergedWecomConfig = {
    ...envConfig.wecom,
    ...loadedConfig.wecom,
    ...loadedImConfig.wecom,
    ...inlineConfig.wecom,
    ...inlineImConfig.wecom,
  };

  const resolved: UniDeployConfig = {
    ...defaultConfig,
    ...envConfig,
    ...loadedConfig,
    ...inlineConfig,
    // 合并后的配置
    dingtalk: mergedDingtalkConfig,
    wecom: mergedWecomConfig,
    // 确保im属性也包含合并后的配置
    im: {
      dingtalk: mergedDingtalkConfig,
      wecom: mergedWecomConfig,
    },
    'mp-alipay': {
      appid: getFileField(
        [
          { entry: ['dist', 'mp-alipay', 'mini.project.json'], prop: 'appid' },
          { entry: ['dist', 'build', 'mp-alipay', 'mini.project.json'], prop: 'appid' },
          { entry: ['dist', '**', 'mp-alipay', 'mini.project.json'], prop: 'appid' },
          { entry: ['src', 'mini.project.json'], prop: 'appid' },
          { entry: ['**', 'mini.project.json'], prop: 'appid' },
          { entry: ['src', 'manifest.json'], prop: ['mp-alipay', 'appid'] },
          { entry: ['**', 'manifest.json'], prop: ['mp-alipay', 'appid'] },
        ],
        cwd,
      ) as string,
      appxv: 'v2',
      projectPath: getFileDir(
        [
          { entry: ['dist', 'mp-alipay', 'mini.project.json'] },
          { entry: ['dist', 'build', 'mp-alipay', 'mini.project.json'] },
          { entry: ['dist', '**', 'mp-alipay', 'mini.project.json'] },
          { entry: ['mp-alipay', 'mini.project.json'] },
          { entry: ['**', 'mini.project.json'] },
        ],
        cwd,
      ),
      version: getVersionField(cwd),
      ...envConfig['mp-alipay'],
      ...loadedConfig['mp-alipay'],
      ...inlineConfig['mp-alipay'],
    },
    'mp-weixin': {
      appid: getFileField(
        [
          { entry: ['dist', 'mp-weixin', 'project.config.json'], prop: 'appid' },
          { entry: ['dist', 'build', 'mp-weixin', 'project.config.json'], prop: 'appid' },
          { entry: ['dist', '**', 'mp-weixin', 'project.config.json'], prop: 'appid' },
          { entry: ['src', 'project.config.json'], prop: 'appid' },
          { entry: ['**', 'project.config.json'], prop: 'appid' },
          { entry: ['src', 'manifest.json'], prop: ['mp-weixin', 'appid'] },
          { entry: ['**', 'manifest.json'], prop: ['mp-weixin', 'appid'] },
        ],
        cwd,
      ) as string | undefined,
      desc: 'Handled by uni-deploy',
      projectPath: getFileDir(
        [
          { entry: ['dist', 'mp-weixin', 'project.config.json'] },
          { entry: ['dist', 'build', 'mp-weixin', 'project.config.json'] },
          { entry: ['dist', '**', 'mp-weixin', 'project.config.json'] },
          { entry: ['mp-weixin', 'project.config.json'] },
          { entry: ['**', 'project.config.json'] },
        ],
        cwd,
      ),
      qrcodeFormat: 'image',
      qrcodeOutputDest: 'qrcode.png',
      setting: getFileField([
        { entry: ['dist', 'mp-weixin', 'project.config.json'], prop: ['setting'] },
        { entry: ['dist', 'build', 'mp-weixin', 'project.config.json'], prop: ['setting'] },
        { entry: ['dist', '**', 'mp-weixin', 'project.config.json'], prop: ['setting'] },
      ]) as Wechat.ICompileSettings | undefined,
      type: 'miniProgram',
      version: getVersionField(cwd),
      ...envConfig['mp-weixin'],
      ...loadedConfig['mp-weixin'],
      ...inlineConfig['mp-weixin'],
    },
  };

  return structuredClone(resolved);
};
