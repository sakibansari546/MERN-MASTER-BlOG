import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import InPageNavigation, { activeTabRef } from '../components/inpage-navigation.component'
import Loader from '../components/loader.component'
import AnimationWrapper from '../common/page-animation'
import BlogPostCard from '../components/blog-post.component'
import NoDataMessage from '../components/nodata.component'
import LoadMoreDataBtn from '../components/load-more.component'
import axios from 'axios'
import { filterPaginationData } from '../common/filter-pagination-data'

const SearchPage = () => {
    let [blog, setBlog] = useState(null);
    let { query } = useParams();

    const searchBlog = ({ page = 1, create_new_arr = false, }) => {
        axios.post('http://localhost:3000/search-blogs', { query, page })
            .then(async ({ data }) => {
                // console.log(data.blogs);
                try {
                    let formatedData = await filterPaginationData({
                        state: blog,
                        data: data.blogs,
                        page: page,
                        countRoute: '/search-blogs-count',
                        data_to_send: { query },
                        create_new_arr
                    });
                    console.log(formatedData);
                    setBlog(formatedData)
                } catch (err) {
                    console.error("Error processing pagination data:", err);
                }
            })
    }

    const resetState = () => {
        setBlog(null)
    }
    useEffect(() => {
        resetState()
        searchBlog({ page: 1, create_new_arr: true })

    }, [query])


    return (
        <section className='h-cover flex justify-center gap-10'>
            <div className='w-full '>
                <InPageNavigation routes={[`Search Results from ${query}`, `Accounts Matched`]} defaultHidden={["Accounts Matched"]}>
                    <>
                        {
                            blog === null ? (<Loader />) :
                                (
                                    blog.results.length ?
                                        blog.results.map((blog, i) => {
                                            return (
                                                <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }}>
                                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </AnimationWrapper>
                                            )
                                        }) :
                                        <NoDataMessage message='no blog publish' />
                                )
                        }
                        <LoadMoreDataBtn state={blog} fetchDataFun={searchBlog} />
                    </>
                </InPageNavigation>
            </div>
        </section>
    )
}

export default SearchPage
