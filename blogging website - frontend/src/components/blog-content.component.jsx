import P from '@editorjs/image';
import React from 'react'

const Img = ({ url, caption }) => {
    return <div>
        <img src={url} alt="" />
        {caption.length ? <p className='w-full text-center my-3 md:mb-12 text-base text-dark-grey'>{caption}</p> : ''}
    </div>
}

const Quote = ({ quote, caption }) => {
    return (
        <div className='bg-purple/10 p-2 pl-5 border-l-4 border-purple'>
            <p className='text-xl leading-10 md:text-2xl'>{quote}</p>
            {
                caption.length ? <p className='w-full text-purple text-base'>{caption}</p> : ''
            }
        </div>
    )
}

const List = ({ style, items }) => {
    return (
        <ol className={`pl-5 ${style == 'ordered' ? 'list-decimal' : 'list-disc'}`}>
            {
                items.map((item, i) => {
                    return <li className='my-4' key={i} dangerouslySetInnerHTML={{ __html: item }}></li>
                })
            }
        </ol>
    )
}


const BlogContent = ({ block }) => {
    let { type, data } = block;

    if (type === 'paragraph') {
        return (
            <p dangerouslySetInnerHTML={{ __html: data.text }}></p>
        )
    }

    if (type === 'header') {
        if (data.level === 3) {
            return <h3 className='text-xl' dangerouslySetInnerHTML={{ __html: data.text }}></h3>
        }
        if (data.level === 2) {
            return <h2 dangerouslySetInnerHTML={{ __html: data.text }}></h2>
        }
    }

    if (type === 'image') {
        return (
            <Img url={data.file.url} caption={data.caption} />
        )
    }

    if (type === 'quote') {
        return <Quote quote={data.text} caption={data.caption} />
    }

    if (type === 'list') {
        return <List style={data.style} items={data.items} />
    }

}

export default BlogContent
