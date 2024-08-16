"use server"

import db from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import path from 'path';

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

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // Use static/images directory for file operations
  const staticImagesDir = path.join(process.cwd(), 'public', 'static', 'images');
  await fs.mkdir(staticImagesDir, { recursive: true });

  // Handle file upload
  const fileName = `${crypto.randomUUID()}-${data.file.name}`;
  const filePath = path.join(staticImagesDir, fileName);
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  // Handle image upload
  const imageName = `${crypto.randomUUID()}-${data.image.name}`;
  const imagePath = path.join(staticImagesDir, imageName);
  await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));

  // Create product record in the database
  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: `/static/images/${fileName}`, // Adjust this to the new path
      imagePath: `/static/images/${imageName}`, // Adjust this to the new path
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

  let filePath = product.filePath ? path.join(process.cwd(), 'public', product.filePath) : null;
  if (data.file != null && data.file.size > 0) {
    // Remove the old file
    if (filePath) {
      await fs.unlink(filePath);
    }
    const staticImagesDir = path.join(process.cwd(), 'public', 'static', 'images');
    await fs.mkdir(staticImagesDir, { recursive: true });
    filePath = path.join(staticImagesDir, `${crypto.randomUUID()}-${data.file.name}`);
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
    filePath = `/static/images/${path.basename(filePath)}`; // Update to the relative path
  }

  let imagePath = product.imagePath ? path.join(process.cwd(), 'public', product.imagePath) : null;
  if (data.image != null && data.image.size > 0) {
    // Remove the old image
    if (imagePath) {
      await fs.unlink(imagePath);
    }
    const staticImagesDir = path.join(process.cwd(), 'public', 'static', 'images');
    await fs.mkdir(staticImagesDir, { recursive: true });
    imagePath = path.join(staticImagesDir, `${crypto.randomUUID()}-${data.image.name}`);
    await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));
    imagePath = `/static/images/${path.basename(imagePath)}`; // Update to the relative path
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
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

  if (product.filePath) {
    await fs.unlink(path.join(process.cwd(), 'public', product.filePath))
  }
  if (product.imagePath) {
    await fs.unlink(path.join(process.cwd(), 'public', product.imagePath))
  }

  revalidatePath("/")
  revalidatePath("/products")
}

