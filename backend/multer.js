import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage untuk foto lomba
const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = join(__dirname, "uploads", "posts");
        // Pastikan direktori ada
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// Storage untuk foto profil
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = join(__dirname, "uploads", "profiles");
        // Pastikan direktori ada
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Gunakan format: profile-[userId]-[timestamp].[ext]
        cb(null, `profile-${req.user ? req.user.id : 'temp'}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Konfigurasi filter file (opsional tapi disarankan)
const imageFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Upload untuk post
const uploadPost = multer({ 
    storage: postStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload untuk profile
const uploadProfile = multer({ 
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB untuk profil
});

export { uploadPost, uploadProfile };