import { resend } from "../lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystry message | Verification Code',
            react: VerificationEmail({username, otp:verifyCode})
        });
        return {success:true, message:"Sent verification email"};
    } catch (error) {
        console.log("Error sending verification email", error);
        return {success:false, message:"Failed to send verification email"};
    }
}
