const mongoose = require("mongoose")
 
const userSchema = mongoose.Schema(
    {
        name: {
            type:String,
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
const Category = mongoose.model("Category",userSchema);
module.exports = Category