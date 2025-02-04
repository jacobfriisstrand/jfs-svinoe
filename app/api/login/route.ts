import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === "sommerhus") {
      const headers = new Headers();
      headers.append("Set-Cookie", `site-auth=sommerhus; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);

      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    }

    return new NextResponse(JSON.stringify({ success: false }), { status: 401 });
  } catch (error) {
    console.error("Auth error:", error);
    return new NextResponse(JSON.stringify({ success: false, error: "Invalid request" }), { status: 400 });
  }
}
