const mongoose = require("mongoose")
const userSchema = mongoose.Schema(
    {
        name: {
            type:String,
            required:true
        },
        categoryId:{
                type:mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required:true
        },
        isActive:{
            type:Boolean,
            default:false
        },
       isDelete:{
        type:Boolean,   
        default:false
       },
        createdAt: Date || null,
        deletedAt: Date|| null,
        updatedAt: Date|| null
        
    }

)
const SubCategory = mongoose.model("SubCategory",userSchema);
module.exports =  SubCategory