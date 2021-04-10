import { Config } from './src/config';

console.log(Config.getInstance().getConfig().orm);

export default Config.getInstance().getConfig().orm;
