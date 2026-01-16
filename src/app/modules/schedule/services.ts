import { Prisma, Schedule } from "@prisma/client";
import prisma from "../../../shared/prisma.js";
import { TFilterRequest, TSchedule } from "./interface.js";
import { TPagination } from "../../../interface/global.js";
import { addDays, addHours, addMinutes , format, parseISO, setDate} from "date-fns";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";
import { AppError } from "../../middleware/AppError.js";
import { StatusCodes } from "http-status-codes";


const createScheduleIntoDB = async (payload: TSchedule): Promise<Schedule[]> => {
    const { startDate, endDate, startTime, endTime } = payload;
    const intervalTime = 30; 
    const schedulesData: { startDateTime: Date; endDateTime: Date }[] = [];

    // তারিখগুলোকে অবজেক্টে রূপান্তর (Local Time)
    const current = new Date(startDate);
    const last = new Date(endDate);

    while (current <= last) {
        // তারিখ ফরম্যাট করা (YYYY-MM-DD) লোকাল টাইম অনুযায়ী
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        let startDateTime = new Date(`${dateString}T${startTime}:00`);
        let endDateTime = new Date(`${dateString}T${endTime}:00`);

        // যদি এন্ড টাইম পরের দিন চলে যায় (যেমন রাত ১১টা থেকে রাত ২টা)
        if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        while (startDateTime < endDateTime) {
            const nextSlot = new Date(startDateTime.getTime() + intervalTime * 60000);

            schedulesData.push({
                startDateTime: new Date(startDateTime),
                endDateTime: nextSlot
            });

            startDateTime = nextSlot;
        }
        // তারিখ ১ দিন বাড়ানো
        current.setDate(current.getDate() + 1);
    }

    // বাকি লজিক (existing check & createMany) একই থাকবে...
    // তবে নিশ্চিত করুন Prisma-তে ডাটা পাঠানোর সময় সেগুলো Date অবজেক্ট হিসেবেই আছে।
    
    const existingSchedules = await prisma.schedule.findMany({
        where: {
            OR: schedulesData.map(slot => ({
                startDateTime: slot.startDateTime,
                endDateTime: slot.endDateTime
            }))
        }
    });

    const existingMap = new Set(existingSchedules.map(s => s.startDateTime.getTime()));
    const newSchedules = schedulesData.filter(slot => !existingMap.has(slot.startDateTime.getTime()));

    if (newSchedules.length === 0) {
        throw new AppError(StatusCodes.CONFLICT, "সবগুলো শিডিউল আগে থেকেই বিদ্যমান!");
    }

    await prisma.schedule.createMany({
        data: newSchedules,
        skipDuplicates: true,
    });

    return await prisma.schedule.findMany({
        where: {
            OR: newSchedules.map(slot => ({ startDateTime: slot.startDateTime }))
        }
    });
};
const getSchedulesFromDB = async (
    filters: TFilterRequest,
    options: TPagination,
    user: any
) => {
    const { limit, page, skip } = calculatePagination(options);
    const { startDate, endDate, doctorId } = filters;

    const andConditions: Prisma.ScheduleWhereInput[] = [];


if (startDate && endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`); 
  const end = new Date(`${endDate}T23:59:59.999Z`);
  console.log(start , end)
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
                    isBooked: false
                }
            }
        });
    }

    const whereConditions: Prisma.ScheduleWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const [result, total] = await Promise.all([
        prisma.schedule.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { startDateTime: 'asc' }, 
        }),
        prisma.schedule.count({
            where: whereConditions,
        })
    ]);

    return {
        meta: { total, page, limit },
        data: result,
    };
};

const deleteFromDB = async (id: string): Promise<Schedule> => {
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
