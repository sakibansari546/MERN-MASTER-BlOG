import React from 'react'

const NoDataMessage = ({ message }) => {
    return (
        <div className='text-center w-full p-4 rounded-lg bg-grey/50 mt-4'>
            <p>{message}</p>
        </div>
    )
}

export default NoDataMessage
