const mongoose = require("mongoose");
 
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
         subCategoryId:{
                type:mongoose.Schema.Types.ObjectId,
                ref: "SubCategory",
                required:true
        },
         image:{
            type:String,
            required:true
        },
        isActive:{
            type:Boolean,
            default:false
        },
        price:{
            type:Number,
            required:true
        },
        isDelete:{
        type:Boolean,           
        default:false
       },
        createdAt: Date || null,
        deletedAt: Date || null,
        updatedAt: Date || null
        
    }

)
const Product = mongoose.model("Product",userSchema);
module.exports =  Product