import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation, { activeTabRef } from '../components/inpage-navigation.component'
import axios from 'axios'
import Loader from '../components/loader.component'
import BlogPostCard from '../components/blog-post.component'
import MinimalBlogPost from '../components/nobanner-blog-post.component'
import NoDataMessage from '../components/nodata.component'

const HomePage = () => {
    let [blog, setBlog] = useState(null);
    let [trendingBlog, setTrendingBlog] = useState(null);
    let [pageState, setPageState] = useState('home');
    let categories = ['Test', 'Entertainment', 'Health', 'Science', 'Sports', 'Programing', 'Social Media', 'Technology',];

    const fetchLatestBlogs = () => {
        axios.get('http://localhost:3000/latest-blogs')
            .then(({ data }) => {
                setBlog(data.blogs)
            })
    }

    const fetchBlogByCategory = (pageState) => {
        axios.post('http://localhost:3000/search-blogs', { tag: pageState })
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


    const loadBlogBycategorie = (e) => {
        let category = e.target.innerText.toLowerCase();
        console.log(category);
        setBlog(null);
        if (pageState === category) {
            setPageState('home');
            return;
        }
        setPageState(category);
    }

    useEffect(() => {
        activeTabRef.current.click()

        if (pageState === 'home') {
            fetchLatestBlogs();
        } else {
            fetchBlogByCategory(pageState);
        }
        if (!trendingBlog) {
            fetchTrendingtBlogs();
        }
    }, [pageState])

    return (
        <>
            <AnimationWrapper>
                <section className='h-cover flex justify-center gap-10'>
                    {/* Tatest Blogs */}
                    <div className='w-full'>
                        <InPageNavigation routes={[pageState, 'trending blogs']} defaultHidden={['trending blogs']}>
                            <>
                                {
                                    blog === null ? (<Loader />) :
                                        (
                                            blog.length ?
                                                blog.map((blog, i) => {
                                                    return (
                                                        <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                            <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                        </AnimationWrapper>
                                                    )
                                                }) :
                                                <NoDataMessage message='no blog publish' />
                                        )
                                }
                            </>
                            <>
                                {
                                    trendingBlog === null ? (<Loader />) :
                                        (
                                            trendingBlog.length ?
                                                trendingBlog.map((trendingBlog, i) => {
                                                    return (
                                                        <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                            <MinimalBlogPost content={trendingBlog} author={trendingBlog.author.personal_info} index={i} />
                                                        </AnimationWrapper>
                                                    )
                                                }) :
                                                <NoDataMessage message='no trending blog' />
                                        )
                                }
                            </>
                        </InPageNavigation>
                    </div>
                    {/* Trending Blogs */}
                    <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
                        <div className='flex flex-col gap-10'>
                            <div>
                                <h1 className='font-medium text-xl mb-8'>Stories form all interests</h1>

                                <div className='flex gap-3 flex-wrap'>
                                    {
                                        categories.map((category, i) => {
                                            return (
                                                <button className={`tag ${(pageState === category.toLowerCase()) ? "bg-black text-white" : " "}`} key={i}
                                                    onClick={loadBlogBycategorie}>
                                                    {category}
                                                </button>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div>
                                <h1 className='font-medium text-xl mb-8'>Trending<i class="fi fi-rr-arrow-trend-up"></i></h1>
                                {
                                    trendingBlog === null ? (<Loader />) :
                                        (
                                            trendingBlog.length ?
                                                trendingBlog.map((trendingBlog, i) => {
                                                    return (
                                                        <AnimationWrapper transition={{ duration: 1, delay: i * .1 }}>
                                                            <MinimalBlogPost content={trendingBlog} author={trendingBlog.author.personal_info} index={i} />
                                                        </AnimationWrapper>
                                                    )
                                                }) :
                                                <NoDataMessage message='no trending blog' />
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default HomePage
