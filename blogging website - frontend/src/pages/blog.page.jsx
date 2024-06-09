import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer, { fetchComment } from '../components/comments.component';

export const blogStructure = {
    title: "",
    content: [],
    author: { personal_info: {} },
    banner: '',
    publishedAt: '',
    comments: []  // Ensure comments is an array
};

export const BlogContext = createContext({});

const BlogPage = () => {
    let { blog_id } = useParams();
    let [loading, setLoading] = useState(true);
    let [blog, setBlog] = useState(blogStructure);
    let [simillarBlogs, setSimilarBlogs] = useState(null);
    let [isLikedByUser, setIsLikedByUser] = useState(false);
    let [commentsWrapper, setCommentsWrapper] = useState(false);
    let [lotalParentCommentLoaded, setTotalParentCommentLoaded] = useState(0);

    let { title, banner, content, author: { personal_info: { username: author_username, fullname, profile_img } }, publishedAt } = blog;

    const fetchBlog = async () => {
        try {
            const { data: { blog } } = await axios.post('http://localhost:3000/get-blog', { blog_id });
            // console.log('Fetched blog:', blog);

            const comments = await fetchComment({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentLoaded });
            blog.comments = comments;
            // console.log('Blog with comments:', blog);

            setBlog(blog);

            const { data } = await axios.post('http://localhost:3000/search-blogs', { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id });
            setSimilarBlogs(data.blogs);

            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            resetState();
            await fetchBlog();
        };
        fetchData();
    }, [blog_id]);

    const resetState = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setIsLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentLoaded(0);
    };

    return (
        <AnimationWrapper>
            {loading ? <Loader /> :
                <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setIsLikedByUser, commentsWrapper, setCommentsWrapper, lotalParentCommentLoaded, setTotalParentCommentLoaded }}>
                    <CommentsContainer comments={blog.comments} />
                    <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                        <img className='aspect-video' src={banner} alt="Blog Banner" />
                        <div className='mt-8'>
                            <h2>{title}</h2>
                            <div className='flex max-sm:flex-col justify-between my-8'>
                                <div className='flex gap-5 items-center'>
                                    <img className='w-12 h-12 rounded-full' src={profile_img} alt="author image" />
                                    <p className='capitalize'>
                                        <b className='text-xl'>{fullname}</b>
                                        <br />
                                        @<Link to={`/user/${author_username}`} className='underline lowercase font-medium'>{author_username}</Link>
                                    </p>
                                </div>
                                <p className='text-dark-grey opacity-75 max-sm:mt-2 max-sm:ml-12 max-sm:pl-5 font-medium'>Publish on <b>{getDay(publishedAt)}</b></p>
                            </div>
                        </div>
                        <BlogInteraction />
                        <div className='mb-12 font-gelasio blog-page-content'>
                            {content[0].blocks.map((block, i) => (
                                <div key={i} className='my-4 md:my-8'>
                                    <BlogContent block={block} />
                                </div>
                            ))}
                        </div>
                        <BlogInteraction />
                        {simillarBlogs !== null && simillarBlogs.length > 0 &&
                            <>
                                <h1 className='text-2xl mt-14 mb-10 font-bold'>Similar Blogs</h1>
                                {simillarBlogs.map((blog, i) => {
                                    let { author: { personal_info } } = blog;
                                    return (
                                        <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }}>
                                            <BlogPostCard content={blog} author={personal_info} />
                                        </AnimationWrapper>
                                    );
                                })}
                            </>
                        }
                    </div>
                </BlogContext.Provider>
            }
        </AnimationWrapper>
    );
};

export default BlogPage;
