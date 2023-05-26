const imageValidate = (images)=>{
    let imageTable = [];

    // If images is more than one else single image 
    if(Array.isArray(images)){
        imageTable = images;
    }else{
        imageTable.push(images);
    }

    if(imageTable.length > 3){
        return {error: "Send only 3 images at once"}
    }

    for(let image of imageTable){
        if(image.size > 1048576){
            return {error: "Images Size should be less or equal to 1 MB."}
        }

        const filetypes = /jpg|jpeg|png/;
        const mimetypes = filetypes.test(image.mimetypes);

        if(!mimetypes) return {error: "Incorrect mime type (Should be jpg,jpeg,png)."}
    }

    // If no errors Come 
    return {error: false};
}

module.exports = imageValidate;
