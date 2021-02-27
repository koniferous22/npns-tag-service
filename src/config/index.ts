import {
  resolveConfigEntry,
  GetConfigValueByKeyString,
  ConfigEntryType,
  ResolveConfigType,
  GetObjectValues
} from './utils/generics';
import { getEndpoint, getNumber } from './utils/transformers';

const configWithParser = {
  port: {
    type: 'leaf' as const,
    originalValue: process.env.PORT,
    transform: getNumber,
    overridenValue: null as null | string
  },
  graphqlPath: {
    type: 'leaf' as const,
    originalValue: process.env.GRAPHQL_PATH,
    transform: getEndpoint,
    overridenValue: null as null | string
  }
};

export type ConfigType = ResolveConfigType<typeof configWithParser>;

const resolveConfig: () => ConfigType = () =>
  resolveConfigEntry(configWithParser);

let config = resolveConfig();
let settingsChanged = false;

export const getConfig = () => {
  if (settingsChanged) {
    config = resolveConfig();
    settingsChanged = false;
  }
  return config;
};

// TODO promisify
export function overrideConfig<KeyString extends string>(
  keyString: KeyString,
  newValue: GetConfigValueByKeyString<KeyString, typeof configWithParser>,
  cb?: () => void
) {
  const keys = keyString.split('.');
  let current: GetObjectValues<ConfigEntryType> = {
    type: 'node',
    children: configWithParser
  };
  keys.forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(key in current) || !(('children' in (current as any)[key]) as any)) {
      throw new Error(`Configuration key '${keyString}' does not exist`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current = (current as any)[key].children;
  });
  if (!['leaf'].includes(current.type)) {
    throw new Error(
      `Configuration key '${keyString}' references object and not leaf value`
    );
  }
  // @ts-expect-error Wrong ts inferring because of for-each
  current.overridenValue = newValue;
  settingsChanged = true;
  if (cb) {
    cb();
  }
}
