import axios from 'axios'
export const uploadImage = async (img) => {
    let imgURL = null;
    await axios.get('http://localhost:3000/get-upload-url')
        .then(async ({ data: { uploadURL } }) => {
            await axios({
                method: 'PUT',
                url: uploadURL,
                data: img,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(() => {
                imgURL = uploadURL.split("?")[0];
            })
        })
    return imgURL;
}