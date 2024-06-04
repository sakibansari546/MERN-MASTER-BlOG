import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation from '../components/inpage-navigation.component'
import axios from 'axios'
import Loader from '../components/loader.component'
import BlogPostCard from '../components/blog-post.component'

const HomePage = () => {
    let [blog, setBlog] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get('http://localhost:3000/latest-blogs')
            .then(({ data }) => {
                setBlog(data.blogs)
            })
    }

    useEffect(() => {
        fetchLatestBlogs();
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
                            <h1>Trending Blogs</h1>
                        </InPageNavigation>
                    </div>

                    {/* fillters and trending Bsogs */}
                    <div>

                    </div>

                </section>
            </AnimationWrapper>
        </>
    )
}

export default HomePage
