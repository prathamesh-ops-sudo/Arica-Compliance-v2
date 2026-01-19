import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

const s3Client = new S3Client({
  region: config.awsRegion,
});

const BUCKET_NAME = process.env.S3_REPORTS_BUCKET || 'arica-toucan-reports';

export async function uploadPdfReport(
  orgId: string,
  pdfBuffer: Buffer,
  filename: string
): Promise<string> {
  const key = `reports/${orgId}/${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      Metadata: {
        orgId,
        generatedAt: new Date().toISOString(),
      },
    })
  );

  return key;
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

export async function uploadAndGetPresignedUrl(
  orgId: string,
  pdfBuffer: Buffer,
  filename: string
): Promise<{ key: string; downloadUrl: string }> {
  const key = await uploadPdfReport(orgId, pdfBuffer, filename);
  const downloadUrl = await getPresignedDownloadUrl(key);
  return { key, downloadUrl };
}
