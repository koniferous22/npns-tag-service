import { Db, MongoClient } from 'mongodb';
import { Config } from '../config';

const buildMongoConnectionString = ({
  username,
  password,
  port,
  host,
  database
}: ReturnType<Config['getConfig']>['content']['mongo']) =>
  `mongodb://${username}:${password}@${host}:${port}/${database}`;

export function gridFsConnectMongodb(
  gridFsMongoConfig: ReturnType<Config['getConfig']>['content']['mongo']
): Promise<Db> {
  const url = buildMongoConnectionString(gridFsMongoConfig);
  const dbName = gridFsMongoConfig.database;
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client.connect((error) =>
      error ? reject(error) : resolve(client.db(dbName))
    );
  });
}
