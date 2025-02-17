// [USING THE MODULAR IMPORT SYNTAX]

import dotenv from "dotenv"  // dotenv still dosent support this modular import syntax, thus to make it work we have used an experimental setup at Dev scripts at package.json
import connectDB from "./db/index.js"
// import { app } from "./app.js"

//Configuring the environment variable path in the file structure
dotenv.config({
    path: './env'
})

connectDB()



