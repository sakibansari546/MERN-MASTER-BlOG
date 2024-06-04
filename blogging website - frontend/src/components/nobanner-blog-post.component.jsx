import React from 'react'
import { Link } from 'react-router-dom';
import getDay from '../common/date';

const MinimalBlogPost = ({ content, author, index }) => {
    let { publishedAt, title, blog_id: id } = content;
    let { fullname, username, profile_img } = author;
    return (
        <Link to={`/blog/${id}`} className='flex gap-5 mb-8 pb-4 border-b border-grey'>
            <h1 className='blog-index'>{index < 10 ? "0" + (index + 1) : index + 1}</h1>
            <div>
                <div className='flex gap-2 items-center mb-7'>
                    <img className='w-6 h-6 rounded-full' src={profile_img} alt="" />
                    <p className='line-clamp-1'> {fullname} @{username}</p>
                    <p className='min-w-fit'>{getDay(publishedAt)}</p>
                </div>
                <h1 className='blog-title '>{title}</h1>
            </div>
        </Link>
    )
}

export default MinimalBlogPost
