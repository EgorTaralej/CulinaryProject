const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileStr = req.file.buffer.toString('base64');
        const fileType = req.file.mimetype;

        const uploadResponse = await cloudinary.uploader.upload(
            `data:${fileType};base64,${fileStr}`,
            { folder: 'culinary_app' }
        );

        res.json({ imageUrl: uploadResponse.secure_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Cloudinary upload failed' });
    }
});

module.exports = router;