import { Router } from "express";
import auth from "../../middleware/auth.js";
import { userRole } from "../../constance/global.js";
import { upload } from "../../../helpers/multer.js";
import { parseData } from "../../../helpers/parseData.js";
import { blogControllers } from "./controller.js";

const router = Router();

router.get(
  "/",
  auth(userRole.ADMIN, userRole.DOCTOR, userRole.SUPER_ADMIN),
  blogControllers.getAllBlogs
);
router.get("/public-all-blog", blogControllers.getAllPublicBlog);
router.get("/:blogId", blogControllers.getSingleBlog);

router.patch(
  "/:id",
  auth(userRole.ADMIN, userRole.SUPER_ADMIN, userRole.DOCTOR),
  blogControllers.updateBlog
);

router.delete(
  "/:id",
  auth(userRole.ADMIN, userRole.SUPER_ADMIN, userRole.DOCTOR),
  blogControllers.deleteBlog
);
router.post(
  "/create-blog",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "content_images", maxCount: 10 },
  ]),

  parseData,
  auth(userRole.ADMIN, userRole.SUPER_ADMIN, userRole.DOCTOR),
  blogControllers.createBlog
);

export const blogRouter = router;
