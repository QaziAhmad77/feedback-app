import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: Request) {
  await dbConnect();
// Why Use getServerSession
// SSR Authentication: Allows you to check authentication status and fetch user data server-side before rendering, enabling conditional rendering or redirecting unauthenticated users.
// Server-Side Authorization: Useful for restricting access to API routes or sensitive data based on the user's session details without relying on client-side checks.
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id);
  try {
    const user = await UserModel.aggregate([
      // This stage filters the documents to only include the one with the matching _id. In our case, it returns:
      { $match: { _id: userId } },
      // This stage breaks down the messages array into separate documents, with each message becoming its own document. The output will be:
      // [
      //   {
      //     "_id": "671a20ee20e0567089aab75c",
      //     "messages": {
      //       "content": "What's your favorite movie?",
      //       "createdAt": "2024-10-25T06:47:53.075+00:00",
      //       "_id": "671b3f19e5bc5c3f4bef062c"
      //     }
      //   },
      //   {
      //     "_id": "671a20ee20e0567089aab75c",
      //     "messages": {
      //       "content": "What's your dream job?",
      //       "createdAt": "2024-10-25T06:47:58.495+00:00",
      //       "_id": "671b3f1ee5bc5c3f4bef0630"
      //     }
      //   },
      //   {
      //     "_id": "671a20ee20e0567089aab75c",
      //     "messages": {
      //       "content": "Do you have any pets?",
      //       "createdAt": "2024-10-25T06:48:01.167+00:00",
      //       "_id": "671b3f21e5bc5c3f4bef0635"
      //     }
      //   }
      // ]
      { $unwind: "$messages" },
      // This stage sorts the documents by the createdAt field of the messages in descending order. The sorted output will be:
      { $sort: { "messages.createdAt": -1 } },
      // This stage groups the documents back into a single document by the _id and reconstructs the messages array, preserving the sorted order. The final output will be:
      // {
      //   "_id": "671a20ee20e0567089aab75c",
      //   "messages": [
      //     {
      //       "content": "Do you have any pets?",
      //       "createdAt": "2024-10-25T06:48:01.167+00:00",
      //       "_id": "671b3f21e5bc5c3f4bef0635"
      //     },
      //     {
      //       "content": "What's your dream job?",
      //       "createdAt": "2024-10-25T06:47:58.495+00:00",
      //       "_id": "671b3f1ee5bc5c3f4bef0630"
      //     },
      //     {
      //       "content": "What's your favorite movie?",
      //       "createdAt": "2024-10-25T06:47:53.075+00:00",
      //       "_id": "671b3f19e5bc5c3f4bef062c"
      //     }
      //   ]
      // }
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]).exec();

    if (!user || user.length === 0) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
