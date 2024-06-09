import { toast } from 'react-hot-toast';
import React, { useContext, useState } from 'react';
import { getDay } from '../common/date';
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import CommentField from './comment-field.component';
import { BlogContext } from '../pages/blog.page';
import axios from 'axios';

const CommentCard = ({ index, leftVal, commentData }) => {
    let { commented_by: { personal_info: { profile_img, username: commented_by_username, fullname } }, commentedAt, comment, _id, children = [] } = commentData;

    let { blog: { activity: { total_parent_comments }, activity, comments: { results: commentArr }, author: { personal_info: { username: blog_author } } }, setBlog, blog, setTotalParentCommentLoaded } = useContext(BlogContext);
    let { userAuth: { access_token, username } } = useContext(UserContext);

    const [isReplying, setReplying] = useState(false);

    const getParentIndex = () => {
        let startingPoint = index - 1;
        try {
            while (commentArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch (error) {
            startingPoint = undefined
            console.log(error);
        }
        return startingPoint;
    }

    const handleReplyClick = () => {
        if (!access_token) {
            toast.error('Login first to reply');
        }
        setReplying(preVal => !preVal);
    };

    const removeCommentsCards = (startingPoint, isDelete) => {
        if (commentArr[startingPoint]) {
            while (commentArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentArr.splice(startingPoint, 1);
                if (!commentArr[startingPoint]) {
                    break;
                }
            }
        }

        if (isDelete) {
            let parentIndex = getParentIndex()
            if (parentIndex !== undefined) {
                commentArr[parentIndex].children = commentArr[parentIndex].children.filter(child => child._id !== _id);

                if (!commentArr[parentIndex].children.length === 0) {
                    commentArr[parentIndex].isReplyLoaded = false;
                }
            }
            commentArr.splice(index, 1);
        }

        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentCommentLoaded(preVal => preVal - 1);
        }

        setBlog({ ...blog, comments: { results: commentArr }, activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0) } });
    };

    const loadReply = ({ skip = 0 }) => {
        if (children.length) {
            hideReply();

            axios.post('http://localhost:3000/get-replies', { _id, skip })
                .then(({ data: { replies } }) => {
                    console.log(replies);
                    commentData.isReplyLoaded = true;
                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentData.childrenLevel + 1;
                        commentArr.splice(index + 1 + i + skip, 0, replies[i]);
                    }
                    setBlog({ ...blog, comments: { results: commentArr } });
                }).catch(err => console.log(err));
        }
    };

    const deleteComment = (e) => {
        e.target.disabled = true;

        axios.post('http://localhost:3000/delete-comment', { _id }, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }).then(() => {
            e.target.disabled = false;
            removeCommentsCards(index + 1, true);
            toast.success('Comment deleted successfully');
        }).catch(err => {
            e.target.disabled = false;
            console.log(err);
        });

    }

    const hideReply = () => {
        commentData.isReplyLoaded = false;
        removeCommentsCards(index + 1);
    };

    return (
        <div className='w-full' style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className='my-5 p-6 rounded-md border border-grey'>
                <Link to={`/user/${username}`} className='flex gap-3 items mb-3'>
                    <img className='h-6 w-6 rounded-full' src={profile_img} alt="profile_img" />
                    <p className='line-clamp-1'>@{commented_by_username}</p>
                    <p className='min-w-fit text-dark-grey font-medium'>{getDay(commentedAt)}</p>
                </Link>

                <p className='text-xl ml-3 font-gelasio mb-2'>{comment}</p>

                <div className='w-full flex gap-5 items-center justify-between'>
                    <div className='flex gap-5 items-center mt-2'>
                        {
                            children.length > 0 && (
                                commentData.isReplyLoaded ?
                                    <button
                                        onClick={hideReply}
                                        className='text-dark-grey p-2 px-3 hover:bg-grey/80 flex items-center gap-2'>
                                        <i className="fi fi-rs-comment-dots"></i>Hide Reply
                                    </button> :
                                    <button
                                        onClick={loadReply}
                                        className='text-dark-grey p-2 px-3 hover:bg-grey/80 flex items-center gap-2'>
                                        <i className="fi fi-rs-comment-dots"></i>
                                        {children.length} Reply
                                    </button>
                            )
                        }
                        <button onClick={handleReplyClick} className='underline text-dark-grey'>Reply</button>
                    </div>
                    <div>
                        {
                            (username === commented_by_username || username === blog_author) &&
                            <button
                                onClick={deleteComment}
                                className='flex items-center text-dark-grey p-2 px-3  hover:bg-red/30 hover:text-red'>
                                <i className="fi fi-rs-trash pointer-events-none"></i>
                            </button>
                        }
                    </div>
                </div>
                {
                    isReplying &&
                    <div className='mt-8'>
                        <CommentField index={index} replyingTo={_id} setReplying={setReplying} action='reply' />
                    </div>
                }
            </div>
        </div>
    );
};

export default CommentCard;
