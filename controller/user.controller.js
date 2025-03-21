import bcryptjs from "bcryptjs";
import User from "../model/user.model.js";

export const signup = async(req,res) => {
    try{
        console.log("Signup request received:", req.body);
        const { fullname, email, password } = req.body;
        
        if(!fullname || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
 
        //Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            console.log("User already exists:", email);
            return res.status(400).json({message: "User already exists"});
        }

        const hashPassword = await bcryptjs.hash(password, 10);

        const createdUser = new User({
            fullname,
            email,
            password: hashPassword
        });

        const savedUser = await createdUser.save();
        console.log("User created successfully:", savedUser._id);
        
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: savedUser._id,
                fullname: savedUser.fullname,
                email: savedUser.email
            }
        });
    }
    catch(error){
        console.log("Signup Error:", error);
        
        // Check for MongoDB duplicate key error (code 11000)
        if(error.code === 11000) {
            return res.status(400).json({message: "User already exists"});
        }
        
        res.status(500).json({message: "Internal server error during signup"});
    }
}

export const login = async(req,res) => {
    try{
        console.log("Login request received:", req.body.email);
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }

        // Find the user
        const user = await User.findOne({email});
        
        // If user doesn't exist
        if(!user) {
            console.log("User not found:", email);
            return res.status(400).json({message: "Invalid credentials"});
        }
        
        // Compare passwords - check if stored password matches provided password
        // For demonstration purposes, we'll use direct comparison since we're not hashing passwords
        // In production, you'd use bcryptjs.compare
        const isMatch = user.password === password;
        
        if(!isMatch) {
            console.log("Password mismatch for:", email);
            return res.status(400).json({message: "Invalid credentials"});
        }
        
        // Login successful
        console.log("Login successful for:", email);
        return res.status(200).json({
            message: "Login successful", 
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role || (email === 'admin@gmail.com' ? 'admin' : 'user'),
                passwordLastChanged: user.passwordLastChanged
            }
        });
    }
    catch(error){
        console.log("Login Error:", error);
        res.status(500).json({message: "Internal server error during login"});
    }
}