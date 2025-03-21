import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullname:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String
    }
    
})

const User = mongoose.model("User",userSchema);
export default User