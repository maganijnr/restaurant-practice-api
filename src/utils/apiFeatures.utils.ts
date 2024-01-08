import { JwtService } from '@nestjs/jwt';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';

export default class ApiFeatures {
  static async upload(files) {
    return new Promise((resolve, reject) => {
      const s3 = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECERET_KEY,
      });

      let images = [];

      files.forEach(async (file) => {
        const splitFile = file.originalname.split('.');
        const random = Date.now();

        const fileName = `${splitFile[0]}_${random}.${splitFile[1]}`;

        const params = {
          Bucket: `${process.env.AWS_S3_BUCKET_NAME}/restaurants`,
          Key: fileName,
          Body: file.buffer,
        };

        const uploadResponse = await s3.upload(params).promise();

        images.push(uploadResponse);

        if (images.length === files.length) {
          resolve(images);
        }
      });
    });
  }

  //Delete images
  static async deleteImages(images) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECERET_KEY,
    });

    let imageKeys = images.map((image) => {
      return {
        Key: image.Key,
      };
    });

    const params = {
      Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
      Delete: {
        Objects: imageKeys,
        Quiet: false,
      },
    };

    return new Promise((resolve, reject) => {
      s3.deleteObjects(params, function (err, result) {
        if (err) {
          console.log(err);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  //Assign token when logging in or registering
  static async assignJwtToken(
    userId: string,
    jwtService: JwtService,
  ): Promise<string> {
    const payload = {
      id: userId,
    };

    const token = await jwtService.sign(payload);

    return token;
  }
}
