import { generateImgUploadURL } from '../config/s3Config.js';

export const getUploadURL = async (req, res) => {
    try {
        const url = await generateImgUploadURL();
        res.status(200).json({ uploadURL: url });
    } catch (error) {
        res.status(400).json({ "error": error });
    }
};
