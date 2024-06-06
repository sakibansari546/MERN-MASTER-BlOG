import React from 'react'
import { Link } from 'react-router-dom';
import { getFullDay } from '../common/date.jsx';

const AboutUser = ({ bio, social_links, joinedAt, className }) => {
    return (
        <div className={`md:w0[90%] md:mt-7 ${className}`}>
            <p className='text-xl leading-7'>{bio.length ? bio : "Nothing to read here"}</p>
            <div className='flex gap-x-7 gap-y-2 flex-wrap itmes-center my-7 text-dark-grey'>
                {
                    Object.keys(social_links).map((key, index) => {
                        let link = social_links[key];
                        return link ?
                            <Link to={link} key={key} target='_blank'>
                                <i className={`fi ${key !== 'website' ? 'fi-brands-' + key : 'fi-rr-globe'} text-2xl hover:text-black`}></i>
                            </Link> : ""
                    })
                }
            </div>

            <p className='text-xl leading-7 text-dark-grey '>Joined on <b>{getFullDay(joinedAt)}</b></p>
        </div>
    )
}



export default AboutUser
