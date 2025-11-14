const mongoose = require("mongoose")

const userSchema = mongoose.Schema({

    is_favorite:{
        type:Boolean,
        default:false
    },

    // productId:{
    //                 type:mongoose.Schema.Types.ObjectId,
    //                 ref: "Product",
    //                 required:true
    //         },
    })


const Product = mongoose.model("Product",userSchema);
module.exports =  Product