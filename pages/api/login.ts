import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { password } = req.body;

    if (password === "sommerhus") {
      res.setHeader("Set-Cookie", `site-auth=sommerhus; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: "Invalid password" });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(400).json({ success: false, message: "Invalid request" });
  }
}
