import { Router } from "express";
import { 
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser, 
    updateAccountDetails,
    updateUserAvater,
    updateUserCoverImage
} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createJob } from "../controllers/job.controller.js";


const userRouter = Router()

userRouter.route("/register").post(upload.fields([
    {
        name: "avater",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)

userRouter.route("/login").post(upload.none(),loginUser) // If want to pass raw JSON data remove the [upload.none()] multer middleware, But if 
                                                        // data is passed through Form-data then (req.body) needs this middleware to propagate the data in (req.body) 



// SECURED ROUTES
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser)
userRouter.route("/update-details").patch(verifyJWT, updateAccountDetails)
userRouter.route("/avater").patch(verifyJWT, updateUserAvater)
userRouter.route("/cover-image").patch(verifyJWT, updateUserCoverImage)
userRouter.route("/job-create").post(verifyJWT, upload.single('jobCoverImage'), createJob)

export default userRouter