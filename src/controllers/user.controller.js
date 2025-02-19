import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"





const registerUser = asyncHandler(async (req, res) => {
    // get user details from the Frontend
    // validation - (eg. Not empty)
    // Check if user already exists: check username/email
    // check for images, check for avaters
    // upload them to cloudinary, avater check explicitly whether uploded of not
    // create user object - create entry in DB
    // remove password and refresh token field from the response
    // Check for user creation
    // return response

    const {username, email, fullName, companyName, password} = req.body

    // we can handle errors by individual if conditions
    // OR
    // we can do this instead

    if([fullName, email, username, companyName, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne(
        {
            $or: [ {username}, {email} ]
        }
    )

    if(existedUser){
        throw new ApiError(401, "User with current email or username already exists")
    }



    //Collecting the path information of avater and coverImage
    //from multer
    const avaterLocalPath = req.files?.avater[0]?.path;  // Multer middleware used in router adds this file/files feature access in req
                                                         // it returns an avater array consisting of different properties, among them the first one is an object. that is accessed by avater[0]
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    // Ensure avatar is uploaded
    if(!avaterLocalPath){
        throw new ApiError(402, "Avater Image is Required")
    }

    const avater = await uploadOnCloudinary(avaterLocalPath)
    

    if(!avater){
        throw new ApiError(403, "Something went wrong !! (Avater upload failed)")
    }



    // Handle optional coverImage upload
    let coverImage = {url: ""};   // Default to empty string
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }



    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        companyName,
        password,
        avater: avater.url,
        coverImage: coverImage.url   //optional field if its there ok, otherwise save empty string
    })

    const createdUser = await User.findById(user._id).select( "-password -refreshToken" )   // this select method by default selects everything and by passing this string with fields preceded by a "-" sign we exclude whats not required

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

}) 







export  {
    registerUser
}