import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnection from "@/lib/dbConnect";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  await dbConnection();
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        { status: 401 }
      );
    }
    const userId = user._id;
    const { acceptMessage } = await request.json();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessage,
      },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status to accept message",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept message");

    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept message",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnection();
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        { status: 401 }
      );
    }
    const userId = user._id;

    const userFindById =await UserModel.findById(userId);
    
    if(!userFindById){
        return Response.json(
          {
            success: false,
            message: "user not found because userId is not specified",
          },
          { status: 500 }
        );
    }

    return Response.json(
      {
        success: true,
        message: "user not found because userId is not specified",
        isAcceptingMessage: userFindById.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error is getting message acceptance status");

    return Response.json(
      {
        success: false,
        message: "Error is getting message acceptance status",
      },
      { status: 500 }
    );
  }
}
