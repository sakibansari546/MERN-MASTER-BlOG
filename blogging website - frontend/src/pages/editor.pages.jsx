import React, { createContext, useContext, useState } from 'react'
import { UserContext } from '../App'
import { Navigate } from 'react-router-dom';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';

const bolgStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: "",
    author: { personal_info: {} },
}
export const EditorContext = createContext({})

const Editor = () => {
    const [editorState, setEditorState] = useState('editor')
    const [blog, setBlog] = useState(bolgStructure);


    let { userAuth, userAuth: { access_token } } = useContext(UserContext);

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState }}>
            {
                access_token === null ? <Navigate to='/signin' />
                    : editorState === 'editor' ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>
    )
}

export default Editor
