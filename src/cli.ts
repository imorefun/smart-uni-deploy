import { Command } from 'commander';
import updateNotifier from 'update-notifier';
import pkg from '../package.json';
import { loadConfig } from './config';
import { imNotifyPreview, imNotifyUpload, imsValidate } from './im';
import { platformPreview, platformMap, platforms, platformsValidate, platformUpload } from './platform';
import { logger } from './utils';
import type { Im, Platform } from './types';

updateNotifier({ pkg }).notify();

const program = new Command(pkg.name).version(pkg.version).description(pkg.description);

program
  .command('validate')
  .description('检查配置文件')
  .action(async () => {
    const config = await loadConfig();
    platformsValidate(config);
    imsValidate(config);
  });

program
  .command('upload')
  .description('上传')
  .option('--retry <count>', '失败重试次数，范围1-99，默认3', parseInt)
  .option('--debug', '启用调试模式，显示详细日志')
  .action(async (options) => {
    const config = await loadConfig();
    // 验证retry参数
    let retryCount = options.retry || 3;
    retryCount = Math.max(1, Math.min(99, retryCount));

    // 设置调试模式
    const debugMode = Boolean(options.debug);
    if (debugMode) {
      logger.level = 'debug';
    }

    // 检查
    const validatePlatformsResults = platformsValidate(config);
    const validateImsResults = imsValidate(config);
    // 只处理配置正确的平台
    const validPlatforms = platforms.filter(
      (platform, index) => validatePlatformsResults[index] && config[platform],
    );

    // 串行上传，失败超过指定次数则跳过
    const uploadResults: any[] = [];
    const successPlatforms: Platform[] = [];
    const failedPlatforms: Platform[] = [];

    for (const platform of validPlatforms) {
      try {
        logger.info(`开始上传【${platformMap[platform]}】...`);
        const result = await platformUpload(config, platform, { retries: retryCount - 1 });
        uploadResults.push(result);
        successPlatforms.push(platform);
        logger.success(`【${platformMap[platform]}】上传成功`);
      } catch (error) {
        logger.error(`【${platformMap[platform]}】上传失败，已重试${retryCount}次，跳过该平台`);
        if (error instanceof Error) {
          logger.error(`错误信息: ${error.message}`);
        }
        uploadResults.push(null);
        failedPlatforms.push(platform);
        continue;
      }
    }

    // 只处理配置正确的 im
    // 检查是否有im配置，如果有则使用，否则使用根级别的配置
    const hasImConfig = config.im && Object.keys(config.im).length > 0;
    const ims = ['dingtalk', 'wecom'].filter(
      (im, index) => validateImsResults[index] && (hasImConfig ? config.im?.[im] : config[im]),
    ) as Im[];

    // 批量通知
    for (let i = 0; i < validPlatforms.length; i++) {
      if (uploadResults[i]) {
        try {
          await Promise.all(
            ims.map((im) => imNotifyUpload(config, im, validPlatforms[i], uploadResults[i])),
          );
        } catch (error) {
          logger.error(`通知【${platformMap[validPlatforms[i]]}】上传结果失败`);
          if (error instanceof Error) {
            logger.error(`错误信息: ${error.message}`);
          }
        }
      }
    }

    // 展示执行结果
    logger.info('\n=== 上传操作结果 ===');
    logger.info(`总平台数: ${validPlatforms.length}`);
    logger.success(`成功平台数: ${successPlatforms.length}`);
    if (successPlatforms.length > 0) {
      logger.info(`成功平台: ${successPlatforms.map(p => platformMap[p]).join(', ')}`);
    }
    logger.error(`失败平台数: ${failedPlatforms.length}`);
    if (failedPlatforms.length > 0) {
      logger.info(`失败平台: ${failedPlatforms.map(p => platformMap[p]).join(', ')}`);
    }
    logger.info('==================\n');

    // 结束
    logger.info('上传操作结束。');

    // 根据实际结果设置退出码
    if (failedPlatforms.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });

program
  .command('preview')
  .description('预览')
  .option('--retry <count>', '失败重试次数，范围1-99，默认3', parseInt)
  .option('--debug', '启用调试模式，显示详细日志')
  .action(async (options) => {
    const config = await loadConfig();
    // 验证retry参数
    let retryCount = options.retry || 3;
    retryCount = Math.max(1, Math.min(99, retryCount));

    // 设置调试模式
    const debugMode = Boolean(options.debug);
    if (debugMode) {
      logger.level = 'debug';
    }

    // 检查
    const validatePlatformsResults = platformsValidate(config);
    const validateImsResults = imsValidate(config);
    // 只处理配置正确的平台
    const validPlatforms = platforms.filter(
      (platform, index) => validatePlatformsResults[index] && config[platform],
    );

    // 串行预览，失败超过指定次数则跳过
    const previewResults: any[] = [];
    const successPlatforms: Platform[] = [];
    const failedPlatforms: Platform[] = [];

    for (const platform of validPlatforms) {
      try {
        logger.info(`开始预览【${platformMap[platform]}】...`);
        const result = await platformPreview(config, platform, { retries: retryCount - 1 });
        previewResults.push(result);
        successPlatforms.push(platform);
        logger.success(`【${platformMap[platform]}】预览成功`);
      } catch (error) {
        logger.error(`【${platformMap[platform]}】预览失败，已重试${retryCount}次，跳过该平台`);
        if (error instanceof Error) {
          logger.error(`错误信息: ${error.message}`);
        }
        previewResults.push(null);
        failedPlatforms.push(platform);
        continue;
      }
    }

    // 只处理配置正确的 im
    // 检查是否有im配置，如果有则使用，否则使用根级别的配置
    const hasImConfig = config.im && Object.keys(config.im).length > 0;
    const ims = ['dingtalk', 'wecom'].filter(
      (im, index) => validateImsResults[index] && (hasImConfig ? config.im?.[im] : config[im]),
    ) as Im[];

    // 批量通知
    for (let i = 0; i < validPlatforms.length; i++) {
      if (previewResults[i]) {
        try {
          await Promise.all(
            ims.map((im) => imNotifyPreview(config, im, validPlatforms[i], previewResults[i])),
          );
        } catch (error) {
          logger.error(`通知【${platformMap[validPlatforms[i]]}】预览结果失败`);
          if (error instanceof Error) {
            logger.error(`错误信息: ${error.message}`);
          }
        }
      }
    }

    // 展示执行结果
    logger.info('\n=== 预览操作结果 ===');
    logger.info(`总平台数: ${validPlatforms.length}`);
    logger.success(`成功平台数: ${successPlatforms.length}`);
    if (successPlatforms.length > 0) {
      logger.info(`成功平台: ${successPlatforms.map(p => platformMap[p]).join(', ')}`);
    }
    logger.error(`失败平台数: ${failedPlatforms.length}`);
    if (failedPlatforms.length > 0) {
      logger.info(`失败平台: ${failedPlatforms.map(p => platformMap[p]).join(', ')}`);
    }
    logger.info('==================\n');

    // 结束
    logger.info('预览操作结束。');

    // 根据实际结果设置退出码
    if (failedPlatforms.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });

await program.parseAsync();
