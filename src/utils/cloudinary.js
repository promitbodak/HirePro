// its on <bodakpromit@gmail.com> Cloudinary account

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto"})

        // At this stage FILE has been successfully uploaded
        console.log("file is uploaded successfully on cloudinary. - ", response.url);

        fs.unlinkSync(localFilePath) // Its required to remove the locally stored instance whether its successfull or not
        
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)  // Removes locally stored temp file if upload fails
    }
}


export {uploadOnCloudinary}