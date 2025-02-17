// [USING THE MODULAR IMPORT SYNTAX]

import dotenv from "dotenv"  // dotenv still dosent support this modular import syntax, thus to make it work we have used an experimental setup at Dev scripts at package.json
import connectDB from "./db/index.js"
import { app } from "./app.js"

//Configuring the environment variable path in the file structure
dotenv.config({
    path: './env'
})

connectDB()       // connectDB is implemented using async await function, which returns a Promise if successful. therefore we are using .then ans .catch  
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection failed : ", err);
})


