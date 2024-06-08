import React, { useContext, useState } from 'react'
import { UserContext } from '../App'
import toast, { Toaster } from 'react-hot-toast'
import { BlogContext } from '../pages/blog.page'
import axios from 'axios'

const CommentField = ({ action }) => {
    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext)
    let { blog, blog: { _id, author, author: { _id: blog_author }, comments, activity, activity: { total_comments, total_parent_comments } }, setBlog, setLotalParentCommentLoaded } = useContext(BlogContext)
    const [comment, setComment] = useState('')

    const handleComment = () => {
        // console.log(author);
        if (!access_token) {
            return toast.error('Login first to leave a comment');
        }

        if (!comment || !comment.length) {
            return toast.error('Write something to leave a comment');
        }

        axios.post('http://localhost:3000/add-comment', { _id, blog_author, comment }, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
            .then(({ data }) => {
                setComment('')
                data.commented_by = { personal_info: { username, profile_img, fullname } }

                let newCommentsArr;
                data.childrenLevel = 0;
                newCommentsArr = [data];

                let parentCommentIncrementVal = 1;

                setBlog({ ...blog, comments: { ...comments, results: newCommentsArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } })

                setLotalParentCommentLoaded(preVal => preVal + parentCommentIncrementVal
                    
                )

            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.error) {
                    toast.error(err.response.data.error);
                } else {
                    toast.error('An error occurred. Please try again.');
                }
                console.error(err);
            });
    };


    return (
        <>
            <Toaster />
            <textarea onChange={(e) => setComment(e.target.value)} className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto' value={comment} placeholder='Leave a comment'></textarea>
            <button
                onClick={handleComment}
                className='btn-dark mt-5 px-8 text-sm sm:text-xl'>{action}</button>
        </>
    )
}

export default CommentField
