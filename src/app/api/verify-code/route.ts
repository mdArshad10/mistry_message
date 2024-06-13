import dbConnection from "@/lib/dbConnect";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  await dbConnection();

  try {
    const { username, code } = await request.json();

    const decodeUserName = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodeUserName });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not exist",
        },
        {
          status: 500,
        }
      );
    }

    // first find the user code
    const isCodeValid = user.verifyCode.toString() === code.toString();

    // check code is expired or not
    const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    } else {
      if (!isCodeValid) {
        return Response.json(
          {
            success: false,
            message: "Code is invalid",
          },
          {
            status: 400,
          }
        );
      }
      if (!isCodeExpired) {
        return Response.json(
          {
            success: false,
            message: "Verification code has expired",
          },
          {
            status: 400,
          }
        );
      }
    }
  } catch (error) {
    console.error("Error Verifying user code", error);

    return Response.json(
      {
        success: false,
        message: "Error Verifying user code",
      },
      {
        status: 500,
      }
    );
  }
}
