import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import jwt from "jsonwebtoken";

function authenticateToken(req: NextRequest): any {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return null;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    return user;
  } catch (err) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://${process.env.RAPIDAPI_HOST_KEYWORDS}/search`,
      {
        params: { q: query },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST_KEYWORDS,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "RapidAPI Error", message: error.message },
      { status: 500 }
    );
  }
}
