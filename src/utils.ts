import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { globbySync } from 'globby';
import { get } from 'lodash-es';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import stripJsonComments from 'strip-json-comments';

const pinoPrettyStream = pinoPretty({
  colorize: true,
  ignore: 'pid,hostname',
  translateTime: 'SYS:standard',
});

// 创建支持日志级别控制的 logger，默认日志级别为 info
export const logger = pino({
  customLevels: {
    error: 50,
    success: 35,
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  level: 'info',
}, pinoPrettyStream);

// 扩展 logger 方法，添加 success 方法
logger.success = (msg: string, ...args: any[]) => {
  logger.info(msg, ...args);
};

const globbyIgnore = ['**/node_modules', '**/dist', '**/.hbuilder', '**/.hbuilderx'];

export const getFileField = (
  filters: { entry: string | string[]; prop: string | string[] }[],
  cwd = process.cwd(),
): boolean | number | string | any[] | Record<string, any> | undefined => {
  const entries = globbySync(
    filters.map((f) => (Array.isArray(f.entry) ? resolve(cwd, ...f.entry) : resolve(cwd, f.entry))),
    { ignore: globbyIgnore },
  );
  for (const [index, entry] of entries.entries()) {
    try {
      const content = JSON.parse(stripJsonComments(readFileSync(entry, 'utf8')));
      const field = get(content, filters[index].prop);
      if (field != null) return field;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export const getFilePath = (filters: { entry: string | string[] }[], cwd = process.cwd()) => {
  const entries = globbySync(
    filters.map((f) => (Array.isArray(f.entry) ? resolve(cwd, ...f.entry) : resolve(cwd, f.entry))),
    { ignore: globbyIgnore },
  );
  return entries[0] ?? undefined;
};

export const getFileDir = (filters: { entry: string | string[] }[], cwd = process.cwd()) => {
  const entries = globbySync(
    filters.map((f) => (Array.isArray(f.entry) ? resolve(cwd, ...f.entry) : resolve(cwd, f.entry))),
    { ignore: globbyIgnore },
  );
  return entries[0] ? resolve(entries[0], '..') : undefined;
};

export const getVersionField = (cwd = process.cwd()) =>
  getFileField(
    [
      { entry: 'package.json', prop: 'version' },
      { entry: ['src', 'manifest.json'], prop: ['versionName'] },
      { entry: ['**', 'manifest.json'], prop: ['versionName'] },
    ],
    cwd,
  ) as string | undefined;
