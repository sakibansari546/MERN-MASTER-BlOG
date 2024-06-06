import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export const blogStructure = ({
    title: "",
    content: [],
    tags: [],
    author  : { personal_info: {} },
    banner: '',
    publishedAt: ''
})

const BlogPage = () => {
    let { blog_id } = useParams();

    let [blog, setBlog] = useState(blogStructure);
    let { title, banner, content, author: { personal_info: { username, fullname, profile_img } }, publishedAt } = blog;

    const fetchBlog = () => {
        axios.post('http://localhost:3000/get-blog', { blog_id })
            .then(({ data: { blog } }) => {
                console.log(blog)
                setBlog(blog);
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        fetchBlog();
    }, [])

    return (
        <div>
            <h1>{title}</h1>
        </div>
    )
}

export default BlogPage
