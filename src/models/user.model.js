import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avater: {
            type: String, // cloudinary URL
            required: true
        },
        coverImage: {
            type: String // cloudinary URL
        },
        jobList: [
            {
                type: Schema.Types.ObjectId,
                ref: "job"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is Required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

/*
This is called a (pre Hook) used to run the callback function once every time
before savain/Exporting/modifying the model Schema. Full fledged function is used
in the callback as Arrow functions dosen't support (this keyword)
    vvvvvvvvvvvvv 
*/

userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10)
    next()
})


/*
    you can create Custom functions under this Schema to perform
    various tasks using [userSchema.methods.< Function-name >]
    for eg. here password validator function is created
*/


userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {                               // This is the payload, what i have selected to generate the jwt
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName 
        },
        process.env.ACCESS_TOKEN_SECRET,  // This is the secret key
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY      // This is to specify in how much time the access token expires 
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {                               // This is the payload, what i have selected to generate the jwt
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,  // This is the secret key
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY      // This is to specify in how much time the access token expires 
        }
    )
}





export const User = mongoose.model("User", userSchema)






