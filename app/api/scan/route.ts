import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(url, { timeout: 5000 });
    const html = response.data;

    const technical = {
      title: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || "Missing",
      description:
        (html.match(/<meta name="description" content="(.*?)"/i) || [])[1] ||
        "Missing",
      h1Count: (html.match(/<h1/gi) || []).length,
      imgAltMissing: (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
    };

    let score = 100;
    if (technical.title === "Missing") score -= 20;
    if (technical.description === "Missing") score -= 20;
    if (technical.h1Count === 0) score -= 10;
    if (technical.imgAltMissing > 5) score -= 10;

    const improvements = [
      { title: "Optimize meta description", priority: "high" },
      { title: "Add proper H1 tags", priority: "high" },
      { title: "Add alt text to images", priority: "medium" },
    ];

    return NextResponse.json(
      {
        technical,
        improvements,
        score: Math.max(0, score),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to scan site", message: error.message },
      { status: 500 }
    );
  }
}
