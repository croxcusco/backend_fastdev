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

const uploadMultiple = multer({ 
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

const isValidImage = (mimetype: string) => {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validMimeTypes.includes(mimetype);
};

const uploadToCloudinary = async (filePath: string) => {
    try {
        console.log("Subiendo archivo a Cloudinary...");
        const result = await cloudinary.uploader.upload(filePath);
        console.log("Archivo subido a Cloudinary:", result);
        return result.secure_url;
    } catch (error) {
        console.error("Error al subir el archivo a Cloudinary:", error);
        throw new Error('Error al subir el archivo a Cloudinary');
    }
};

router.post('/upload', upload.single('file'), async (req, res) => {
    console.log("Inicio de la solicitud de subida de archivo");
    console.log("Archivo recibido:", req.file);

    if (!req.file) {
        console.error("No se ha subido ningún archivo");
        return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!isValidImage(req.file.mimetype)) {
        console.error("Tipo de archivo no válido:", req.file.mimetype);
        return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    try {
        const fileUrl = await uploadToCloudinary(req.file.path);
        return res.json({
            message: "Archivo subido correctamente",
            fileUrl
        });
    } catch (error) {
        return res.status(500).json({ error: (error as any)?.message || 'Error al subir el archivo' });
    }
});

router.post('/uploads', uploadMultiple.array('files', 10), async (req, res) => {
    console.log("Inicio de la solicitud de subida de múltiples archivos");
    console.log("Archivos recibidos:", req.files);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.error("No se han subido archivos");
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const invalidFiles = (req.files as Express.Multer.File[]).filter(file => !validMimeTypes.includes(file.mimetype));

    if (invalidFiles.length > 0) {
        console.error("Tipos de archivo no válidos:", invalidFiles.map(file => file.mimetype));
        return res.status(400).json({ error: 'Invalid file types. Only images are allowed.' });
    }

    try {
        const uploadPromises = (req.files as Express.Multer.File[]).map(file => uploadToCloudinary(file.path));
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
