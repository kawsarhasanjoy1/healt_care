import { Request } from "express";
import { imageUploadeIntoCloudinary } from "../../../helpers/multer.js";
import { TCloudinaryUploadResponse } from "../../../interface/global.js";
import prisma from "../../../shared/prisma.js";

const createSpecialties = async(req: Request) => {
const payload = req.body;
const file = req.file;
if (file) {
    const cloudinary: TCloudinaryUploadResponse | any = await imageUploadeIntoCloudinary(file);
    payload.icon = cloudinary.secure_url
}
const result = await prisma.specialties.create({data: payload})
return result
}


const fetchSpecialties = async() => {
    const result = await prisma.specialties.findMany();
    return result;
}

const deleteSpecialties = async(specialtiesId:string) => {
    const result = await prisma.specialties.delete({where: {id: specialtiesId}});
    return result;
}


export const specialtiesServices = {
createSpecialties,
fetchSpecialties,
deleteSpecialties,
}