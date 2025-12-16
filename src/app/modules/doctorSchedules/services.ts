import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma.js";
import { TPagination } from "../../../interface/global.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";

const createDoctorSchedules = async(user: JwtPayload, payload: {scheduleId: string[]}) => {
    const email = user?.email;
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({where: {email: email}})
    const doctorSchedules = payload.scheduleId.map((scheduleId: string) => ({
        scheduleId,
        doctorId: doctorInfo.id
    }))
    const result = await prisma.doctorSchedules.createMany({data: doctorSchedules})
    return result;
}


const getMySchedule = async (
    filters: any,
    options: TPagination,
    user: JwtPayload
) => {
    const { limit, page, skip } = calculatePagination(options);
    const { startDate, endDate, ...filterData } = filters;
    //console.log(filterData)

    const andConditions = [];

    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    schedule: {
                        startDateTime: {
                            gte: startDate
                        }
                    }
                },
                {
                    schedule: {
                        endDateTime: {
                            lte: endDate
                        }
                    }
                }
            ]
        })
    };


    if (Object.keys(filterData).length > 0) {

        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'true') {
            filterData.isBooked = true
        }
        else if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'false') {
            filterData.isBooked = false
        }

        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        });
    }

    const whereConditions: Prisma.DoctorSchedulesWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};


    const result = await prisma.doctorSchedules.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {

                }
    });
    const total = await prisma.doctorSchedules.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
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
    deleteFromDB
}