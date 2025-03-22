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
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    passwordLastChanged: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;