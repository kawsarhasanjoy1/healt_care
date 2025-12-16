import { Admin, Prisma, userStatus } from "@prisma/client"
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import prisma from "../../../shared/prisma.js";
import { adminSearchableFields } from "./constance.js";


const adminFromDB = async(query: Record<string,any>,options: Record<string,any>) => {
    const {searchTerm, ...filter } = query;
    const { page , limit, skip, sortOrder, sortBy} = calculatePagination(options);
    const andCondition: Prisma.AdminWhereInput[] = []
    if (searchTerm) {
       andCondition.push({
         OR: adminSearchableFields.map((field) => ({
                [field]: { contains: searchTerm , mode: 'insensitive'}
        }))
       }) 
    }

    if (Object.keys(filter).length > 0) {
       andCondition.push({
        AND: Object.keys(filter).map((key) => ({
        [key] : {
            equals: filter[key]
        }
       }))
       })
    }
   andCondition.push({
    isDeleted: false
   })
    const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
    const result = await prisma.admin.findMany({ where: whereCondition,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? {[sortBy]: sortOrder} : {createdAt: "desc"}
});
const total = await prisma.admin.count({where: whereCondition})

    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    }
}


const getByIdFromDB = async(id: any): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({where: {id, isDeleted: false}})
  const result = await prisma.admin.findUnique({where: {id}}) 
  return result
}


const updateIntoDB = async(id:string, data:Partial<Admin | any>) => {
  await prisma.admin.findUniqueOrThrow({where: {id, isDeleted: false}})
  const result = await prisma.admin.update(
    {where: {
        id
    },
     data
    }
)
return result
}
const deletedIntoDB = async(id:string): Promise<Admin | any> => {
 await prisma.admin.findUniqueOrThrow({where: {id, isDeleted: false}})
const result = await prisma.$transaction(async(transaction) => {
    const deleteAdmin = await transaction.admin.delete({where: {id}})
    await transaction.users.delete({where: {email: deleteAdmin?.email}})
    return deleteAdmin;
})
return result
}
const softDeletedIntoDB = async(id:string): Promise<Admin | any> => {
 await prisma.admin.findUniqueOrThrow({where: {id, isDeleted: false}})
const result = await prisma.$transaction(async(transaction) => {
    const deleteAdmin = await transaction.admin.update({where: {id}, data: {isDeleted: true}})
    await transaction.users.update({where: {email: deleteAdmin?.email},data: {status: userStatus.DELETED}})
    return deleteAdmin;
})
return result
}


export const adminServices = {
    adminFromDB,
    getByIdFromDB,
    updateIntoDB,
    deletedIntoDB,
    softDeletedIntoDB
}