import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { minioClient, MINIO_BUCKET, MINIO_PUBLIC_BASE_URL } from "@/lib/minio";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "-");
  const key = `products/${Date.now()}-${safeName}`;

  try {
    await minioClient.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    const base = MINIO_PUBLIC_BASE_URL.replace(/\/$/, "");
    const url = `${base}/${MINIO_BUCKET}/${key}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[POST /api/admin/uploads/product-image]", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}

