import { resend } from "@/lib/resend";
import VerificationEmail from "../../email/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "mystery message | verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    return {
      success: true,
      message: "verification email send verification successfully",
    };
  } catch (emailError) {
    console.log("Error sending verification email", emailError);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
