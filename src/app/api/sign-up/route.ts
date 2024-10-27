import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";

export async function POST(request:Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();
        const userexistANDverified = await UserModel.findOne({ username, isVerified:true });
        if(userexistANDverified)
        {
            return Response.json({
                success:false,
                message:"Username Already Taken"
            },{ status: 400 })
        }
        const userEmailExist = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random()*900000).toString();
        if(userEmailExist){
            if(userEmailExist.isVerified){
                return Response.json({
                    success:false,
                    message: "User already exist with this email"
                },{ status: 400})
            }
            else{
                const hashedPassword = await bcrypt.hash(password,10);
                userEmailExist.password = hashedPassword;
                userEmailExist.verifyCode = verifyCode;
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours()+1);
                userEmailExist.verifyCodeExpiry = expiryDate;
                await userEmailExist.save();
            }
        }
        else{
            const hashedPassword = await bcrypt.hash(password,10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours()+1);
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )   

        if(!emailResponse.success){
            return Response.json({
                success:false,
                message: emailResponse.message
            },{ status: 500})
        }

        return Response.json({
            success:true,
            message: "User registered successfully. Please Verify your email"
        },{ status: 201 })
    } 
    catch (error) {
        console.log("Error Registering User", error)
        return Response.json(
            {
                success:false,
                message:"Error Registering User"
            },
            {
                status:500
            }
        )
    }
}
