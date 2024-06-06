import React, { useContext } from 'react'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { UserContext } from '../App';
import AboutUser from '../components/about.component';
import { filterPaginationData } from '../common/filter-pagination-data';
import InPageNavigation from '../components/inpage-navigation.component';
import NoDataMessage from '../components/nodata.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import LoadMoreDataBtn from '../components/load-more.component';
import BlogPostCard from '../components/blog-post.component';
import PageNotFound from './404.page';

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_reads: 0
    },
    social_links: {

    },
    joinedAt: ""
}

const ProfilePage = () => {

    let { userAuth: { username } } = useContext(UserContext)

    let { id: profile_id } = useParams();

    let [profile, setProfile] = useState(profileDataStructure);
    let [loading, setLoading] = useState(true);
    let [blog, setBlog] = useState(null);
    let [profileLoaded, setProfileLoaded] = useState('');

    let { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts, total_reads }, social_links, joinedAt } = profile;

    const getBlogs = ({ page = 1, user_id }) => {
        user_id = user_id === undefined ? blog.user_id : user_id;

        axios.post('http://localhost:3000/search-blogs', {
            author: user_id,
            page
        }).then(async ({ data }) => {
            let formatedData = await filterPaginationData({
                state: blog,
                data: data.blogs,
                page: page,
                countRoute: '/search-blogs-count',
                data_to_send: { author: user_id }
            })
            formatedData.user_id = user_id;
            setBlog(formatedData)
            // console.log(formatedData);
        })
    }

    const fetchUserProfile = () => {
        axios.post('http://localhost:3000/get-profile', { username: profile_id })
            .then(({ data: user }) => {
                if (user !== null) {
                    setProfile(user);
                }
                getBlogs({ user_id: user._id })
                setLoading(false)
                setProfileLoaded(profile_id)
            }).catch(err => {
                console.log(err)
                setLoading(false)
            })
    }

    useEffect(() => {
        if (profile_id !== profileLoaded) {
            setBlog(null)
        }
        if (blog === null) {
            resetState()
            fetchUserProfile()
        }
    }, [profile_id, blog])

    const resetState = () => {
        setProfile(profileDataStructure)
        setLoading(true)
        setProfileLoaded('')
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    profile_username.length ?
                        <section className='h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12'>
                            <div className='flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:py-10'>
                                <img className='w-32 h-32 bg-grey rounded-full md:w-32 md:h-32' src={profile_img} alt="profile image" />
                                <h1 className="text-xl font-medium">@{profile_username}</h1>
                                <p className='text-lg capitalize h-6 font-semibold'>{fullname}</p>
                                <p className=''>{total_posts.toLocaleString()} Blogs &nbsp; - &nbsp; {total_reads.toLocaleString()} Reads</p>

                                <div className='flex gap-4 mt-2'>
                                    {
                                        profile_id === username &&
                                        <Link to='/settings/edit-profile'>
                                            <button className='btn-light rounded-sm'>Edit Profile</button>
                                        </Link>
                                    }
                                </div>
                                <AboutUser className={'max-md:hidden'} bio={bio} social_links={social_links} joinedAt={joinedAt} />
                            </div>

                            <div className='max-md:mt-12 w-full'>
                                <InPageNavigation routes={['Blogs Published', 'About']} defaultHidden={['About']}>
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
                                        <LoadMoreDataBtn state={blog} fetchDataFun={getBlogs} />
                                    </>
                                    <>
                                        <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                                    </>
                                </InPageNavigation>
                            </div>

                        </section> :
                        <PageNotFound />
            }
        </AnimationWrapper>
    )
}


export default ProfilePage
