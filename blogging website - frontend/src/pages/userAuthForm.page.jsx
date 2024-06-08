import axios from 'axios';
import React, { useContext, useRef } from 'react';
import InputBox from '../components/input.component';
import googleIcon from '../imgs/google.png';
import { Link, Navigate } from 'react-router-dom';
import AnimationWrapper from '../common/page-animation';
import { Toaster, toast } from 'react-hot-toast';
import { storeInSession } from '../common/session';
import { UserContext } from '../App';
import { authWithGoogle } from '../common/firebase';


const UserAuthForm = ({ type }) => {

    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext);


    // Function to handle authentication through the server
    const userAuthThroughserver = async (serverRoute, formData) => {
        try {
            const response = await axios.post(`http://localhost:3000${serverRoute}`, formData);
            const data = response.data;

            if (data.access_token) {
                toast.success("Login successful");
                storeInSession('user', data);
                setUserAuth(data);
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            if (err.response && err.response.status === 403) {
                toast.error(err.response.data.error);
            } else {
                toast.error("An error occurred. Please try again.");
                console.error(err);
            }
        }
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const serverRoute = type === 'sign-in' ? "/signin" : "/signup";
        const form = new FormData(authForm);

        const formData = {};
        for (const [key, value] of form.entries()) {
            formData[key] = value;
        }

        const { fullname, email, password } = formData;

        if (fullname && fullname.length < 3) {
            return toast.error("Fullname must be greater than 3 letters");
        }

        if (!email.length) {
            return toast.error("Email is required");
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return toast.error("Invalid email");
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if (!passwordRegex.test(password)) {
            return toast.error("Password should be 6 to 20 characters long with numeric, 1 lowercase, and 1 uppercase letter");
        }

        userAuthThroughserver(serverRoute, formData);
    };

    // Function to handle Google authentication
    const handleGoogleAuth = async (e) => {
        e.preventDefault();

        try {
            const user = await authWithGoogle();
            const serverRoute = "/google-auth";
            const formData = {
                access_token: user.accessToken
            };
            // console.log(user);
            await userAuthThroughserver(serverRoute, formData);
        } catch (err) {
            toast.error('Login failed');
            console.error(err.message);
        }
    };


    return (
        <>
            {access_token ? (
                <Navigate to='/' />
            ) : (
                <AnimationWrapper keyValue={type}>
                    <section className='h-cover flex items-center justify-center'>
                        <Toaster /> {/* Toaster for displaying notifications */}
                        <form id='authForm' className='w-[80%] max-w-[400px]'>
                            <h1 className='text-4xl font-gelasio capitalize text-center mb-8'>
                                {type === "sign-in" ? "Welcome back" : "Join us today"}
                            </h1>

                            {/* Show the full name input only for sign-up */}
                            {type !== "sign-in" && (
                                <InputBox name='fullname' type='text' placeholder='Full name' icon='fi-rr-user' />
                            )}

                            <InputBox name='email' type='email' placeholder='Email' icon='fi-rr-at' />
                            <InputBox name='password' type='password' placeholder='Password' icon='fi-rr-key' />

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

                            <button className='flex btn items-center justify-center gap-4 w-[90%] center border border-dark-grey py-2 rounded-full'
                                onClick={handleGoogleAuth}
                            >
                                <img src={googleIcon} alt="google icon" className='w-5' />
                                Continue With Google
                            </button>

                            {type === 'sign-in' ? (
                                <p className='text-center mt-4 text-dark-grey text-center mt-6'>
                                    Don't have an account?
                                    <Link to="/signup" className='underline text-black text-l ml-2'>Sign up</Link>
                                </p>
                            ) : (
                                <p className='text-center mt-4 text-dark-grey text-center mt-6'>
                                    Already a member?
                                    <Link to="/signin" className='underline text-black text-l ml-2'>Sign In</Link>
                                </p>
                            )}
                        </form>
                    </section>
                </AnimationWrapper>
            )}
        </>
    )
}

export default UserAuthForm;
