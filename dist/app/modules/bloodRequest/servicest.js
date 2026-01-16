import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma.js";
import { AppError } from "../../middleware/AppError.js";
import sendBloodRequestEmail from "../../../shared/sendEmailForBloodRequest.js";
const createBloodRequest = async (payload, user) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: { email: user?.email },
    });
    const donorInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id: payload?.donorId,
        },
    });
    const donateInfo = await prisma.bloodDonate.findUniqueOrThrow({
        where: {
            id: payload?.bloodDonateId,
            donorId: donorInfo?.id,
        },
    });
    if (!donateInfo) {
        throw new AppError(StatusCodes.NOT_FOUND, "কোন ডাটা খুজে পাওয়া যাচ্ছে না");
    }
    if (!donorInfo) {
        throw new AppError(StatusCodes.NOT_FOUND, "কোন ডাটা খুজে পাওয়া যাচ্ছে না");
    }
    if (!donorInfo?.isDonor) {
        throw new AppError(StatusCodes.CONFLICT, "প্যাসেন্ট আইডি দিয়ে কোন রক্তদাতা পাওয়া যাচ্ছে না");
    }
    if (!patient) {
        throw new AppError(StatusCodes.NOT_FOUND, "কোন ডাটা খুজে পাওয়া যাচ্ছে না");
    }
    if (!patient?.isNeedBlood) {
        throw new AppError(StatusCodes.FORBIDDEN, "রক্তের অনুরুধের জন্য আপনি ডাক্তার অনুমুধিত না");
    }
    const newRequest = await prisma.bloodRequest.create({
        data: {
            patientId: patient.id,
            donorId: payload.donorId,
            bloodDonateId: payload.bloodDonateId,
        },
        include: { donor: true },
    });
    await sendBloodRequestEmail(donorInfo?.email, patient?.name, donateInfo?.bloodGroup, "http://localhost:3000/dashboard/patiant/blood-request");
    return newRequest;
};
const getMyRequest = async (user) => {
    const patiantInfo = await prisma.patient.findUniqueOrThrow({
        where: { email: user?.email },
    });
    if (!patiantInfo) {
        throw new AppError(StatusCodes.NOT_FOUND, "ডাটা পাওয়া যাচ্ছে না");
    }
    if (!patiantInfo?.isNeedBlood) {
        throw new AppError(StatusCodes.FORBIDDEN, "দুঃখিত, বর্তমানে আপনার রক্ত প্রয়োজন (Need Blood) স্ট্যাটাসটি সক্রিয় নেই। তাই আপনি ডোনারদের তথ্য দেখতে পারবেন না।");
    }
    return await prisma.bloodRequest.findMany({
        where: {
            patientId: patiantInfo?.id,
        },
        include: { patient: true, donor: true, bloodDonate: true },
    });
};
const upBloodRequestStatus = async (requestId, status, user) => {
    const donor = await prisma.patient.findUniqueOrThrow({
        where: { email: user?.email },
    });
    const request = await prisma.bloodRequest.findUniqueOrThrow({
        where: { id: requestId },
    });
    if (request.donorId !== donor.id) {
        throw new AppError(StatusCodes.FORBIDDEN, "আপনি এই অনুরোধটি এক্সেপ্ট করার অনুমতিপ্রাপ্ত নন।");
    }
    return await prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status: status },
    });
};
const incomingBloodRequest = async (user) => {
    const donorInfo = await prisma.patient.findUnique({
        where: {
            email: user?.email,
        },
    });
    if (!donorInfo) {
        throw new AppError(StatusCodes.NOT_FOUND, "ইউজার প্রোফাইল পাওয়া যায়নি।");
    }
    if (!donorInfo.isDonor) {
        throw new AppError(StatusCodes.FORBIDDEN, "দুঃখিত, আপনি একজন রক্তদাতা (Donor) হিসেবে নিবন্ধিত নন।");
    }
    const result = await prisma.bloodRequest.findMany({
        where: {
            donorId: donorInfo.id,
        },
        include: {
            patient: {
                select: {
                    id: true,
                    name: true,
                    contactNumber: true,
                    email: true,
                    address: true,
                },
            },
            bloodDonate: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const pendingCount = result.filter(req => req.status === "PENDING").length;
    return {
        result,
        meta: {
            total: result.length,
            pending: pendingCount
        }
    };
};
// const deleteRq = async(requestId: string) => {
//     const res = await prisma.bloodRequest.delete({
//         where: {
//             id: requestId
//         }
//     })
// }
export const bloodRequestServices = {
    createBloodRequest,
    getMyRequest,
    incomingBloodRequest,
    upBloodRequestStatus,
};
