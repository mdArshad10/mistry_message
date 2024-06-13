import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    // in next-js hum jab bhi request se data leti hai to hum us waqt await lagte hi lagte hai
    const { username, email, password } = await request.json();

    // check the user is already exist or not
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    console.log(existingUserVerifiedByUsername);

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    // create a verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // check the user is already exist or not by email
    const existingUserByEmail = await UserModel.findOne({ email });
    console.log(existingUserByEmail);

    if (existingUserByEmail) {
      // if the user has registered but not verified
      if (!existingUserByEmail.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10); // hash the password
        // update the password, verifyCode and verifyCodeExpiry
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      // if the user is new
      const hashedPassword = await bcrypt.hash(password, 10); // hash the password
      const ExpireDate = new Date();
      ExpireDate.setHours(ExpireDate.getHours() + 1); // create a expire Date

      // create a new user
      const newUserCreated = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: ExpireDate,
        isVerified: false,
        message: [],
      });

      await newUserCreated.save();
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );


    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. please verify your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error Registering User", error);
    return Response.json(
      {
        success: true,
        message: "Error occurred while registering",
      },
      {
        status: 500,
      }
    );
  }
}
