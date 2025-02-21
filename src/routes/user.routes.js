import { Router } from "express";
import { 
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser 
} from "../controllers/user.controller.js"

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


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


export default userRouter