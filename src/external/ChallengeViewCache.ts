import { randomBytes } from 'crypto';
import { Tedis } from 'tedis';
import { Config } from '../config';

export class ViewCacheService {
  private _config: Config = Config.getInstance();
  private _cache: Tedis;

  private initializeCache() {
    return new Tedis(this._config.getConfig().challengeView.cache);
  }
  constructor() {
    this._cache = this.initializeCache();
  }

  getCache() {
    return this._cache;
  }

  async viewChallenge(ipAdress: string, challengeId: string) {
    const key = `${ipAdress}_${challengeId}`;
    const exists = await this._cache.exists(key);
    if (exists) {
      return false;
    }

    await this._cache.set(key, randomBytes(8).toString('hex'));
    return true;
  }
}
