import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "../../../lib/auth";

export const GET = async (req) => {
  return NextAuth(req, authOptions);
};

export const POST = async (req) => {
  return NextAuth(req, authOptions);
};