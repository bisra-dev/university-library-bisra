"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import ratelimit from "../ratelimit";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) redirect("/too-fast");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    console.log(error, "signIn Error");
    return {
      success: false,
      error: "Authentication failed. Please verify credentials.",
    };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password, universityId, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) redirect("/too-fast");

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    const loginResult = await signInWithCredentials({ email, password });
    if (!loginResult.success) {
      return {
        success: true,
        warning: "Account created successfully, but automatic login failed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "signUp Error");
    return {
      success: false,
      error: "An unexpected processing error occurred during sign up.",
    };
  }
};