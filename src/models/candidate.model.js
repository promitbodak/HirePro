import mongoose, {Schema} from "mongoose";


const candidateSchema = new Schema(
    {
        candidateName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        resume: {
            type: String, // cloudinary URL
            required: true
        },
        institute: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    }
)


export const Candidate = mongoose.model("Candidate", candidateSchema)