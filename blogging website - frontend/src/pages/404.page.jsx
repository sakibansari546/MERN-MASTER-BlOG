import React from 'react'
import pageNotFoundImg from '../imgs/404.png'
import { Link } from 'react-router-dom'
import fullLogo from '../imgs/full-logo.png'

const PageNotFound = () => {
    return (
        <section className='h-cover relative p-10 flex flex-col items-center gap-10 text-center'>
            <img className='select-none border-2 border-grey w-72 aspect-square object-cover rounded-md' src={pageNotFoundImg} alt="" />
            <h1 className='text-4xl font-gelasio leading-7'>Page not found</h1>
            <p className='text-dark-grey text-xl leading-7 -mt-0'>The page looking for does not exists. Head back to the <Link className='text-black underline' to='/'>home</Link> page</p>
            <div className='mt-auto'>
                <img className='h-8 object-contain block mx-auto select-none' src={fullLogo} alt="" />
                <p className='text-dark-grey'>Read millons of stories around the world</p>
            </div>
        </section>
    )
}

export default PageNotFound
