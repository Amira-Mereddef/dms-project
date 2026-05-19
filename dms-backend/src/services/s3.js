import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
  forcePathStyle: true,
})

export const initS3 = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: 'dms-documents' }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: 'dms-documents' }))
    console.log('S3 bucket created')
  }
  console.log('S3 ready')
}

export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const key = `documents/${Date.now()}_${fileName}`
  await s3.send(new PutObjectCommand({
    Bucket: 'dms-documents',
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }))
  return key
}

export const getPresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: 'dms-documents',
    Key: key,
  })
  return getSignedUrl(s3, command, { expiresIn: 3600 })
}