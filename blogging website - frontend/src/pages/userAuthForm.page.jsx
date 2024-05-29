import React, { useRef } from 'react'
import InputBox from '../components/input.component'
import googleIcon from '../imgs/google.png'
import { Link } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation'

const UserAuthForm = ({ type }) => {

    const authForm = useRef()

    const handleSubmit = (e) => {
        e.preventDefault()

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        //  formData
        let form = new FormData(authForm.current)

        let formData = {}

        for (let [key, value] of form.entries()) {
            formData[key] = value
        }
        console.log(formData);

        let { fullname, email, password } = formData;

        // Validating the data from frontend
        if (fullname) {
            if (fullname.length < 3) {
                return console.log({
                    'error': "Fullname must be graterthan 3 letter"
                })
            }
        }

        if (!email.length) {
            return console.log({
                'error': "Email is required"
            })
        }

        if (!emailRegex.test(email)) {
            return console.log({
                'error': "Invalid email"
            })
        }

        if (!passwordRegex.test(password)) {
            return console.log({
                'error': "Password should be 6 to 20 charecters long with numaric, 1 lowercase and 1 uppercase lettes"
            })
        }
    }

    return (
        <AnimationWrapper keyValue={type}>
            <section className='h-cover flex items-center justify-center'>
                <form ref={authForm} className='w-[80%] max-w-[400px]'>
                    <h1 className='text-4xl font-gelasio capitalize text-center mb-8'>
                        {type === "sign-in" ? "Welcome back" : "Join us today"}
                    </h1>

                    {
                        type != "sign-in" && <InputBox name='fullname' type='text' placeholder='Full name' icon='fi-rr-user' />
                    }

                    <InputBox
                        name='email'
                        type='email'
                        placeholder='Email'
                        icon='fi-rr-at'
                    />

                    <InputBox
                        name='password'
                        type='password'
                        placeholder='Password'
                        icon='fi-rr-key'
                    />

                    <button
                        onClick={handleSubmit}
                        className='btn-dark text-lg center mt-6 capitalize'>
                        {type.replace("-", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-4 opacity-10 uppercase text-black font-bold ">
                        <hr className="w-1/2 border-black" />
                        <p>or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    <button className='flex btn items-center justify-center gap-4 w-[90%] center border border-dark-grey py-2 rounded-full'>
                        <img src={googleIcon} alt="google icon"
                            className='w-5'
                        />
                        Continue With Google
                    </button>

                    {
                        type == 'sign-in' ?
                            <p className='text-center mt-4 text-dark-grey text-center mt-6'>
                                Don't have an account?
                                <Link to="/signup" className='underline text-black text-l ml-2'>Sign up</Link>
                            </p> :
                            <p className='text-center mt-4 text-dark-grey text-center mt-6'>
                                Already a member?
                                <Link to="/signin" className='underline text-black text-l ml-2'>Sign In</Link>
                            </p>
                    }

                </form>
            </section>
        </AnimationWrapper>
    )
}

export default UserAuthForm
