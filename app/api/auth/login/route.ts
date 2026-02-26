import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

    // Demo login - in production, use real database
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
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Login failed", message: error.message },
      { status: 500 }
    );
  }
}
