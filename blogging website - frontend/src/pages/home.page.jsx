import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation from '../components/inpage-navigation.component'
import axios from 'axios'
import Loader from '../components/loader.component'
import BlogPostCard from '../components/blog-post.component'
import MinimalBlogPost from '../components/nobanner-blog-post.component'

const HomePage = () => {
    let [blog, setBlog] = useState(null);
    let [trendingBlog, setTrendingBlog] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get('http://localhost:3000/latest-blogs')
            .then(({ data }) => {
                setBlog(data.blogs)
            })
    }

    const fetchTrendingtBlogs = () => {
        axios.get('http://localhost:3000/trending-blogs')
            .then(({ data }) => {
                setTrendingBlog(data.blogs)
            })
    }

    useEffect(() => {
        fetchLatestBlogs();
        fetchTrendingtBlogs();
    }, [])

    return (
        <>
            <AnimationWrapper>
                <section className='h-cover flex justify-center gap-10'>
                    {/* Tatest Blogs */}
                    <div className='w-full'>
                        <InPageNavigation routes={['home', 'trending blogs']} defaultHidden={['trending blogs']}>
                            <>
                                {
                                    blog === null ? <Loader /> :
                                        blog.map((blog, i) => {
                                            return (
                                                <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </AnimationWrapper>
                                            )
                                        })
                                }
                            </>
                            <>
                                {
                                    trendingBlog === null ? <Loader /> :
                                        trendingBlog.map((trendingBlog, i) => {
                                            return (
                                                <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                    <MinimalBlogPost content={trendingBlog} author={trendingBlog.author.personal_info} index={i} />
                                                </AnimationWrapper>
                                            )
                                        })
                                }
                            </>
                        </InPageNavigation>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default HomePage
