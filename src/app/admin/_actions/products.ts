"use server"

import AWS from 'aws-sdk'
import db from "@/db/db"
import { z } from "zod"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const fileSchema = z.instanceof(File, { message: "Required" })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/")
)

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required"),
})

async function uploadToS3(buffer, fileName, bucket) {
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: buffer,
    ContentType: 'application/octet-stream', // You might want to adjust based on file type
    ACL: 'public-read' // This makes the file publicly accessible
  };

  return s3.upload(params).promise();
}

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // Handle file upload
  const fileName = `${crypto.randomUUID()}-${data.file.name}`;
  const fileBuffer = Buffer.from(await data.file.arrayBuffer());

  // Handle image upload
  const imageName = `${crypto.randomUUID()}-${data.image.name}`;
  const imageBuffer = Buffer.from(await data.image.arrayBuffer());

  // Upload to S3
  const fileUploadResult = await uploadToS3(fileBuffer, fileName, process.env.AWS_S3_BUCKET_NAME);
  const imageUploadResult = await uploadToS3(imageBuffer, imageName, process.env.AWS_S3_BUCKET_NAME);

  // Get URLs
  const fileUrl = fileUploadResult.Location;
  const imageUrl = imageUploadResult.Location;

  // Create product record in the database
  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: fileUrl,
      imagePath: imageUrl,
    },
  });

  // Trigger revalidation and redirect
  revalidatePath('/');
  revalidatePath('/products');
  redirect('/admin/products');
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });

  if (product == null) return notFound();

  let fileUrl = product.filePath;
  if (data.file != null && data.file.size > 0) {
    // Upload new file
    const fileName = `${crypto.randomUUID()}-${data.file.name}`;
    const fileBuffer = Buffer.from(await data.file.arrayBuffer());
    const fileUploadResult = await uploadToS3(fileBuffer, fileName, process.env.AWS_S3_BUCKET_NAME);
    fileUrl = fileUploadResult.Location;
  }

  let imageUrl = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    // Upload new image
    const imageName = `${crypto.randomUUID()}-${data.image.name}`;
    const imageBuffer = Buffer.from(await data.image.arrayBuffer());
    const imageUploadResult = await uploadToS3(imageBuffer, imageName, process.env.AWS_S3_BUCKET_NAME);
    imageUrl = imageUploadResult.Location;
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: fileUrl,
      imagePath: imageUrl,
    },
  });

  revalidatePath('/');
  revalidatePath('/products');
  redirect('/admin/products');
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })

  revalidatePath("/")
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } })

  if (product == null) return notFound()

  // Delete from S3
  const fileName = product.filePath.split('/').pop(); // Extract filename
  const imageName = product.imagePath.split('/').pop(); // Extract filename

  await s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  }).promise();

  await s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: imageName,
  }).promise();

  revalidatePath("/")
  revalidatePath("/products")
}
