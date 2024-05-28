import React, { useState } from 'react'
import logo from '../imgs/logo.png'
import { Link } from 'react-router-dom'

const Navbar = () => {

    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

    return (
        <nav className='navbar'>

            <Link to='/' className='flex-none w-10 cursor-pointer'>
                <img src={logo} alt="logo" className='w-full' />
            </Link>

            <div className={`absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ${searchBoxVisibility ? "show" : "hide"}`}>

                <input type="text" placeholder='Search' className='w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full md
                pl-12' />
                <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
            </div>

            <div className='flex items-center gap-3 md:gap-6 ml-auto'>

                <button onClick={() => setSearchBoxVisibility(currentVal => !currentVal)} className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center'>
                    <i className={`fi ${searchBoxVisibility ? "fi-rr-cross" : "fi-rr-search"} text-xl text-dark-grey font-semibold transition-all`}> </i>
                </button>

                <Link to='/editor' className='hidden md:flex gap-2 link '>
                    <i class="fi fi-rr-file-edit"></i>
                    <p>Write</p>
                </Link>

                <Link to='/signin' className='btn-dark py-2'>
                    Sign In
                </Link>
                <Link to='/signup' className='btn-light py-2 hidden md:block'>
                    Sign Up
                </Link>

            </div>



        </nav >
    )
}

export default Navbar
