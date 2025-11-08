import bcrypt from 'bcrypt';
import { userRole } from '../../constance/global.js'; 
import { adminSearchableFields } from './constance.js';
import { calculatePagination } from '../../../helpers/paginationHelpers.js';
import prisma from '../../../shared/prisma.js';
import { Prisma, userStatus } from '../../../../generated/prisma/client.js';

type CreateAdminPayload = {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto: string;
    contactNumber: string;
    needPasswordCng?: boolean;
    status: 'ACTIVE' | 'BLOCKED';
  };
};

export const createAdmin = async (payload: CreateAdminPayload) => {
  const { admin , password } = payload;

  const hashPass = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: hashPass,
        profilePhoto: admin.profilePhoto,
        contactNumber: admin.contactNumber,
        needPasswordCng: admin.needPasswordCng ?? false,
        role: userRole.ADMIN,           
        status: admin.status,           
      },
    });

    const adminRow = await tx.admin.create({
      data: {
        name: admin.name,
        email: admin.email,             
        profilePhoto: admin.profilePhoto,
        contactNumber: admin.contactNumber,
      },
    });

    return { user, admin: adminRow };
  });

  return result;
};




const userFromDB = async(query: Record<string,any>,options: Record<string,any>) => {
    const {searchTerm, ...filter } = query;
    const { page , limit, skip, sortOrder, sortBy} = calculatePagination(options);
    const andCondition = []
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
 
    const whereCondition: Prisma.UsersWhereInput = { AND: andCondition };
    const result = await prisma.users.findMany({ where: whereCondition,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? {[sortBy]: sortOrder} : {createdAt: "desc"}
});
const total = await prisma.users.count({where: whereCondition})

    return {
      meta: {
        page,
        limit,
        total
      },
      data: result
    }
}


const getByIdFromDB = async(id: any) => {
  const result = await prisma.users.findUniqueOrThrow({where: {id, status: userStatus.ACTIVE}}) 
  return result
}

export const userServices = { createAdmin , userFromDB , getByIdFromDB};