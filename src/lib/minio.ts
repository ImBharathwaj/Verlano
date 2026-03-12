import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000";

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "verlano-media";

export const MINIO_PUBLIC_BASE_URL =
  process.env.MINIO_PUBLIC_BASE_URL || endpoint;

export const minioClient = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
});

