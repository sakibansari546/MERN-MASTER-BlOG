import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserContext } from '../App'
import { Navigate, useParams } from 'react-router-dom';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';
import Loader from '../components/loader.component';
import axios from 'axios';

export const bolgStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: "",
    author: { personal_info: {} },
}
export const EditorContext = createContext({})

const Editor = () => {

    let { blog_id } = useParams()

    const [editorState, setEditorState] = useState('editor')
    const [blog, setBlog] = useState(bolgStructure);
    const [textEditor, setTextEditor] = useState({ isReady: false });
    const [loading, setLoading] = useState(true);

    let { userAuth, userAuth: { access_token } } = useContext(UserContext);



    useEffect(() => {
        if (!blog_id) {
            return setLoading(false);
        }

        axios.post('http://localhost:3000/get-blog', { blog_id, draft: true, mode: 'edit' })
            .then(({ data: { blog } }) => {
                setBlog(blog)
                setLoading(false);
            }).catch(err => {
                setBlog(bolgStructure)
                setLoading(false)
            })

    }, [])

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor, }}>
            {
                access_token === null ? <Navigate to='/signin' /> :
                    loading ? <Loader /> :
                        editorState === 'editor' ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>
    )
}

export default Editor
