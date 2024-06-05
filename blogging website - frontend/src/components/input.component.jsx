import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'

const InputBox = ({ name, type, id, value, placeholder, icon }) => {
    const [passwordVisibile, setPasswordVisibile] = useState(false);
    

    return (
        <div className="relative w-[100%] mb-4">
            <input
                className='input-box '
                type={type === "password" ? (passwordVisibile ? "text" : "password") : type}
                id={id}
                name={name}
                defaultValue={value}
                placeholder={placeholder}
            />
            <i className={`fi ${icon} input-icon`}></i>

            {
                type === "password" &&
                <i
                    onClick={() => setPasswordVisibile(curr => !curr)}
                    className={`fi ${passwordVisibile ? "fi-rr-eye" : "fi-rr-eye-crossed"} input-icon left-[auto] right-4 cursor-pointer`}
                    id="eye"
                >
                </i>
            }
        </div>
    )
}

export default InputBox
