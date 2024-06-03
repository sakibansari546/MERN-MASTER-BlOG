import admin from 'firebase-admin';
import serviceAccountKey from './mern-blog-website-master-firebase-adminsdk-i8cws-0cccab8cf8.json' assert { type: 'json' };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

export const getAuth = admin.auth();
