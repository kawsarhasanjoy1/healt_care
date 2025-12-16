import prisma from "../../../shared/prisma.js";
import { addHours, addMinutes, format } from "date-fns";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
const validateTimeRange = (start, end) => {
    if (end <= start) {
        throw new Error("End time must be after start time");
    }
};
const convertDateTime = async (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
};
const createScheduleIntoDB = async (payload) => {
    const { startDate, endDate, startTime, endTime } = payload;
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    const schedules = [];
    const interverlTime = 30;
    while (currentDate <= lastDate) {
        const startDateTime = new Date(addMinutes(addHours(`${format(currentDate, 'yyyy-MM-dd')}`, Number(startTime.split(':')[0])), Number(startTime.split(':')[1])));
        const endDateTime = new Date(addMinutes(addHours(`${format(currentDate, 'yyyy-MM-dd')}`, Number(endTime.split(':')[0])), Number(endTime.split(':')[1])));
        while (startDateTime < endDateTime) {
            // const scheduleData = {
            //     startDateTime: startDateTime,
            //     endDateTime: addMinutes(startDateTime, interverlTime)
            // }
            const s = await convertDateTime(startDateTime);
            const e = await convertDateTime(addMinutes(startDateTime, interverlTime));
            const scheduleData = {
                startDateTime: s,
                endDateTime: e
            };
            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            });
            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                });
                schedules.push(result);
            }
            startDateTime.setMinutes(startDateTime.getMinutes() + interverlTime);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
};
const getSchedulesFromDB = async (filters, options, user) => {
    const { page, skip, limit, sortBy, sortOrder } = calculatePagination(options);
    const { startDate, endDate } = filters;
    const andCondition = [];
    if (startDate && endDate) {
        andCondition.push({
            AND: [
                {
                    startDateTime: {
                        gte: startDate
                    }
                },
                {
                    endDateTime: {
                        lte: endDate
                    }
                }
            ]
        });
    }
    if (Object.keys(filters).length > 0) {
        andCondition.push({
            AND: Object.keys(filters).map((field) => ({
                [field]: { equals: filters[field] }
            }))
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user?.email
            }
        }
    });
    const doctorScheduleIds = doctorSchedules.map(schedule => schedule.scheduleId);
    const result = await prisma.schedule.findMany({
        where: {
            ...whereCondition,
            id: {
                notIn: doctorScheduleIds
            }
        },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            }
    });
    const total = await prisma.schedule.count({
        where: {
            ...whereCondition,
            id: {
                notIn: doctorScheduleIds
            }
        },
    });
    return {
        data: result,
        meta: {
            page,
            limit,
            skip,
            total,
        }
    };
};
const deleteFromDB = async (id) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.doctorSchedules.deleteMany({
            where: { scheduleId: id },
        });
        const deleted = await tx.schedule.delete({
            where: { id },
        });
        return deleted;
    });
    return result;
};
export const scheduleServices = {
    createScheduleIntoDB,
    getSchedulesFromDB,
    deleteFromDB,
};
