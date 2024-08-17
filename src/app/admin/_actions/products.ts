"use server"
import AWS from 'aws-sdk';
import { z } from 'zod';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import db from '@/db/db';

// AWS S3 Configuration
const s3 = new AWS.S3({
  region: 'us-east-2', // e.g., 'us-east-1'
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_ACCESS_KEY_SECRET,
});

const bucketName = 'e-commerce-official-bucket'; // replace with your bucket name

const fileSchema = z.instanceof(File, { message: 'Required' });
const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith('image/'));

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, 'Required'),
  image: imageSchema.refine(file => file.size > 0, 'Required'),
});

async function uploadToS3(file: File, folder: string): Promise<string> {
  const fileName = `${crypto.randomUUID()}-${file.name}`;
  
  // Convert ArrayBuffer to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const params = {
    Bucket: bucketName,
    Key: `${folder}/${fileName}`,
    Body: buffer, // Use Buffer directly
    ContentType: file.type,
  };

  try {
    const { Location } = await s3.upload(params).promise();
    return Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const fileUrl = await uploadToS3(data.file, 'products/files');
  const imageUrl = await uploadToS3(data.image, 'products/images');

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

  revalidatePath('/');
  revalidatePath('/products');
  redirect('/admin/products');
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });

  if (product == null) return notFound();

  let fileUrl = product.filePath;
  if (data.file != null && data.file.size > 0) {
    // Delete old file from S3
    await s3.deleteObject({
      Bucket: bucketName,
      Key: new URL(product.filePath).pathname.slice(1), // Remove leading '/'
    }).promise();

    fileUrl = await uploadToS3(data.file, 'products/files');
  }

  let imageUrl = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    // Delete old image from S3
    await s3.deleteObject({
      Bucket: bucketName,
      Key: new URL(product.imagePath).pathname.slice(1), // Remove leading '/'
    }).promise();

    imageUrl = await uploadToS3(data.image, 'products/images');
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

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } });

  revalidatePath('/');
  revalidatePath('/products');
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });

  if (product == null) return notFound();

  await s3.deleteObject({
    Bucket: bucketName,
    Key: new URL(product.filePath).pathname.slice(1),
  }).promise();

  await s3.deleteObject({
    Bucket: bucketName,
    Key: new URL(product.imagePath).pathname.slice(1),
  }).promise();

  revalidatePath('/');
  revalidatePath('/products');
}
