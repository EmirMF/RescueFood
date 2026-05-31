import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "MERCHANT") {
    return fail("Only merchants can upload listing images", 403);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return fail("file is required");
  }

  if (!file.type.startsWith("image/")) {
    return fail("Only image uploads are supported");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  return ok({ url: `/uploads/${safeName}` }, { status: 201 });
}
