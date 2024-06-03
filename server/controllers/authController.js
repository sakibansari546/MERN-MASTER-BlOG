import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { getAuth } from '../config/firebaseConfig.js';
import User from '../Schema/User.js';
import { emailRegex, passwordRegex } from '../utils/regex.js';

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

const genrateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameNotUnique = await User.exists({ "personal_info.username": username });

    if (isUsernameNotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

export const signUp = async (req, res) => {
    const { fullname, email, password } = req.body;

    if (fullname.length < 3) {
        return res.status(403).json({ 'error': "Fullname must be greater than 3 letters" });
    }

    if (!email || !email.length) {
        return res.status(403).json({ 'error': "Email is required" });
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({ 'error': "Invalid email" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({
            'error': "Password should be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letter"
        });
    }

    try {
        const hashed_password = await bcrypt.hash(password, 10);
        const username = await genrateUsername(email);

        const user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            }
        });

        await user.save();
        return res.status(200).json(formatDataToSend(user));
    } catch (err) {
        if (err.code === 11000) {
            return res.status(403).json({ 'error': "Email already exists" });
        }
        return res.status(500).json({ 'error': err.message });
    }
};

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) {
            return res.status(403).json({ "error": "Email not found" });
        }

        if (user.google_auth) {
            return res.status(403).json({ "error": "This email was signed up with Google. Please log in with Google" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
        if (!isPasswordValid) {
            return res.status(403).json({ "error": "Invalid password" });
        }

        return res.status(200).json(formatDataToSend(user));
    } catch (err) {
        return res.status(500).json({ "error": "Internal server error" });
    }
};

export const googleAuth = async (req, res) => {
    const { access_token } = req.body;

    try {
        const decodedUser = await getAuth.verifyIdToken(access_token);
        const { email, picture, name } = decodedUser;

        let user = await User.findOne({ "personal_info.email": email })
            .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");

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
        return res.status(500).json({ 'error': err.message });
    }
};
