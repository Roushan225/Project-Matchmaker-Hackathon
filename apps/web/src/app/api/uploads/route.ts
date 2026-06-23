import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "File uploads require a storage provider. Configure one before enabling attachments." }, { status: 501 });
}
