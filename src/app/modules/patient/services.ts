import { Patient, Prisma, userStatus } from "@prisma/client";
import prisma from "../../../shared/prisma.js";
import { patientSearchableFields } from "./constance.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { TPatientUpdate } from "./interface.js";

 const getPatients = async (filters: Record<string,any>, options: Record<string, any>) => {
 const {page,skip,limit} = calculatePagination(options)
 const {searchTerm, ...filterData} = filters;

 const andCondition: Prisma.PatientWhereInput[] = []
 if (searchTerm) {
    andCondition.push({
        OR: patientSearchableFields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: "insensitive"
            }
        }))
    })
 }

 if (Object.keys(filterData).length > 0) {
   andCondition.push({
   AND: Object.keys(filterData).map((key) => ({
    [key]: {equals: filterData[key]}
   }))
   })
 }

 andCondition.push({isDeleted: false})
 const whereCondition: Prisma.PatientWhereInput = andCondition?.length > 0 ? {AND: andCondition} : {}


 const result = await prisma.patient.findMany(
    {
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {[options.sortBy]: options.sortOrder} : {
            createdAt: 'desc'
        },
        include: {
        patientHealthData: true,
        medicalReports: true
    }
})
const total = await prisma.patient.count({where: whereCondition})
const meta = {
        skip,
        page,
        limit,
        total
}
return {
    data: result,
    meta: meta,
}
};




const getPatientById = async (id: string): Promise<Patient | null> => {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      patientHealthData: true,
      medicalReports: true,
    },
  });
};




const updatePatient = async (id: string, payload:TPatientUpdate): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false
    }
  });

  await prisma.$transaction(async (transactionClient) => {
    //update patient data
    await transactionClient.patient.update({
      where: {
        id
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReports: true
      }
    });

    // create or update patient health data
    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id }
      });
    };

 
      if (medicalReport) {
      await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id }
      })
    }

  })


  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id
    },
    include: {
      patientHealthData: true,
      medicalReports: true
    }
  })
  return responseData;

};




 const softDeletePatient =  async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async transactionClient => {
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.users.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: userStatus.DELETED,
      },
    });

    return deletedPatient;
  });
}


const deletePatient = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (tx) => {
    // delete medical report
    await tx.medicalReport.deleteMany({
      where: {
        patientId: id
      }
    });

    // delete patient health data
    await tx.patientHealthData.delete({
      where: {
        patientId: id
      }
    });

    const deletedPatient = await tx.patient.delete({
      where: {
        id
      }
    });

    await tx.users.delete({
      where: {
        email: deletedPatient.email
      }
    });

    return deletedPatient;
  });

  return result;
};

export const patientServices = {
    getPatients,
    getPatientById,
    updatePatient,
    softDeletePatient,
    deletePatient,
}