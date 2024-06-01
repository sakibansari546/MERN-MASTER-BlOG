import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import serviceAccountKey from './mern-blog-website-master-firebase-adminsdk-i8cws-0cccab8cf8.json' assert { type: 'json' };

import aws from 'aws-sdk';

import { getAuth } from 'firebase-admin/auth';

const server = express();
const PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

// Schemas below
import User from './Schema/User.js';

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// Middleware to parse JSON bodies
server.use(express.json());
server.use(cors());

// Check if DB_LOCATION is provided
if (!process.env.DB_LOCATION) {
    console.error("Error: DB_LOCATION is not set in the environment variables.");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});


// Satrting with S3 Bucket
const s3 = new aws.S3({
    region: "eu-north-1",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const generateImgUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: 'image/jpeg',
        Key: imageName,
        Expires: 1000,
    });
}

// Upload Image url root
server.get('/get-upload-url', async (req, res) => {
    try {
        const url = await generateImgUploadURL();
        res.status(200).json({ uploadURL: url });
    } catch (error) {
        res.status(400).json({ "error": error });
    }
});




const formatDataToSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
        email: user.personal_info.email,
    };
};

// Function to generate a unique username based on email
const genrateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameNotUnique = await User.exists({ "personal_info.username": username });

    // If username is not unique, append a random string
    if (isUsernameNotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

server.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;

    // Validating the data from frontend
    if (fullname.length < 3) {
        return res.status(403).json({
            'error': "Fullname must be greater than 3 letters"
        });
    }

    if (!email || !email.length) {
        return res.status(403).json({
            'error': "Email is required"
        });
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({
            'error': "Invalid email"
        });
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({
            'error': "Password should be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letter"
        });
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        if (err) {
            return res.status(500).json({
                'error': "Internal server error"
            });
        }

        const username = await genrateUsername(email);

        const user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            }
        });
        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u));
        }).catch((err) => {
            if (err.code === 11000) {
                return res.status(403).json({
                    'error': "Email already exists"
                });
            }
            return res.status(500).json({
                'error': err.message
            });
        });
    });
});

// Sign in endpoint
// Sign in endpoint
server.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) {
            return res.status(403).json({ "error": "Email not found" });
        }

        // Check if the user signed up with Google
        if (user.google_auth) {
            return res.status(403).json({ "error": "This email was signed up with Google. Please log in with Google" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
        if (!isPasswordValid) {
            return res.status(403).json({ "error": "Invalid password" });
        }

        // Format and send the user data
        return res.status(200).json(formatDataToSend(user));

    } catch (err) {
        console.error('Error during signin:', err);
        return res.status(500).json({ "error": "Internal server error" });
    }
});


server.post('/google-auth', async (req, res) => {
    try {
        const { access_token } = req.body;

        // Verify the ID token using Firebase Admin SDK
        const decodedUser = await getAuth().verifyIdToken(access_token);
        const { email, picture, name } = decodedUser;

        console.log("Decoded user:", decodedUser);

        let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");

        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({
                    'error': "This email was signed up with Google. Please log in with password to access account"
                });
            }
        } else {
            const username = await genrateUsername(email);
            user = new User({
                personal_info: {
                    fullname: name,
                    email,
                    profile_img: picture.replace("s96-c", "s384-c"),
                    username
                },
                google_auth: true
            });

            await user.save();
        }

        return res.status(200).json(formatDataToSend(user));
    } catch (err) {
        console.error("Google Auth Error:", err);
        return res.status(500).json({ 'error': err.message });
    }
});

server.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
