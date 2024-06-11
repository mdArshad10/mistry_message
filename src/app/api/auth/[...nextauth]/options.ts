import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text ",
          placeholder: "eg. Username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "eg. Password",
        },
      },

      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("not user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("plz verify your account before login");
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordMatch) {
            throw new Error("incorrect password");
          }

          return user;
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET_KEY,
  callbacks: {
    async session({ session, token }) {
      if(token){
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user,  }) {
      if(user){
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
  },
};
