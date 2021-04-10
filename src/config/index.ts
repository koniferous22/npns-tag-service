import path from 'path';
import { ComposedConfigError, ConfigError } from '../utils/exceptions';
import {
  resolveConfigNode,
  GetConfigValueByKeyString,
  ResolveConfigAstNode,
  ConfigAstNode
} from './utils/generics';
import { getEndpoint, getEnum, getNumber } from './utils/transformers';

const configWithParser = {
  type: 'node' as const,
  children: {
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
    },
    orm: {
      type: 'node' as const,
      children: {
        type: {
          type: 'leaf' as const,
          originalValue: process.env.CHALLENGE_DB_TYPE,
          transform: getEnum(['postgres']),
          overridenValue: null as null | string
        },
        host: {
          type: 'leaf' as const,
          originalValue: process.env.CHALLENGE_DB_HOST,
          overridenValue: null as null | string
        },
        port: {
          type: 'leaf' as const,
          originalValue: process.env.CHALLENGE_DB_PORT,
          transform: getNumber,
          overridenValue: null as null | string
        },
        username: {
          type: 'leaf' as const,
          originalValue: process.env.CHALLENGE_DB_USERNAME,
          overridenValue: null as null | string
        },
        password: {
          type: 'leaf' as const,
          originalValue: process.env.CHALLENGE_DB_PASSWORD,
          overridenValue: null as null | string
        },
        database: {
          type: 'leaf' as const,
          originalValue: process.env.CHALLENGE_DB_DATABASE,
          overridenValue: null as null | string
        },
        migrations: {
          type: 'leaf' as const,
          originalValue: [path.join(__dirname, '../migrations/**/*.ts')],
          overridenValue: null as null | string
        },
        entities: {
          type: 'leaf' as const,
          originalValue: [path.join(__dirname, '../entities/**/*.ts')],
          overridenValue: null as null | string
        },
        cli: {
          type: 'node' as const,
          children: {
            migrationsDir: {
              type: 'leaf' as const,
              originalValue: 'src/migrations',
              overridenValue: null as null | string
            },
            entitiesDir: {
              type: 'leaf' as const,
              originalValue: 'src/entities',
              overridenValue: null as null | string
            }
          }
        }
      }
    },
    content: {
      type: 'node' as const,
      children: {
        mongoose: {
          type: 'node' as const,
          children: {
            host: {
              type: 'leaf' as const,
              originalValue: process.env.CONTENT_DB_HOST,
              overridenValue: null as null | string
            },
            port: {
              type: 'leaf' as const,
              originalValue: process.env.CONTENT_DB_PORT,
              transform: getNumber,
              overridenValue: null as null | string
            },
            username: {
              type: 'leaf' as const,
              originalValue: process.env.CONTENT_DB_USERNAME,
              overridenValue: null as null | string
            },
            password: {
              type: 'leaf' as const,
              originalValue: process.env.CONTENT_DB_PASSWORD,
              overridenValue: null as null | string
            },
            database: {
              type: 'leaf' as const,
              originalValue: process.env.CONTENT_DB_DATABASE,
              overridenValue: null as null | string
            }
          }
        },
        gridFs: {
          type: 'node' as const,
          children: {
            maxFiles: {
              type: 'leaf' as const,
              originalValue: process.env.GRID_FS_MAX_FILES,
              transform: getNumber,
              overridenValue: null as null | string
            },
            maxFileSize: {
              type: 'leaf' as const,
              originalValue: process.env.GRID_FS_MAX_FILE_SIZE,
              transform: getNumber,
              overridenValue: null as null | string
            }
          }
        },
        limits: {
          type: 'node' as const,
          children: {
            contentUploads: {
              type: 'leaf' as const,
              originalValue: process.env.LIMIT_CONTENT_UPLOADS,
              transform: getNumber,
              overridenValue: null as null | string
            },
            editCount: {
              type: 'leaf' as const,
              originalValue: process.env.LIMIT_EDIT_COUNT,
              transform: getNumber,
              overridenValue: null as null | string
            }
          }
        }
      }
    }
  }
};

export type ResolvedConfigType = ResolveConfigAstNode<typeof configWithParser>;

// TODO exceptions file/dir, as soon as more valid cases here
export class Config {
  private _value: ResolvedConfigType;
  private _settingsChanged: boolean;

  private static _instance: Config | null;
  private resolveConfig() {
    const { config, errors } = resolveConfigNode(configWithParser);
    if (errors.length > 0) {
      throw new ComposedConfigError(errors);
    }
    return config;
  }

  private constructor() {
    this._value = this.resolveConfig();
    this._settingsChanged = false;
  }

  getConfig() {
    if (this._settingsChanged) {
      this._value = this.resolveConfig();
      this._settingsChanged = false;
    }
    return this._value;
  }

  override<KeyString extends string>(
    keyString: KeyString,
    newValue: GetConfigValueByKeyString<KeyString, typeof configWithParser>
  ) {
    const keys = keyString.split('.');
    let current: ConfigAstNode = configWithParser;
    keys.forEach((key) => {
      switch (current.type) {
        case 'node': {
          current = current.children[key];
          break;
        }
        case 'array': {
          const index = parseInt(key, 10);
          current = current.values[index];
          break;
        }
        case 'leaf': {
          throw new ConfigError(`Key string "${keyString}" out of range`);
        }
        default: {
          throw new ConfigError(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            `Encountered invalid node type: "${current && current!.type}"`
          );
        }
      }
    });
    if (!['leaf'].includes(current.type)) {
      throw new ConfigError(
        `Configuration key '${keyString}' references object and not leaf value`
      );
    }
    // @ts-expect-error Wrong ts inferring because of for-each
    current.overridenValue = newValue.toString();
    this._settingsChanged = true;
  }

  public static getInstance() {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }
}
