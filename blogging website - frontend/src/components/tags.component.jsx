import React, { useContext } from 'react'
import { EditorContext } from '../pages/editor.pages'

const Tag = ({ tag, tagIndex }) => {
    let { blog, blog: { tags }, setBlog } = useContext(EditorContext);

    const handleTagDelete = () => {
        tags = tags.filter(t => t !== tag);
        setBlog({ ...blog, tags })
    }

    const handleTagEdit = (e) => {
        if (e.key === 'Enter' || e.key === 'Comma') {
            e.preventDefault();
            let currentTag = e.target.innerText;
            tags[tagIndex] = currentTag;
            setBlog({ ...blog, tags })
            // console.log(blog);
            e.target.contentEditable = false;
        }
    }

    const addEditable = (e) => {
        e.target.contentEditable = true;
        e.target.focus()
    }

    return (
        <div className='relative p-2 mt-2 mr-2 bg-white rounded-full inline-flex items-center hover:bg-opacity-50 pr-10'>
            <p className='outline-none flex-grow'
                onClick={addEditable}
                onKeyDown={handleTagEdit}
            >{tag}</p>

            <button
                onClick={handleTagDelete}
                className='rounded-full right-3 top-[55%] transform -translate-y-1/2 absolute'>
                <i className='fi fi-rr-cross text-sm pointer-events-none text-sm mt-1.5 font-bold'></i>
            </button>
        </div>

    )
}

export default Tag
