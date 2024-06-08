import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer from '../components/comments.component';

export const blogStructure = ({
    title: "",
    content: [],
    author: { personal_info: {} },
    banner: '',
    publishedAt: ''
})

export const BlogContext = createContext({})

const BlogPage = () => {
    let { blog_id } = useParams();
    let [loading, setLoading] = useState(true);
    let [blog, setBlog] = useState(blogStructure);
    let [simillarBlogs, setSimilarBlogs] = useState(null)
    let [isLikedByUser, setIsLikedByUser] = useState(false);
    let [commentsWrapper, setCommentsWrapper] = useState(false);
    let [lotalParentCommentLoaded, setLotalParentCommentLoaded] = useState(0)

    let { title, banner, content, author: { personal_info: { username: author_username, fullname, profile_img } }, publishedAt } = blog;


    const fetchBlog = () => {
        axios.post('http://localhost:3000/get-blog', { blog_id })
            .then(({ data: { blog } }) => {
                setBlog(blog);
                axios.post('http://localhost:3000/search-blogs', { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id }).
                    then(({ data }) => {
                        setSimilarBlogs(data.blogs);
                    })

                setLoading(false);
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        resetState();
        fetchBlog();
    }, [blog_id])

    const resetState = () => {
        setBlog(blogStructure)
        setSimilarBlogs(null)
        setLoading(true)
        setIsLikedByUser(false);
        setCommentsWrapper(false);
        setLotalParentCommentLoaded(0);
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setIsLikedByUser, commentsWrapper, setCommentsWrapper, lotalParentCommentLoaded, setLotalParentCommentLoaded }}>

                        <CommentsContainer />

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
                                            @
                                            <Link to={`/user/${author_username}`} className='underline lowercase font-medium'>{author_username}</Link>
                                        </p>
                                    </div>
                                    <p className='text-dark-grey opacity-75 max-sm:mt-2 max-sm:ml-12 max-sm:pl-5 font-medium'>Publish on <b>{getDay(publishedAt)}</b> { }</p>
                                </div>
                            </div>

                            <BlogInteraction />

                            <div className='mb-12 font-gelasio blog-page-content'>


                                {
                                    content[0].blocks.map((block, i) => {
                                        return <div key={i} className='my-4 md:my-8'>
                                            <BlogContent block={block} />
                                        </div>

                                    })
                                }


                            </div>

                            <BlogInteraction />

                            {
                                simillarBlogs !== null && simillarBlogs.length ?
                                    <>
                                        <h1 className='text-2xl mt-14 mb-10 font-bold'>Similler Blogs</h1>

                                        {
                                            simillarBlogs.map((blog, i) => {
                                                let { author: { personal_info } } = blog;
                                                return (
                                                    <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }}>
                                                        <BlogPostCard content={blog} author={personal_info} />
                                                    </AnimationWrapper>
                                                )
                                            })
                                        }

                                    </>
                                    : ''
                            }

                        </div>
                    </BlogContext.Provider>
            }
        </AnimationWrapper>
    )
}

export default BlogPage
