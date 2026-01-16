import prisma from "../../../shared/prisma.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";
import dayjs from 'dayjs';
const createScheduleIntoDB = async (payload) => {
    const { startDate, endDate, startTime, endTime } = payload;
    const intervalTime = 30;
    const schedulesData = [];
    let current = dayjs(startDate);
    const last = dayjs(endDate);
    while (current.isBefore(last) || current.isSame(last, "day")) {
        const dateString = current.format("YYYY-MM-DD");
        let startDateTime = dayjs(`${dateString}T${startTime}:00`);
        let endDateTime = dayjs(`${dateString}T${endTime}:00`);
        if (!startDateTime.isValid() || !endDateTime.isValid()) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Invalid time format!");
        }
        if (endDateTime.isBefore(startDateTime) || endDateTime.isSame(startDateTime)) {
            endDateTime = endDateTime.add(1, "day");
        }
        while (startDateTime.isBefore(endDateTime)) {
            const nextSlot = startDateTime.add(intervalTime, "minute");
            schedulesData.push({
                startDateTime: startDateTime.toDate(),
                endDateTime: nextSlot.toDate(),
            });
            startDateTime = nextSlot;
        }
        current = current.add(1, "day");
    }
    const existingSchedules = await prisma.schedule.findMany({
        where: {
            OR: schedulesData.map((slot) => ({
                startDateTime: slot.startDateTime,
                endDateTime: slot.endDateTime,
            })),
        },
    });
    const existingMap = new Set(existingSchedules.map((s) => s.startDateTime.getTime()));
    const newSchedules = schedulesData.filter((slot) => !existingMap.has(slot.startDateTime.getTime()));
    if (newSchedules.length === 0) {
        throw new AppError(StatusCodes.CONFLICT, "এই সময়ের সকল শিডিউল আগে থেকেই বিদ্যমান!");
    }
    await prisma.schedule.createMany({
        data: newSchedules,
        skipDuplicates: true,
    });
    const result = await prisma.schedule.findMany({
        where: {
            OR: newSchedules.map((slot) => ({
                startDateTime: slot.startDateTime,
            })),
        },
        orderBy: {
            startDateTime: 'asc'
        }
    });
    return result;
};
const getSchedulesFromDB = async (filters, options, user) => {
    const { limit, page, skip } = calculatePagination(options);
    const { startDate, endDate, doctorId } = filters;
    const andConditions = [];
    if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        console.log(start, end);
        andConditions.push({
            startDateTime: {
                gte: start,
            },
            endDateTime: {
                lte: end,
            },
        });
    }
    if (doctorId) {
        andConditions.push({
            doctorSchedules: {
                some: {
                    doctorId: doctorId,
                    isBooked: false,
                },
            },
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const [result, total] = await Promise.all([
        prisma.schedule.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { startDateTime: "asc" },
        }),
        prisma.schedule.count({
            where: whereConditions,
        }),
    ]);
    return {
        meta: { total, page, limit },
        data: result,
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
