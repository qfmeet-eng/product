const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String,
         required: true
         },
    
    email: {
        type: String,
        required: true,
        
    },

    password: {
        type: String,
        required: true
    },
 

    isDelete: {
        type: Boolean,
        default: false
    },
    isActive:{
        type:Boolean,
        default:true
    },

    token: {
     type: String,
      required: true 
    },
    tokenExpire:{
        type: Date,
        default:null
    },

    deleteAt: {
        type: Date,
        default: null
    },

    updatedAt: {
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

   
});

const User = mongoose.model("User", userSchema);
module.exports = User;
