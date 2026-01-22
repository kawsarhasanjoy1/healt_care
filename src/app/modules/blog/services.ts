import prisma from "../../../shared/prisma.js";
import { TBlog } from "./interface.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../middleware/AppError.js";
import { TAuthUser, TPagination } from "../../../interface/global.js";
import { imageUploadeIntoCloudinary } from "../../../helpers/multer.js";
import { calculatePagination } from "../../../helpers/paginationHelpers.js";

const createBlog = async (payload: any, user: any, files: any) => {
  const { title, content: rawContent, specialtiesId } = payload;
  let finalContent = rawContent;

  const userInfo = await prisma.users.findUnique({
    where: { id: user?.id },
  });

  if (!userInfo) {
    throw new AppError(StatusCodes.NOT_FOUND, "ইউজার পাওয়া যাচ্ছে না");
  }

  const allowedRoles = ["ADMIN", "SUPER_ADMIN", "DOCTOR"];
  if (!allowedRoles.includes(userInfo.role)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "আপনার এই ব্লগ তৈরি করার অনুমতি নেই"
    );
  }

  const contentImages = files?.content_images;
  if (contentImages && contentImages.length > 0) {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const matches: any[] = Array.from(finalContent.matchAll(imgRegex));

    // প্রতিটি ম্যাচের জন্য ক্লাউডিনারি আপলোড
    for (let i = 0; i < matches.length; i++) {
      if (contentImages[i]) {
        try {
          const uploadResult = (await imageUploadeIntoCloudinary(
            contentImages[i]
          )) as any;
          if (uploadResult?.secure_url) {
            // পুরনো src (base64/blob) কে ক্লাউডিনারি ইউআরএল দিয়ে রিপ্লেস করা
            finalContent = finalContent.replace(
              matches[i][1],
              uploadResult.secure_url
            );
          }
        } catch (error) {
          console.error(`Content image upload failed at index ${i}:`, error);
          // একটি ইমেজ ফেইল করলেও প্রসেস চালিয়ে যাবে
        }
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

  await prisma.specialties.findUniqueOrThrow({
    where: { id: specialtiesId },
  });

  const result = await prisma.blog.create({
    data: {
      title,
      content: finalContent,
      thumbnail,
      specialtiesId,
      authorId: userInfo.id,
    },
    include: {
      specialties: true,
      author: {
        select: {
          name: true,
          profilePhoto: true,
        },
      },
    },
  });

  return result;
};
const getAllBlogs = async (
  filters: any,
  options: TPagination,
  user: TAuthUser
) => {
  const { searchTerm, categoryId } = filters;
  const { limit, page, skip, sortBy, sortOrder } = calculatePagination(options);
  const whereCondition: any = {};

  const userInfo = await prisma.users.findUniqueOrThrow({
    where: { id: user?.id },
  });

  if (userInfo.role === "DOCTOR") {
    whereCondition.authorId = userInfo.id;
  }

  if (searchTerm) {
    whereCondition.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { content: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (categoryId) whereCondition.specialtiesId = categoryId;

  const result = await prisma.blog.findMany({
    where: whereCondition,
    include: {
      specialties: true,
      author: { select: { name: true, profilePhoto: true, role: true } },
    },
    take: limit,
    skip,
    orderBy:
      options?.sortBy && options?.sortOrder
        ? { [options?.sortBy]: options?.sortOrder }
        : { createdAt: "desc" },
  });
  const total = await prisma.blog.count({ where: whereCondition });
  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};
const getAllPublicBlog = async (options: TPagination) => {
  const { limit, page, skip, sortBy, sortOrder } = calculatePagination(options);
  const whereCondition: any = {};

  const result = await prisma.blog.findMany({
    where: whereCondition,
    include: {
      specialties: true,
      author: { select: { name: true, profilePhoto: true, role: true } },
    },
    take: limit,
    skip,
    orderBy:
      options?.sortBy && options?.sortOrder
        ? { [options?.sortBy]: options?.sortOrder }
        : { createdAt: "desc" },
  });
  const total = await prisma.blog.count({ where: whereCondition });
  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const getSingleBlog = async (id: string) => {
  const result = await prisma.blog.findUnique({
    where: { id },
    include: { specialties: true, author: true },
  });
  if (!result)
    throw new AppError(StatusCodes.NOT_FOUND, "ব্লগটি পাওয়া যায়নি!");
  return result;
};

const updateBlog = async (
  id: string,
  payload: Partial<TBlog>,
  user: TAuthUser
) => {
  const blog = await prisma.blog.findUniqueOrThrow({ where: { id } });
  const userInfo = await prisma.users.findUniqueOrThrow({
    where: { id: user.id },
  });

  const canUpdate =
    userInfo.role === "SUPER_ADMIN" ||
    userInfo.role === "ADMIN" ||
    blog.authorId === userInfo.id;

  if (!canUpdate) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "আপনি শুধুমাত্র নিজের ব্লগ আপডেট করতে পারবেন!"
    );
  }

  return await prisma.blog.update({
    where: { id },
    data: payload,
  });
};

const deleteBlog = async (id: string, user: TAuthUser) => {
  const blog = await prisma.blog.findUniqueOrThrow({ where: { id } });
  const userInfo = await prisma.users.findUniqueOrThrow({
    where: { id: user.id },
  });

  const canDelete =
    userInfo.role === "SUPER_ADMIN" ||
    userInfo.role === "ADMIN" ||
    blog.authorId === userInfo.id;

  if (!canDelete) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "আপনার এই ব্লগটি মুছে ফেলার অনুমতি নেই!"
    );
  }

  return await prisma.blog.delete({ where: { id } });
};

export const blogServices = {
  createBlog,
  getAllPublicBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
};
