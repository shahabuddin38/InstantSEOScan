import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const adminSecret = req.headers.get("x-admin-secret");

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now();
    const token = jwt.sign(
      { id, email, role: "admin" },
      process.env.JWT_SECRET || "secret"
    );

    return NextResponse.json(
      {
        token,
        user: { id, email, role: "admin", plan: "premium" },
        message: "Admin user created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Admin creation failed", message: error.message },
      { status: 500 }
    );
  }
}
