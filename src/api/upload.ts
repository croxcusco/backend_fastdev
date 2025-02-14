import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ 
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now());
        }
    })
});

const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
    console.log("Inicio de la solicitud de subida de archivo");
    console.log("Archivo recibido:", req.file);

    if (!req.file) {
        console.error("No se ha subido ningún archivo");
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verificar que el archivo es una imagen
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
        console.error("Tipo de archivo no válido:", req.file.mimetype);
        return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    try {
        console.log("Subiendo archivo a Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log("Archivo subido a Cloudinary:", result);

        return res.json({
            message: "Archivo subido correctamente",
            fileUrl: result.secure_url
        });
    } catch (error) {
        console.error("Error al subir el archivo a Cloudinary:", error);
        return res.status(500).json({ error: 'Error al subir el archivo a Cloudinary' });
    }
});

export default router;
