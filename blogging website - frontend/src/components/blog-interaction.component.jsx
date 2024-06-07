import React, { useContext, useEffect } from 'react'
import { BlogContext } from '../pages/blog.page'
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

const BlogInteraction = () => {
    let { blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, isLikedByUser, setIsLikedByUser } = useContext(BlogContext);

    let { userAuth: { username, access_token } } = useContext(UserContext);

    useEffect(() => {
        if (access_token) {
            axios.post('http://localhost:3000/isliked-by-user', { _id }, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }).then(({ data: { result } }) => {
                setIsLikedByUser(Boolean(result))
            }).catch(err => {
                console.log(err);
            })
        }


    }, [])

    const handleLike = () => {
        if (access_token) {
            setIsLikedByUser(preVal => !preVal);
            !isLikedByUser ? total_likes++ : total_likes--;

            setBlog(preVal => ({ ...preVal, activity: { total_likes, total_comments } }));


            axios.post('http://localhost:3000/like-blog', { _id, isLikedByUser }, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }).then(({ data }) => {
                console.log(data);
            }).catch(err => {
                console.log(err);
            })
        } else {
            console.log('not loged in');
            toast.error('Please login to like this blog')
        }
    }

    return (
        <>
            <Toaster />
            <hr className='border-grey my-2' />

            <div className='flex gap-6 justify-between'>
                <div className='flex gap-3 items-center'>
                    <button onClick={handleLike} className={`w-9 h-9 rounded-full flex items-center justify-center ${isLikedByUser ? 'bg-red/20 text-red' : 'bg-grey/80'}`}>
                        <i className={`fi fi-${isLikedByUser ? 'ss' : 'rr'}-heart font-medium text-xl mt-1.5`}> </i>
                    </button>
                    <p className='text-xl text-dark-grey'>{total_likes}</p>



                    <button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80'>
                        <i className="fi fi-rs-comment-dots font-medium text-xl mt-1"> </i>
                    </button>

                    <p className='text-xl text-dark-grey'>{total_comments}</p>

                </div>

                <div className='flex gap-6 items-center'>

                    {
                        username === author_username &&
                        <Link to={`/editor/${blog_id}`} className='underline hover:text-purple'>
                            Edit
                        </Link>
                    }

                    <Link target='_blank' to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
                        <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
                    </Link>
                </div>

            </div>

            <hr className='border-grey my-2' />
        </>
    )
}

export default BlogInteraction
