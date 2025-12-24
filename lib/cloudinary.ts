import { v2 as cloudinary } from "cloudinary";

if (!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
  throw new Error("Please add NEXT_PUBLIC_CLOUDINARY_API_KEY to .env.local");
}

if (!process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
  throw new Error("Please add NEXT_PUBLIC_CLOUDINARY_API_SECRET to .env.local");
}

// Extract cloud_name from NEXT_PUBLIC_CLOUDINARY_URL
// Format: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "";
const cloudNameMatch = cloudinaryUrl.match(/@([^.]+)/);
const cloudName = cloudNameMatch ? cloudNameMatch[1] : "";

cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to upload images
export async function uploadImage(
  file: Buffer | string,
  options?: {
    folder?: string;
    resource_type?: "image" | "raw" | "video" | "auto";
    public_id?: string;
  }
) {
  const folder = options?.folder || "/sales_flow/profile_images";

  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder,
      resource_type: options?.resource_type || "image",
      public_id: options?.public_id,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

// Helper function to upload documents
export async function uploadDocument(
  file: Buffer | string,
  options?: {
    folder?: string;
    public_id?: string;
  }
) {
  return uploadImage(file, {
    ...options,
    resource_type: "raw",
    folder: options?.folder || "/sales_flow/documents",
  });
}

// Helper function to delete file
export async function deleteFile(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
}
