import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from '../imgs/logo.png'
import defaultBanner from '../imgs/blog banner.png'
import AnimationWrapper from '../common/page-animation'
import { uploadImage } from '../common/aws'
import { Toaster, toast } from 'react-hot-toast'

const BlogEditor = () => {

    let blogBannerRef = useRef(null);

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        // console.log(img);
        if (img) {
            let loadingToast = toast.loading("Uploading Banner...");
            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Banner uploaded successfully");
                    console.log(url);
                    blogBannerRef.current.src = url;
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
    }


    return (
        <>
            <Toaster />
            <nav className='navbar'>
                <Link to='/' className='felx-none w-10'>
                    <img src={logo} alt="" />
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full '>

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
                                    ref={blogBannerRef}
                                    src={defaultBanner}
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
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor
