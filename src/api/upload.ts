import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();

const router = express.Router();

const isValidImage = (mimetype: string) => {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validMimeTypes.includes(mimetype);
};

const uploadToCloudinary = async (buffer: Buffer) => {
    try {
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${buffer.toString('base64')}`);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir el archivo a Cloudinary');
    }
};

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!isValidImage(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    try {
        const fileUrl = await uploadToCloudinary(req.file.buffer);
        return res.json({
            message: "Archivo subido correctamente",
            fileUrl
        });
    } catch (error) {
        return res.status(500).json({ error: (error as any)?.message || 'Error al subir el archivo' });
    }
});

router.post('/uploads', upload.array('files', 10), async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const invalidFiles = (req.files as Express.Multer.File[]).filter(file => !validMimeTypes.includes(file.mimetype));

    if (invalidFiles.length > 0) {
        return res.status(400).json({ error: 'Invalid file types. Only images are allowed.' });
    }

    try {
        const uploadPromises = (req.files as Express.Multer.File[]).map(file => uploadToCloudinary(file.buffer));
        const fileUrls = await Promise.all(uploadPromises);

        return res.json({
            message: "Archivos subidos correctamente",
            fileUrls
        });
    } catch (error) {
        return res.status(500).json({ error: (error as any)?.message || 'Error al subir los archivos' });
    }
});

export default router;
