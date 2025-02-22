import mongoose, {Schema} from "mongoose";



const applicationSchema = new Schema (
    {
        associatedJob: {
            type: Schema.Types.ObjectId,
            ref: "Job"
        },
        associatedCandidate: {
            type: Schema.Types.ObjectId,
            ref: "Candidate"
        },
        numericalScores: {
            type: [Number],
            required: true
        },
        intellectualScores: {
            type: [Number],
            required: true
        },
        mentionedSkills: {
            type: [String]
        },
        mentionedEducation: {
            type: [String]
        } 
    }
)


export const Application = mongoose.model("Application", applicationSchema)