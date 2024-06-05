import React from 'react'
import { Link } from 'react-router-dom';

const UserCard = ({ user }) => {
    let { personal_info: { username, fullname, profile_img } } = user;

    return (
        <Link to={`/user/${username}`}
            className='flex gap-5 items-center mb-8'>
            <img className='w-12 h-12 rounded-full' src={profile_img} alt={username} />

            <div>
                <h1 className='font-bold text-lg line-clamp-2'>{fullname}</h1>
                <h1 className='text-sm text-dark-grey'>@{username}</h1>
            </div>
        </Link >
    )
}

export default UserCard
