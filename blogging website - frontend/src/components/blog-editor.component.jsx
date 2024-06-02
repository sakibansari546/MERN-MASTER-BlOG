import React, { useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from '../imgs/logo.png'
import defaultBanner from '../imgs/blog banner.png'
import AnimationWrapper from '../common/page-animation'
import { uploadImage } from '../common/aws'
import { Toaster, toast } from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'

const BlogEditor = () => {
    let { blog, blog: { title, banner, content, des, tags }, setBlog } = useContext(EditorContext);

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        // console.log(img);
        if (img) {
            let loadingToast = toast.loading("Uploading Banner...");
            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("uploaded 👍");
                    console.log(url);
                    setBlog({ ...blog, banner: url });
                }
            })
                .catch(error => {
                    toast.dismiss(loadingToast);
                    return toast.error(error.message);
                })
        }
    }

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target; // Correct the typo here
        input.style.height = 'auto'; // Reset the height
        input.style.height = input.scrollHeight + 'px'; // Set it to the scroll height
        setBlog({ ...blog, title: input.value });
    }

    const handleBannerError = (e) => {
        let img = e.target;
        img.src = defaultBanner;
    }

    return (
        <>
            <Toaster />
            <nav className='navbar'>
                <Link to='/' className='felx-none w-10'>
                    <img src={logo} alt="" />
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full '>
                    {title.length ? title : "New Blog Title"}
                </p>

                <div className='flex gap-4 ml-auto '>
                    <button className='btn-dark py-2 text-xl'>
                        Publish
                    </button>
                    <button className='btn-light py-2 text-xl'>
                        Save Draft
                    </button>
                </div>
            </nav>

            <AnimationWrapper>
                <section className=''>
                    <div className='mx-auto max-w-[900px] w-full'>
                        <div className='relative aspect-video bg-white border-4 border-grey hover:opacity-80'>
                            <label htmlFor="uploadBanner">
                                <img
                                    onError={handleBannerError}
                                    src={banner}
                                    alt="blog banner"
                                    className='z-20 cursor-pointer'
                                />

                                <input type="file"
                                    name=""
                                    id="uploadBanner"
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>
                        <textarea
                            placeholder='Blog Title'
                            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        >
                        </textarea>

                        <hr className='w-full opacity-10 my-5' />

                        <div id="textEditor" className='font-gelasio' >
                            
                        </div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor
