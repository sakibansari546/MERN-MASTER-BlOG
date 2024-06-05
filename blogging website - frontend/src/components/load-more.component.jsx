import React from 'react'

const LoadMoreDataBtn = ({ state, fetchDataFun }) => {
    if (state !== null && state.totalDocs > state.results.length) {
        return (
            <div className='w-full flex items-center justify-center mb-6 underline'>
                <button className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'
                    onClick={() => fetchDataFun({ page: state.page + 1 })}>
                    Load More
                </button>
            </div>
        )
    }
}

export default LoadMoreDataBtn
