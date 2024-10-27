import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request:Request) {
    await dbConnect()
    try{
        const { username, code } = await request.json()
        const decodedUserName = decodeURIComponent(username)
        const user = await UserModel.findOne({decodedUserName})
        if(!user){
            return Response.json(
                {
                    success:false,
                    message:"User not found"
                },
                {
                    status:500
                }
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeExpired) {
            user.isVerified = true
            await user.save();

            return Response.json(
                {
                    success:true,
                    message:"Account Verified Successfully"
                },
                {
                    status:200
                }
            )
        }
        else if(!isCodeExpired){
            return Response.json(
                {
                    success:false,
                    message:"Verification code has expires please signup again to get a new code"
                },
                {
                    status:400
                }
            )
        }
        else{
            return Response.json(
                {
                    success:false,
                    message:"Incorrect Verification code"
                },
                {
                    status:400
                }
            )
        }

    }
    catch(error)
    {
        console.log("Error Verifying User", error)
        return Response.json(
            {
                success:false,
                message:"Error Verifying User"
            },
            {
                status:500
            }
        )
    }
}