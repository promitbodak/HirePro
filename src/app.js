import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Injecting middlewares before express app runs they all perform different essential prerequisit jobs
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))  // for handling json responses
app.use(express.urlencoded({extended: true})) // for URL handling (params)
app.use(express.static("public"))

app.use(cookieParser()) // used to get the access of user's cookie section (used for JWT authentication and other operations)





// ROUTES  ---VVVVVV
import userRouter from "./routes/user.routes.js"

//ROUTES DECLARATION
app.use("/HirePro/api/v1/users", userRouter)         // </api/v1/users> is the default prefix to be used before each userRoute


export { app }