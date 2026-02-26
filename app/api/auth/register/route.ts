import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now();
    const token = jwt.sign(
      { id, email, role: "user" },
      process.env.JWT_SECRET || "secret"
    );

    return NextResponse.json(
      {
        token,
        user: { id, email, role: "user", plan: "free" },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Registration failed", message: error.message },
      { status: 500 }
    );
  }
}
