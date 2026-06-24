import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { addWorkspaceResource } from "@/server/services/resources";
import { AppError } from "@/server/services/errors";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const projectId = String(formData.get("projectId") ?? "");
    const file = formData.get("file");
    if (!projectId || !(file instanceof File)) throw new AppError("A project and file are required.");
    if (file.size === 0 || file.size > MAX_FILE_SIZE) throw new AppError("Files must be between 1 byte and 10 MB.");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) throw new AppError("Cloudinary uploads are not configured.", 503);

    const uploadBody = new FormData();
    uploadBody.append("file", file, file.name);
    uploadBody.append("folder", `project-matchmaker/${projectId}`);
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
      body: uploadBody,
    });
    if (!upload.ok) {
      const failure = await upload.json().catch(() => ({})) as { error?: { message?: string } };
      throw new AppError(`Cloudinary upload failed: ${failure.error?.message ?? "Unknown provider error."}`, 502);
    }
    const result = await upload.json() as { secure_url?: string };
    if (!result.secure_url) throw new Error("Cloudinary did not return a file URL.");

    const resource = await addWorkspaceResource({ projectId, name: file.name, url: result.secure_url, mimeType: file.type || "application/octet-stream", bytes: file.size, uploadedById: user.id }, user.id);
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not upload this file." }, { status });
  }
}
