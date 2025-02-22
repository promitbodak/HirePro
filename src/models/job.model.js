import mongoose, {Schema} from "mongoose"



const jobSchema = new Schema(
    {
        jobTitle: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        description: {      // contains the broder description of the job role and responsibilities
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        jobCoverImage: {
            type: String   // cloudinary url
        },
        numericalParameters: {
            type: [String], // Only for Numerical parameters like [TechnicalSkills, workExperience, Education, certifications, etc....]
            required: true
        },
        intellectualParameters: {
            type: [String], // Only for Intellectual parameters that can be verifyable via LLMs like [Project complexity, Problem solving skill, Leadershi & ownership, communication, etc...]
            required: true
        },
        numericalParametersScore: {
            type: [Number], // Stores the maximum scores associated with each parameter sequentially
            required: true
        },
        intellectualParametersScore: {
            type: [Number],
            required: true
        },
        associatedUser: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }


    }
)



export const Job = mongoose.model("Job", jobSchema)