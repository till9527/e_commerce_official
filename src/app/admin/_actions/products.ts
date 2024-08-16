import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import path from 'path';

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // Handle file upload
  const tmpProductsDir = path.join('/tmp', 'products');
  await fs.mkdir(tmpProductsDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}-${data.file.name}`;
  const filePath = path.join(tmpProductsDir, fileName);
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  // Handle image upload
  const imageName = `${crypto.randomUUID()}-${data.image.name}`;
  const imagePath = path.join(tmpProductsDir, imageName);
  await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));

  // Create product record in the database
  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: `/products/${fileName}`, // Assuming you move this to static directory
      imagePath: `/products/${imageName}`, // Assuming you move this to static directory
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
});

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

  let filePath = product.filePath;
  if (data.file != null && data.file.size > 0) {
    if (filePath) {
      await fs.unlink(`/tmp/products/${path.basename(filePath)}`); // Remove the old file
    }
    filePath = path.join('/tmp', 'products', `${crypto.randomUUID()}-${data.file.name}`);
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
    filePath = `/products/${path.basename(filePath)}`; // Update to the static path if you move it
  }

  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    if (imagePath) {
      await fs.unlink(`/tmp/products/${path.basename(imagePath)}`); // Remove the old image
    }
    imagePath = path.join('/tmp', 'products', `${crypto.randomUUID()}-${data.image.name}`);
    await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));
    imagePath = `/products/${path.basename(imagePath)}`; // Update to the static path if you move it
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
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } });

  revalidatePath("/");
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });

  if (product == null) return notFound();

  await fs.unlink(`/tmp/products/${path.basename(product.filePath)}`);
  await fs.unlink(`/tmp/products/${path.basename(product.imagePath)}`);

  revalidatePath("/");
  revalidatePath("/products");
}
