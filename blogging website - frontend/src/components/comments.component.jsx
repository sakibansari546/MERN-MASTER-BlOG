import React, { useContext } from 'react'
import { BlogContext } from '../pages/blog.page'
import CommentField from './comment-field.component'
import axios from 'axios';
import NoDataMessage from './nodata.component';
import AnimationWrapper from '../common/page-animation';
import CommentCard from './comment-card.component';


export const fetchComment = async ({ blog_id, setParentCommentCountFun, skip = 0, comment_array = [] }) => {
    try {
        const { data } = await axios.post('http://localhost:3000/get-blog-comments', { blog_id, skip });

        data.comments.forEach(comment => {
            comment.childrenLevel = 0;
        });

        setParentCommentCountFun(prevVal => prevVal + data.comments.length);

        return {
            results: [...comment_array, ...data.comments]
        };
    } catch (err) {
        console.error(err);
        return { results: comment_array };
    }
};




const CommentsContainer = ({ }) => {
    let { blog, setBlog, blog: { _id, title, comments: { results: commentArr, }, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, lotalParentCommentLoaded, setTotalParentCommentLoaded } = useContext(BlogContext)


    const loadMoreComments = async () => {
        let newCommentsArry = await fetchComment({ blog_id: _id, skip: lotalParentCommentLoaded, setParentCommentCountFun: setTotalParentCommentLoaded, comment_array: commentArr });

        setBlog({ ...blog, comments: newCommentsArry })
    }

    return (
        <div className={`max-sm:w-full bg-white fixed ${commentsWrapper ? 'top-0 sm:right-0' : 'top-[100%] sm:right-[-100%]'} duration-700 max-sm:right-0 sm:top-0 w-[40%] min-w-[350px] h-full z-50 shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}>

            <div className='relative '>
                <h1 className='text-xl font-medium'>Comments</h1>
                <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>{title}</p>
                <button onClick={() => setCommentsWrapper(preVal => !preVal)} className='absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey'>
                    <i className="fi fi-br-cross text-xl mt-1"></i>
                </button>
            </div>

            <hr className='border-grey my-8 w-[120%] -ml-10' />
            <CommentField action={'comment'} />

            {
                commentArr && commentArr.length > 0 ?
                    commentArr.map((comment, i) => {
                        return <AnimationWrapper key={i}>
                            <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment} />
                        </AnimationWrapper>
                    }) : <NoDataMessage message={'No comments yet'} />
            }

            {
                (total_parent_comments > lotalParentCommentLoaded) &&
                <button onClick={loadMoreComments} className='text-dark-grey p-2 px-3 hover:bg-grey/50 rounded-md flex items-center gap-2 underline'>
                    Loadmore
                </button>

            }

        </div >
    )
}

export default CommentsContainer
