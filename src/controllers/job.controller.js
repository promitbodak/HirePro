import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Job} from "../models/job.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const createJob = asyncHandler(async (req, res) => {
    const user = req.user   // the associated user under whose profile job is being created
    if(!user){
        throw new ApiError(411, "req.user is not created / OR / have issue in createJob controller")
    }

    const {jobTitle, description, displayName, numericalParameters, intellectualParameters, numericalParametersScore, intellectualParametersScore } = req.body;

    if([jobTitle, description, displayName, numericalParameters, intellectualParameters, numericalParametersScore, intellectualParametersScore].some((field) => field === "")){
        throw new ApiError(400, "all fields are required [You cannot leave any field empty]")
    }

    const jobCoverImageLocalPath = req.file?.path
    if(!jobCoverImageLocalPath){
        throw new ApiError(400, "job cover-image is required")
    }

    const jobCoverImage = await uploadOnCloudinary(jobCoverImageLocalPath);

    const job = await Job.create({
        associatedUser: user,
        jobTitle,
        description,
        displayName,
        jobCoverImage: jobCoverImage?.url,
        numericalParameters,
        intellectualParameters,
        numericalParametersScore,
        intellectualParametersScore 
    })

    const createdJob = await Job.findById(job._id)

    if(!createdJob){
        throw new ApiError(500, "Something went wrong while creating the Job")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, createJob, "Job has been created successfully")
    )
})




export {
    createJob
}