import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import serviceAccountKey from './config/mern-blog-website-master-firebase-adminsdk-i8cws-0cccab8cf8.json' assert { type: 'json' };

import aws from 'aws-sdk';

import { getAuth } from 'firebase-admin/auth';

const server = express();
const PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

// Schemas below
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';
import { populate } from 'dotenv';

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// Middleware to parse JSON bodies
server.use(express.json());
server.use(cors());
server.use((req, res, next) => {
    res.cookie('yourCookie', 'cookieValue', {
        httpOnly: true,
        secure: true, // Ensures the cookie is sent over HTTPS
        sameSite: 'None' // Ensures the cookie is sent with cross-site requests
    });
    next();
});

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


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            'error': "Unauthorized"
        });
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({
                'error': "Invalid access token"
            });
        }
        req.user = user.id;
        next();
    });
};


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
// signUp Route
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

// google auth Route
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

// find latest blogs Route
// Route to find latest blogs
server.post('/latest-blogs', (req, res) => {
    let { page = 1 } = req.body; // Default to page 1 if not provided

    let maxLimit = 5;
    Blog.find({ 'draft': false })
        .populate('author', "personal_info.username personal_info.fullname personal_info.profile_img -_id")
        .sort({ 'publishedAt': -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs });
        })
        .catch(err => {
            return res.status(500).json({ 'error': err.message });
        });
});

// Route to get the count of all latest blogs
server.post('/all-latest-blogs-count', (req, res) => {
    Blog.countDocuments({ draft: false })
        .then(count => {
            return res.status(200).json({ totalDocs: count });
        })
        .catch(err => {
            return res.status(500).json({ 'error': err.message });
        });
});

// fins trending blogs
server.get('/trending-blogs', (req, res) => {
    Blog.find({ 'draft': false })
        .populate('author', "personal_info.username personal_info.fullname personal_info.profile_img -_id")
        .sort({ 'activity.total_reads': -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({ blogs });
        }).catch(err => {
            return res.status(500).json({ 'error': err.message });
        })
})

// Search blog route
server.post('/search-blogs', (req, res) => {
    let { tag, page, author, query, limit, eliminate_blog } = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag.toLowerCase(), draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') };
    } else if (author) {
        findQuery = { draft: false, author: author }
    }

    let maxLimit = limit ? limit : 2;
    Blog.find(findQuery)
        .populate('author', "personal_info.username personal_info.fullname personal_info.profile_img -_id")
        .sort({ 'publishedAt': -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs });
        }).catch(err => {
            return res.status(500).json({ 'error': err.message });
        })
})

server.post('/search-blogs-count', (req, res) => {
    let { tag, author, query } = req.body;

    let findQuery = { draft: false };

    if (tag) {
        findQuery.tags = tag.toLowerCase();
    } else if (query) {
        findQuery.title = new RegExp(query, 'i');
    } else if (author) {
        findQuery = { draft: false, author: author }
    }

    Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({ totalDocs: count });
        })
        .catch(err => {
            return res.status(500).json({ 'error': err.message });
        });
});

server.post('/search-users', (req, res) => {
    let { query } = req.body;
    User.find({ "personal_info.username": new RegExp(query, 'i') })
        .limit(50)
        .select("personal_info.username personal_info.fullname personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json({ users });
        })
        .catch(err => {
            return res.status(500).json({ 'error': err.message });
        })
})

server.post('/get-profile', (req, res) => {
    let { username } = req.body;

    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(err => {
            return res.status(500).json({ 'error': err.message });
        })
})

// create blog route
server.post('/create-blog', verifyJWT, (req, res) => {
    let authorId = req.user;
    let { title, banner, content, tags, des, draft, id } = req.body;

    if (!title.length) {
        return res.status(403).json({ 'error': "Title is required" });
    }

    if (!draft) {
        if (!tags.length) {
            return res.status(403).json({ 'error': "Tags are required" });
        }
        if (!des.length || des.length > 200) {
            return res.status(403).json({ 'error': "Description is required under 200 charecter" });
        }
        if (!banner.length) {
            return res.status(403).json({ 'error': "Blog Banner is required" });
        }
        if (!content.blocks.length) {
            return res.status(403).json({ 'error': "There must be some content to publish it" });
        }
    }

    tags = tags.map(tag => tag.toLowerCase());

    const blog_id = id || title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').trim() + '-' + nanoid();

    if (id) {

        Blog.findOneAndUpdate({ blog_id }, {
            title,
            banner,
            content,
            tags,
            des,
            draft: draft ? draft : false
        }).then(blog => {
            return res.status(200).json({ id: blog_id });
        }).catch(err => {
            return res.status(500).json({ 'error': "Feiled to update total posts number" });
        })

    } else {

        let blog = new Blog({
            title,
            banner,
            content,
            tags,
            des,
            author: authorId,
            blog_id,
            darft: Boolean(draft)
        })

        blog.save().then((blog) => {
            let incrementVal = draft ? 0 : 1;
            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } }).then(user => {
                return res.status(200).json({ id: blog.blog_id });
            })
                .catch(err => {
                    console.log("Error while updating total post number:", err);
                })

        }).catch((err) => {
            console.log("Error while creating blog:", err);
        })
    }
})

// single blog route
server.post('/get-blog', (req, res) => {
    let { blog_id, draft, mode } = req.body;

    let incrementVal = mode != 'edit' ? 1 : 0;

    Blog.findOneAndUpdate({ blog_id }, { $inc: { 'activity.total_reads': incrementVal } })
        .populate('author', "personal_info.username personal_info.fullname personal_info.profile_img _id")
        .select('title des banner content activity publihedAt blog_id tags')
        .then(blog => {

            User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, {
                $inc: { "account_info.total_reads": incrementVal }
            }).catch(err => {
                return res.status(500).json({ 'error': err.message });
            })

            if (blog.draft && !draft) {
                return res.status(500).json({ "error": 'you can not access draft blog' });
            }

            return res.status(200).json({ blog });
        })
        .catch(err => {
            return res.status(500).json({ 'error': err.message });
        })
})

server.post('/like-blog', verifyJWT, (req, res) => {
    let user_id = req.user;
    let { _id, isLikedByUser } = req.body;

    let incrementVal = isLikedByUser ? -1 : 1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } })
        .then(blog => {
            if (!isLikedByUser) {
                let like = new Notification({
                    type: 'like',
                    blog: _id,
                    notification_for: blog.author,
                    user: user_id
                })
                like.save().then(notification => {
                    return res.status(200).json({ liked_by_user: true });
                })
            }
            else {
                Notification.findOneAndDelete({ user: user_id, type: 'like', blog: _id })
                    .then(data => {
                        return res.status(200).json({ liked_by_user: false });
                    }).catch(err => {
                        return res.status(500).json({ 'error': err.message });
                    })
            }
        })
})

server.post('/isliked-by-user', verifyJWT, (req, res) => {
    let user_id = req.user;
    let { _id } = req.body;

    Notification.exists({ user: user_id, type: 'like', blog: _id })
        .then(result => {
            return res.status(200).json({ result });
        }).catch(err => {
            return res.status(500).json({ 'error': err.message });
        })

})

server.post('/add-comment', verifyJWT, (req, res) => {
    let user_id = req.user;
    let { _id, comment, replying_to, blog_author } = req.body;

    if (!comment.length) {
        return res.status(403).json({ 'error': "Write something to leave a comment" });
    }

    // Creating a comment doc
    let commentObj = {
        blog_id: _id,
        blog_author,
        comment,
        commented_by: user_id,
        isReply: replying_to ? true : false,
        // parent: replying_to ? replying_to : null
    };


    if (replying_to) {
        commentObj.parent = replying_to
        commentObj.isReply = true;
    }

    new Comment(commentObj).save()
        .then(async commentFile => {
            let { comment, commentedAt, children } = commentFile;
            Blog.findOneAndUpdate({ _id }, {
                $push: { "comments": commentFile._id },
                $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 }
            })
                .then(blog => {
                    console.log('New Blog updated with comment');
                }).catch(err => {
                    console.log(err);
                });

            let notificationOnj = {
                type: replying_to ? 'reply' : 'comment',
                blog: _id,
                notification_for: blog_author,
                user: user_id,
                comment: commentFile._id
            };

            if (replying_to) {

                notificationOnj.replied_on_comment = replying_to
                await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id } })
                    .then(replyingTOCommentDoc => {
                        notificationOnj.notification_for = replyingTOCommentDoc.commented_by;
                    })

            }

            new Notification(notificationOnj).save()
                .then(notification => {
                    console.log('New notification created');
                });

            return res.status(200).json({ comment, commentedAt, _id: commentFile._id, user_id, children });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});


server.post('/get-blog-comments', (req, res) => {
    let { blog_id, skip = 0 } = req.body;
    let maxLimit = 5;

    Comment.find({ blog_id, isReply: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(maxLimit)
        .populate('commented_by', 'personal_info.username personal_info.fullname personal_info.profile_img _id')
        .then(comments => {
            return res.status(200).json({ comments });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

server.post('/get-replies', (req, res) => {
    let { _id, skip = 0 } = req.body;

    let maxLimit = 5;

    Comment.find({ parent: _id })
        .populate({
            path: 'commented_by',
            select: 'personal_info.username personal_info.fullname personal_info.profile_img _id',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(maxLimit)
        .select('-blog_id -updatedAt')
        .then(replies => {
            return res.status(200).json({ replies });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});


const deleteComment = (_id) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
                    .then(comment => {
                        console.log('comment deleted from parent');
                    }).catch(err => {
                        console.log(err);
                    })
            }

            Notification.findOneAndDelete({ comment: _id })
                .then(notification => {
                    console.log('notification deleted');
                }).catch(err => {
                    console.log(err);
                })

            Notification.findOneAndDelete({ reply: _id })
                .then(notification => {
                    console.log('reply notification deleted');
                }).catch(err => {
                    console.log(err);
                })


            Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { 'activity.total_comments': -1 }, 'activity.total_parent_comments': comment.parent ? 0 : -1 })
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComment(replies);
                        })
                    }
                    console.log('comment deleted from blog');
                }).catch(err => {
                    console.log(err);
                })
        }).catch(err => {
            console.log(err);
        })
}

server.post('/delete-comment', verifyJWT, (req, res) => {
    let user_id = req.user;
    let { _id } = req.body;

    Comment.findOne({ _id })
        .then(comment => {
            if (user_id == comment.commented_by || user_id == comment.blog_author) {

                deleteComment(_id);
                return res.status(200).json({ 'success': 'comment deleted successfully' });

            } else {
                return res.status(500).json({ 'error': 'you can not delete this comment' });
            }
        })

});

server.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});