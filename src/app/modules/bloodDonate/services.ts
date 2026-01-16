import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma.js";
import { AppError } from "../../middleware/AppError.js";
import { TBloodDonate } from "./interface.js";
import { TAuthUser } from "../../../interface/global.js";

const createBloodDonate = async (payload: TBloodDonate, user: any) => {
  const patientInfo: any = await prisma.patient.findUnique({
    where: { email: user?.email },
  });

  if (!patientInfo) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found");
  }

  if (!patientInfo.isDonor) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not registered as a donor"
    );
  }
  const lastDonationRecord = await prisma.bloodDonate.findFirst({
    where: { donorId: patientInfo.id },
    orderBy: { createdAt: "desc" },
  });
  if (lastDonationRecord) {
    const lastDate = new Date(lastDonationRecord.createdAt);
    const currentDate = new Date();
    const diffInTime = currentDate.getTime() - lastDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    const minimumGapDays = 90;
    if (diffInDays < minimumGapDays) {
      const remainingDays = Math.ceil(minimumGapDays - diffInDays);
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `আপনি এখন রক্ত দিতে পারবেন না। আপনাকে আরও ${remainingDays} দিন অপেক্ষা করতে হবে।`
      );
    }
  }

  const bloodData = {
    donorId: patientInfo?.id,
    bloodGroup:
      payload.bloodGroup || patientInfo?.patientHealthData?.bloodGroup,
    address: payload.address,
    lastDonationDate: payload?.lastDonationDate
      ? new Date(payload.lastDonationDate)
      : null,
    donatedBags: Number(payload?.donatedBags),
    nowDonateBags: Number(payload?.nowDonateBags),
  };

  const result = await prisma.bloodDonate.create({
    data: { ...bloodData },
  });

  return result;
};

const getAvailableDonorsForPatient = async (user: TAuthUser) => {
  const patientInfo = await prisma.patient.findUnique({
    where: { email: user?.email },
    include: {
      patientHealthData: true,
    },
  });

  if (!patientInfo) {
    throw new AppError(StatusCodes.NOT_FOUND, "ইউজার প্রোফাইল পাওয়া যায়নি।");
  }

  if (!patientInfo.isNeedBlood) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "দুঃখিত, ডাক্তারের অনুমতি ছাড়া আপনি এই তথ্যগুলো দেখতে বা প্রদান করতে পারবেন না।"
    );
  }

  const patientBloodGroup = patientInfo?.patientHealthData?.bloodGroup;
  const patientAddress = patientInfo.address || "";

  const donationHistory = await prisma.bloodDonate.findMany({
    where: {
      bloodRequests: {
        some: {
          status: "PENDING",
        },
      },
    },
    include: {
      bloodRequests: true,
      donor: {
        select: {
          name: true,
          contactNumber: true,
          address: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const sortedHistory = donationHistory.sort((a, b) => {
    const aMatchGroup = a.bloodGroup === patientBloodGroup;
    const bMatchGroup = b.bloodGroup === patientBloodGroup;

    if (aMatchGroup && !bMatchGroup) return -1;
    if (!aMatchGroup && bMatchGroup) return 1;

    const aMatchAddress = a.address
      .toLowerCase()
      .includes(patientAddress.toLowerCase());
    const bMatchAddress = b.address
      .toLowerCase()
      .includes(patientAddress.toLowerCase());

    if (aMatchAddress && !bMatchAddress) return -1;
    if (!aMatchAddress && bMatchAddress) return 1;

    return 0;
  });

  return sortedHistory;
};
const myBloodDonation = async (user: TAuthUser) => {
  const patientInfo = await prisma.patient.findUnique({
    where: { email: user?.email },
    include: {
      patientHealthData: true,
    },
  });

  if (!patientInfo) {
    throw new AppError(StatusCodes.NOT_FOUND, "ইউজার প্রোফাইল পাওয়া যায়নি।");
  }

  if (!patientInfo.isDonor) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "দুঃখিত, এই তথ্যগুলো দেখতে বা প্রদান করতে পারবেন না।"
    );
  }

  const myDonation = await prisma.bloodDonate.findMany({
    where: {
      donorId: patientInfo?.id,
    },
    include: {
      bloodRequests: true,
      donor: {
        select: {
          name: true,
          contactNumber: true,
          address: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  return myDonation;
};

export const bloodDonateServices = {
  createBloodDonate,
  getAvailableDonorsForPatient,
  myBloodDonation,
};
