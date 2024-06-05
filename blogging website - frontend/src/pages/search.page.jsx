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
import UserCard from '../components/usercard.component'

const SearchPage = () => {
    let [blog, setBlog] = useState(null);
    let [users, setUsers] = useState(null);
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
                    // console.log(formatedData);
                    setBlog(formatedData)
                } catch (err) {
                    console.error("Error processing pagination data:", err);
                }
            })
    }

    const fettchUsers = () => {
        axios.post('http://localhost:3000/search-users', { query })
            .then(({ data: { users } }) => {
                setUsers(users)
                console.log(users);
            })
    }

    const resetState = () => {
        setBlog(null)
        setUsers(null)
    }

    useEffect(() => {
        resetState()
        searchBlog({ page: 1, create_new_arr: true })
        fettchUsers()
    }, [query])

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users === null ? (<Loader />) :
                        (
                            users.length ?
                                users.map((user, i) => {
                                    return (
                                        <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.07 }}>
                                            <UserCard user={user} />
                                        </AnimationWrapper>
                                    )
                                }) :
                                <NoDataMessage message='no user found' />
                        )
                }
            </>
        )
    }

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

                    <UserCardWrapper />

                </InPageNavigation>
            </div>
            <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
                <h1 className='text-xl mb-8 '>User related to search <i className='fi fi-rr-user mt-1'></i></h1>
                <UserCardWrapper />
            </div>

        </section>
    )
}

export default SearchPage
