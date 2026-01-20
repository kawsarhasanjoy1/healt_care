import prisma from "../../../shared/prisma.js";
import { TBlog } from "./interface.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../middleware/AppError.js";
import { TAuthUser } from "../../../interface/global.js";
import { imageUploadeIntoCloudinary } from "../../../helpers/multer.js";

const createBlog = async (payload: TBlog, user: TAuthUser, files: any) => {
  let { content } = payload;
  const contentImages = files?.content_images;

  if (contentImages && contentImages.length > 0) {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let i = 0;
    const matches = Array.from(content.matchAll(imgRegex));

    for (const match of matches) {
      if (i < contentImages.length) {
        const temporarySrc = match[1];

        const uploadResult = (await imageUploadeIntoCloudinary(
          contentImages[i]
        )) as any;
        const secureUrl = uploadResult?.secure_url;

        content = content.replace(temporarySrc, secureUrl);

        i++;
      }
    }
  }
  let thumbnail = "";
  if (files?.file && files.file[0]) {
    const thumbResult = (await imageUploadeIntoCloudinary(
      files.file[0]
    )) as any;
    thumbnail = thumbResult?.secure_url;
  }

  const userInfo = await prisma.users.findUniqueOrThrow({
    where: {
      id: user?.id,
    },
  });

  if (!userInfo) {
    throw new AppError(StatusCodes.NOT_FOUND, "ইউজার পাওয়া যাচ্ছে না");
  }

  const userRole = ["ADMIN", "SUPER_ADMIN", "DOCTOR"];

  if (!userRole.includes(userInfo.role)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "দুঃখিত, আপনার এই কাজটি করার অনুমতি নেই।"
    );
  }

  await prisma.specialties.findUniqueOrThrow({
    where: {
      id: payload?.specialtiesId,
    },
  });

  const result = await prisma.blog.create({
    data: {
      ...payload,
      content,
      thumbnail,
      authorId: userInfo.id,
    },
  });

  return result;
};
const getAllBlogs = async (params: any) => {
  const { searchTerm, categoryId } = params;
  const whereCondition: any = {  };
  if (searchTerm) {
    whereCondition.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { content: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
  if (categoryId) whereCondition.categoryId = categoryId;

  const result = await prisma.blog.findMany({
    where: whereCondition,
    include: {
      category: true,
      author: { select: { name: true, profilePhoto: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getSingleBlog = async (id: string) => {
  const result = await prisma.blog.findUnique({
    where: { id },
    include: { category: true, author: true },
  });
  if (!result) throw new AppError(StatusCodes.NOT_FOUND, "ব্লগটি পাওয়া যায়নি!");
  return result;
};

export const blogServices = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
};
