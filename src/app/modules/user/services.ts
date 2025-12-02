import bcrypt from 'bcrypt';
import { userRole } from '../../constance/global.js'; 
import { calculatePagination } from '../../../helpers/paginationHelpers.js';
import prisma from '../../../shared/prisma.js';
import { Prisma, userStatus } from '../../../../generated/prisma/client.js';
import { TCloudinaryUploadResponse, TMulterFile, TPagination } from '../../../interface/global.js';
import { imageUploadeIntoCloudinary, upload } from '../../../helpers/multer.js';
import { TAdminPayload, TDoctorPayload, TFilter } from './interface.js';
import { userSearchableFields } from './constance.js';
import { AppError } from '../../middleware/AppError.js';
import { StatusCodes } from 'http-status-codes';





const getMe = async(payload: any) => {
  const mapModel = {
  [userRole.ADMIN] : prisma.admin,
  [userRole.DOCTOR] : prisma.doctor,
  [userRole.PATIANT] : prisma.users,
  [userRole.SUPER_ADMIN] : prisma.users,
} as any;

  const profileInfo = await prisma.users.findFirstOrThrow({where: {id: payload?.id}})
  const model = mapModel[profileInfo?.role];
  if (!model) {
   throw new AppError(StatusCodes.CONFLICT,'invalid role');
  }
  const userInfo = await model.findUnique({where: {email: profileInfo.email}})
  return {...profileInfo,...userInfo}
}



 const createAdmin = async (payload: TAdminPayload,file:TMulterFile | undefined) => {
  const { admin , password } = payload;
  if (file) {
    const cloudinary: TCloudinaryUploadResponse | any = await imageUploadeIntoCloudinary(file);
    payload.admin.profilePhoto = cloudinary.secure_url;
  }
  const hashPass = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: hashPass,
        profilePhoto: payload.admin.profilePhoto,
        contactNumber: admin.contactNumber,
        needPasswordCng: admin.needPasswordCng,
        role: userRole.ADMIN,           
        status: admin.status,           
      },
    });

    const adminRow = await tx.admin.create({
      data: {
        name: admin.name,
        email: admin.email,             
        profilePhoto: payload.admin.profilePhoto,
        contactNumber: admin.contactNumber,
      },
    });

    return { user, admin: adminRow };
  });

  return result;
};




 const createDoctor = async (payload: TDoctorPayload,file:TMulterFile | undefined) => {
  const { doctor , password } = payload;
  if (file) {
    const cloudinary: TCloudinaryUploadResponse | any = await imageUploadeIntoCloudinary(file);
    payload.doctor.profilePhoto = cloudinary.secure_url;
  }
  const hashPass = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name: doctor.name,
        email: doctor.email,
        password: hashPass,
        profilePhoto: payload.doctor.profilePhoto,
        contactNumber: doctor.contactNumber,
        role: userRole.DOCTOR,                   
      },
    });

    const doctorRes = await tx.doctor.create({
      data: {
        name: doctor.name,
        email: doctor.email,             
        contactNumber: doctor.contactNumber,
        profilePhoto: doctor.profilePhoto,
        address: doctor.address,
        registrationNumber: doctor.registrationNumber,
        experience: doctor.experience,
        gender: doctor.gender,
        appoinmentFee: doctor.appoinmentFee,
        qualification : doctor.qualification,
        currentWorkingPlace: doctor.currentWorkingPlace,
        designation: doctor.designation,
        isDeleted: doctor.isDeleted
      },
    });

    return { user, doctor: doctorRes };
  });

  return result;
};



const createPatient = async (payload: any, file?: TMulterFile) => {
   
  const {patient,password} = payload;

    if (file) {
        const cloudinary: TCloudinaryUploadResponse | any = await imageUploadeIntoCloudinary(file);
        payload.patient.profilePhoto = cloudinary?.secure_url;
    }
    const hashPass: string = await bcrypt.hash(password, 12)

    const userData = {
        name: patient.name,
        email: patient.email,
        password: hashPass,
        profilePhoto: patient.profilePhoto,
        contactNumber: patient.contactNumber,
        role: userRole.DOCTOR, 
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.users.create({
            data: userData
        });

        const createdPatientData = await transactionClient.patient.create({
            data: patient
        });

        return createdPatientData;
    });

    return result;
};




const userFromDB = async(query: Partial<TFilter | any>,options: Partial<TPagination>) => {
    const {searchTerm, ...filter } = query;

    const { page , limit, skip, sortOrder, sortBy} = calculatePagination(options);
    const andCondition = []
    if (searchTerm) {
       andCondition.push({
         OR: userSearchableFields.map((field) => ({
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
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      role: true,
      needPasswordCng: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      doctor: true,
      admin: true
    },
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
const updateStatus = async(id: string,  status: userStatus) => {
  const isExistUser = await prisma.users.findUniqueOrThrow({where: {id: id}})
  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND , 'user not found')
  }
  const result = await prisma.users.update({where: {id: id}, data: {status: status}}) 
  return result
}





export const userServices = { 
  getMe,
  createAdmin ,
  createDoctor,
  createPatient,
  userFromDB , 
  getByIdFromDB,
  updateStatus,
};