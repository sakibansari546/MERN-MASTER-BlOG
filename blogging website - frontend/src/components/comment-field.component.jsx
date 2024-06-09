import React, { useContext, useState } from 'react'
import { UserContext } from '../App'
import toast, { Toaster } from 'react-hot-toast'
import { BlogContext } from '../pages/blog.page'
import axios from 'axios'
import { set } from 'mongoose'

const CommentField = ({ action, setReplying, index = undefined, replyingTo = undefined }) => {
    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext)
    let { blog, blog: { _id, author, author: { _id: blog_author }, comments, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentLoaded } = useContext(BlogContext)

    const [comment, setComment] = useState('')

    const handleComment = () => {
        if (!access_token) {
            return toast.error('Login first to leave a comment');
        }

        if (!comment || !comment.length) {
            return toast.error('Write something to leave a comment');
        }

        axios.post('http://localhost:3000/add-comment', { _id, blog_author, comment, replying_to: replyingTo }, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
            .then(({ data }) => {
                console.log(data);
                setComment('');
                toast.success('Comment added successfully');

                data.commented_by = { personal_info: { username, profile_img, fullname } };

                let newCommentsArr;

                if (replyingTo) {
                    comments.results[index].children.push(data._id)
                    data.childrenLevel = comments.results[index].childrenLevel + 1;
                    data.parentIndex = index;
                    comments.results[index].isReplyLoaded = true;

                    comments.results.splice(index + 1, 0, data);

                    newCommentsArr = comments.results;
                    setReplying(false);

                } else {
                    data.childrenLevel = 0;

                    newCommentsArr = [data, ...comments.results];
                }



                setBlog({
                    ...blog,
                    comments: { results: newCommentsArr },
                    activity: {
                        ...activity,
                        total_comments: total_comments + 1,
                        total_parent_comments: replyingTo ? total_parent_comments : total_parent_comments + 1
                    }
                });

                setTotalParentCommentLoaded(prevVal => prevVal + 1);
            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.error) {
                    console.log(err.response.data.error);
                } else {
                    console.log('An error occurred. Please try again.');
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
                className='btn-dark mt-5 px-8 text-sm sm:text-xl capitalize'>{action}</button>
        </>
    )
}

export default CommentField
