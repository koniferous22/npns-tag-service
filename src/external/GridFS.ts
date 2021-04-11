import mongo, { Db } from 'mongodb';
import Grid from 'gridfs-stream';
import { FileUpload } from 'graphql-upload';

export class GridFS {
  gridFs: ReturnType<typeof Grid>;
  constructor(db: Db) {
    this.gridFs = Grid(db, mongo);
  }

  async fileUpload({ createReadStream, filename, mimetype }: FileUpload) {
    const stream = createReadStream();
    await new Promise((resolve, reject) => {
      const writeStream = this.gridFs.createWriteStream();
      writeStream.on('finish', resolve);
      writeStream.on('error', (error) => {
        reject(error);
        // TODO test this case whether some form of cleanup is needed
        // unlink(path, () => {
        //   reject(error);
        // });
      });
      stream.pipe(writeStream);
    });
    return {
      filename,
      mimetype
    };
  }
}
