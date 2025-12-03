import multer from "multer";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';
import config from "../config/config.js";
import fs from 'fs';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
export const upload = multer({ storage: storage });
export const imageUploadeIntoCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.config({
            cloud_name: config.cloud_name,
            api_key: config.cloud_api_key,
            api_secret: config.cloud_secret,
        });
        cloudinary.uploader.upload(file.path, (error, result) => {
            fs.unlinkSync(file.path);
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
};
