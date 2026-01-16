import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma.js";
import { TPagination } from "../../../interface/global.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";

const createDoctorSchedules = async (user: JwtPayload, payload: { scheduleId: string[] }) => {
    const email = user?.email;
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({ where: { email: email } });

    const createdSchedules = [];
    for (const scheduleId of payload.scheduleId) {
        const isExist = await prisma.doctorSchedules.findFirst({
            where: {
                doctorId: doctorInfo.id,
                scheduleId: scheduleId
            }
        });

        if (!isExist) {
            const result = await prisma.doctorSchedules.create({
                data: {
                    doctorId: doctorInfo.id,
                    scheduleId: scheduleId
                }
            });
            createdSchedules.push(result);
        }
    }

    if (createdSchedules.length === 0) {
        throw new AppError(StatusCodes.CONFLICT, "All selected schedules already exist for this doctor!");
    }

    return createdSchedules;
};


const getMySchedule = async (filters: any, options: TPagination, user: JwtPayload) => {
  const { limit, page, skip } = calculatePagination(options);
  const {startDate,endDate,isBooked} = filters;

  const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];

  if (user?.email) {
    andConditions.push({ doctor: { email: user.email } });
  }

  if (startDate || endDate) {
    andConditions.push({
      schedule: {
        ...(startDate ? { startDateTime: { gte: startDate } } : {}),
        ...(endDate ? { endDateTime: { lte: endDate } } : {}),
      },
    });
  }

  if (isBooked === "true") {
    andConditions.push({ isBooked: true });
  } else if (isBooked === "false") {
    andConditions.push({ isBooked: false });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const sortOrder: Prisma.SortOrder = options.sortOrder === "desc" ? "desc" : "asc";

  const rootSortable = new Set(["doctorId", "scheduleId", "isBooked", "appoinmentId"]);

  let orderBy: Prisma.DoctorSchedulesOrderByWithRelationInput = {
    schedule: { startDateTime: "asc" },
  };

  if (options.sortBy) {
    if (options.sortBy === "startDateTime") {
      orderBy = { schedule: { startDateTime: sortOrder } };
    } else if (options.sortBy === "endDateTime") {
      orderBy = { schedule: { endDateTime: sortOrder } };
    } else if (rootSortable.has(options.sortBy)) {
      orderBy = { [options.sortBy]: sortOrder } as Prisma.DoctorSchedulesOrderByWithRelationInput;
    } else {
      orderBy = { schedule: { startDateTime: "asc" } };
    }
  }

  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy,
    include: { doctor: true, schedule: true },
  });

  const total = await prisma.doctorSchedules.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

const getAllDoctorScheduleFromDB = async (
    filters: any,
    options: TPagination,
) => {
    const { limit, page, skip } = calculatePagination(options);
    const { searchTerm, startDate, endDate, doctorId, ...filterData } = filters;
    const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];


if (startDate && endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`); 
  const end = new Date(`${endDate}T23:59:59.999Z`);

  andConditions.push({
    schedule: {
      startDateTime: {
      gte: start,
    },
    endDateTime: {
      lte: end,
    },
    }
  });
}

if (doctorId) {
  andConditions.push({
    doctorId: doctorId as string,
  });
}
    
    if (searchTerm) {
        andConditions.push({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
        });
    }


    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string') {
            filterData.isBooked = filterData.isBooked === 'true';
        }

        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }

    const whereConditions: Prisma.DoctorSchedulesWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const [result, total] = await Promise.all([
        prisma.doctorSchedules.findMany({
            include: {
                doctor: true,
                schedule: true,
            },
            where: whereConditions,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { 
                    schedule: { 
                        startDateTime: 'asc' 
                    } 
                },
        }),
        prisma.doctorSchedules.count({
            where: whereConditions,
        })
    ]);

    return {
        meta: { total, page, limit },
        data: result,
    };
};


const deleteFromDB = async (user: JwtPayload, scheduleId: string) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const isBookedSchedule = await prisma.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId: scheduleId,
            isBooked: true
        }
    });

    if (isBookedSchedule) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You can not delete the schedule because of the schedule is already booked!")
    }

    const result = await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleId
            }
        }
    })
    return result;

}



export const doctorSchedulesServices = {
    createDoctorSchedules,
    getMySchedule,
    getAllDoctorScheduleFromDB,
    deleteFromDB
}