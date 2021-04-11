import { Config } from '../config';

export const getMaxUploads = () => {
  return Config.getInstance().getConfig().content.limits.contentUploads;
};

export const getMaxPostEdits = () => {
  return Config.getInstance().getConfig().content.limits.editCount;
};