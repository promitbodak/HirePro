import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import jwt  from "jsonwebtoken"




//An auxiliary function to generate tokens used by both login and logout controller
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken     // assigning refreshToken value to the already existing empty field named by refreshToken inside the User schema

        await user.save(
            {
                validateBeforeSave: false    // saving the user change but not validating the entire schema before save
            }
        )

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}



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



const loginUser = asyncHandler(async (req, res) => {
    // fetch data from req body
    // username or email
    // find the user 
    // password check
    // access and refresh Token generate and provide
    // send to secure cookies

    const {username, email, password} = req.body

    if(!(username || email)){
        throw new ApiError(405, "username OR email is required")
    }

    const user = await User.findOne(
        {
            $or: [{username}, {email}]
        }
    )
    if(!user){
        throw new ApiError(406, "user Not Found")
    }


    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(407, "Password is Incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")   //The user object without the specific parameter mentioned inside the select() statement
    
    const options = {
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {loggedInUser, accessToken, refreshToken}, "User logged in Successfully")
    )

})



const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged Out successfully")
    )
})



const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(408, "Unauthorized request, No refresh token present")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(409, "Invalid refreshToken")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(410, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(409, "Invalid refresh Token")
    }
})



const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password =  newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {} , "Password changed successfully"))
})



const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})



const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email, companyName} = req.body

    if(!fullName || !email || !companyName){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
                companyName: companyName
            }
        },
        {
            new: true     // by this the return object will be returned after the updates
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User information updated successfully"))
})



const updateUserAvater = asyncHandler(async (req, res) => {
    const avaterLocalPath = req.file?.path

    if(!avaterLocalPath){
        throw new ApiError(400, "Avater file is missing")
    }

    // Work to be done -- MAKE FUNCTIONALITY TO DELETE THE PREVIOUS IMAGE

    const avater = await uploadOnCloudinary(avaterLocalPath)

    if(!avater.url){
        throw new ApiError(400, "Error while uploading avater")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avater: avater.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avater updated successfully")
    )
})



const updateUserCoverImage = asyncHandler(async (req, res) => {
    
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file is missing")
    }

    // work to be done -- MAKE FUNCTIONALITY TO DELETE THE PREVIOUS IMAGE

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})






export  {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvater,
    updateUserCoverImage
}