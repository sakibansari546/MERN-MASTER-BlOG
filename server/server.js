import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';

const server = express();
const PORT = 3000;

// Schemas below
import User from './Schema/User.js'

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// Middleware to parse JSON bodies
server.use(express.json());

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
})
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });



const formatDataToSend = (user) => {

    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
        email: user.personal_info.email,
    }
}

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
    let { fullname, email = undefined, password } = req.body;

    // Validating the data from frontend
    if (fullname.length < 3) {
        return res.status(403).json({
            'error': "Fullname must be graterthan 3 letter"
        })
    }

    if (!email.length) {
        return res.status(403).json({
            'error': "Email is required"
        })
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({
            'error': "Invalid email"
        })
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({
            'error': "Password should be 6 to 20 charecters long with numaric, 1 lowercase and 1 uppercase lettes"
        })
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        if (err) {
            return res.status(500).json({
                'error': "Internal server error"
            })
        }

        let username = await genrateUsername(email);

        let user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            }
        })
        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u))
        }).catch((err) => {
            if (err.code === 11000) {
                return res.status(403).json({
                    'error': "Email already exists"
                })
            }
            return res.status(500).json({
                'error': err.message
            })
        })
    })

});

server.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) {
            return res.status(403).json({ "error": "Email not found" });
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


server.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});

