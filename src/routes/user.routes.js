import { Router } from "express";
import { 
    loginUser,
    registerUser 
} from "../controllers/user.controller.js"

import { upload } from "../middlewares/multer.middleware.js"


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




export default userRouter