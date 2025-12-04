import { imageUploadeIntoCloudinary } from "../../../helpers/multer.js";
import prisma from "../../../shared/prisma.js";
const createSpecialties = async (req) => {
    const payload = req.body;
    const file = req.file;
    if (file) {
        const cloudinary = await imageUploadeIntoCloudinary(file);
        payload.icon = cloudinary.secure_url;
    }
    const result = await prisma.specialties.create({ data: payload });
    return result;
};
const fetchSpecialties = async () => {
    const result = await prisma.specialties.findMany();
    return result;
};
const deleteSpecialties = async (specialtiesId) => {
    const result = await prisma.specialties.delete({ where: { id: specialtiesId } });
    return result;
};
export const specialtiesServices = {
    createSpecialties,
    fetchSpecialties,
    deleteSpecialties,
};
