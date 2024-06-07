import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import { Toaster, toast } from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'
import Tag from './tags.component'
import axios from 'axios'
import { UserContext } from '../App'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

const PublishForm = () => {
    let characterLimit = 200;
    let tagLimit = 10;

    let { blog, blog: { title, banner, content, des, tags }, setBlog, setEditorState } = useContext(EditorContext);
    let { userAuth: { access_token } } = useContext(UserContext)

    let { blog_id } = useParams();

    let navigate = useNavigate()

    const handleCloseEvent = () => {
        setEditorState("editor")
    }

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, title: input.value })
    }

    const handleBlogDesChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, des: input.value })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Comma') {
            e.preventDefault();

            let tag = e.target.value.trim().replace(',', '');

            if (tag.length && !tags.includes(tag) && tags.length < tagLimit) {
                setBlog({ ...blog, tags: [...tags, tag] });
            }

            e.target.value = '';
        }
    }

    const publishBlog = (e) => {
        if (e.target.className.includes('disable')) return

        if (!des.length || des.length > characterLimit) {
            return toast.error(`Blog description is required within ${characterLimit} charecters`)
        }
        if (!title.length) {
            return toast.error("Blog title is required")
        }
        if (!tags.length) {
            return toast.error("Blog tags are required for searching and ranking your blog post");
        }

        let loadingToast = toast.loading("Publishing...");
        e.target.classList.add('disable');

        let blogObj = {
            title,
            banner,
            content,
            tags,
            des,
            draft: false
        }

        axios.post('http://localhost:3000' + '/create-blog', { ...blogObj, id: blog_id }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            }
        }).then((res) => {
            toast.dismiss(loadingToast);
            toast.success("Published👍");
            setEditorState("editor");
            e.target.classList.remove('disable');

            setTimeout(() => {
                return navigate('/');
            }, 900)

        }).catch((err) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            return toast.error(err.response.data.error);
        })

    }

    return (
        <AnimationWrapper>
            <section className='w-screen grid grid-cols-1 lg:grid-cols-2 items-center py-16 lg:gap-4'>
                <Toaster />
                <button className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[5%]'
                    onClick={handleCloseEvent}
                >
                    <i className='fi fi-rr-cross'></i>
                </button>
                <div className="relative">

                    <div className='max-w-[550px] mx-auto'>
                        <p className='text-dark-grey mb-1'>Preview</p>

                        <div className='w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4'>
                            <img src={banner} alt="banner preview" />
                        </div>

                        <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2'>{title}</h1>

                        <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>{des} </p>
                    </div>
                </div>

                <div className='sm:mt-4 mt-20'>
                    <div className='border-grey lg:border-1 lg:pl-8'>
                        <p className='text-dark-grey mb-2 mt-2'>Blog Title</p>
                        <input className='input-box pl-4' type="text" placeholder='Blog Title' defaultValue={title}
                            onChange={handleBlogTitleChange}
                        />
                    </div>

                    <div className='border-grey lg:border-1 lg:pl-8'>
                        <p className='text-dark-grey mb-2 mt-9'>Short description about your Blog</p>
                        <textarea
                            className='h-40 resize-none leading-7 input-box pl-4'
                            maxLength={characterLimit}
                            defaultValue={des}
                            onChange={handleBlogDesChange}
                            onKeyDown={handleTitleKeyDown}
                            name="" id="">
                        </textarea>
                        <p className='mt-1 text-dark-grey text-sm text-right'>{characterLimit - des.length} characters left</p>

                        <p className='text-dark-grey mb-2 mt-9'>Topics - (Helps in searching and ranking your blog post)</p>
                        <div className='input-box relative pl-2 py-2 pb-4'>
                            <input
                                className='sticky input-box bg-white top-0 left-0 pl-4 mb-5 focus:bg-white'
                                type="text"
                                placeholder='Topics'
                                onKeyDown={handleKeyDown}
                            />
                            {
                                tags.map((tag, idx) => {
                                    return <Tag tagIndex={idx} key={idx} tag={tag} />
                                })
                            }

                        </div>
                        <p className='mt-1 mb-4 text-dark-grey text-sm text-right'>{tagLimit - tags.length} Tags left</p>


                        <button className='btn-dark px-8'
                            onClick={publishBlog}>
                            Publish
                        </button>
                    </div>
                </div>
            </section>
        </AnimationWrapper >
    )
}

export default PublishForm
