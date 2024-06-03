import aws from 'aws-sdk';
import dotenv from 'dotenv';
import admin from 'firebase-admin'; // Import Firebase admin

// Import Firebase service account key
import serviceAccountKey from './mern-blog-website-master-firebase-adminsdk-i8cws-0cccab8cf8.json' assert { type: 'json' };

dotenv.config();

// Initialize Firebase app only if it has not been initialized before
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey)
    });
}

// Create an AWS S3 client
const s3 = new aws.S3({
    region: "eu-north-1",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to generate a signed URL for uploading images to S3
export const generateImgUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`; // Generate unique image name

    // Generate signed URL with putObject operation
    return await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: 'image/jpeg',
        Key: imageName,
        Expires: 1000,
    });
}
