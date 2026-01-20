import { Router } from "express";
import { blogController } from "./controller.js";
import auth from "../../middleware/auth.js";
import { userRole } from "../../constance/global.js";
import { upload } from "../../../helpers/multer.js";
import { parseData } from "../../../helpers/parseData.js";
const router = Router();
router.get("/", blogController.getAllBlogs);
router.get("/:blogId", blogController.getSingleBlog);
router.post("/create-blog", auth(userRole.ADMIN, userRole.SUPER_ADMIN, userRole.DOCTOR), upload.fields([
    { name: "file", maxCount: 1 },
    { name: "content_images", maxCount: 10 },
]), parseData, blogController.createBlog);
export const blogRouter = router;
