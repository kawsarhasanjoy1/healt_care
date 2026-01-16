import { Request } from "express";
import { imageUploadeIntoCloudinary } from "../../../helpers/multer.js";
import { TCloudinaryUploadResponse } from "../../../interface/global.js";
import prisma from "../../../shared/prisma.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { Prisma } from "@prisma/client";

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


const fetchSpecialties = async(filters: Record<string,any>,options: any) => {
    const { searchTerm} = filters;
    const {limit,page,skip} = calculatePagination(options)
    const andCondition: Prisma.SpecialtiesWhereInput[] = []
    if (searchTerm) {
        andCondition.push({
            OR: ['title','description'].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }
  
    const whereCondition = andCondition?.length > 0 ? {AND: andCondition} : {}
    const result = await prisma.specialties.findMany({
        include: {doctorSpecialties: true},
        where: whereCondition,
        skip,
        take: limit,
        orderBy: options?.sortBy && options?.sortOrder ? {[options?.sortBy]: options?.sortOrder} : {title: "asc"}
    });
    const total = await prisma.specialties.count({where: whereCondition})
    return{
        data: result,
        meta: {
            total,
            limit,
            page
        }
    };
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