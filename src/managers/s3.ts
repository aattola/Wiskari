import S3 from 'scw-object-storage';
import fs from 'fs';
import path from 'path';
import { Message } from 'discord.js';
import got from 'got';
import { createHash } from 'crypto';

const s3 = new S3(process.env.s3AccessKey, process.env.s3SecretKey, 'nl-ams');

class S3Client {
  getFiles(): void {
    s3.getBucket('kuvakanta').then((res) => {
      console.log((res.ListBucketResult as any).Contents);
    });
  }

  handleMessage(message: Message): void {
    if (message.attachments.size <= 0) return;

    message.attachments.forEach(async (attachment) => {
      const fileName = attachment.name;
      const fileUrl = attachment.url;

      await this.getFile(fileUrl, fileName);
      await this.uploadToS3(fileName, message.author.id);
      await this.deleteFile(fileName);
    });
  }

  private getFile(url: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      got.stream
        .get(url)
        .pipe(fs.createWriteStream(path.resolve(__dirname, name)))
        .on('finish', () => {
          resolve();
        })
        .on('error', () => {
          reject();
        });
    });
  }

  private async uploadToS3(name: string, id: string): Promise<void> {
    try {
      const bucket = 'kuvakanta';
      const file = await fs.promises.readFile(path.resolve(__dirname, name));

      const fileHash = createHash('sha256').update(file).digest('hex');
      const uploadName = `${fileHash}_${id}_${name}`;
      const ress = await s3.putObject(
        bucket,
        `/roskaa/${uploadName}`,
        file,
        undefined,
        undefined,
        undefined,
        { 'x-amz-acl': 'public-read' }
      );
    } catch (ex) {
      console.log(ex);
    }
  }

  private deleteFile(name: string): Promise<void> {
    return fs.promises.unlink(path.resolve(__dirname, name));
  }
}

export { S3Client };
