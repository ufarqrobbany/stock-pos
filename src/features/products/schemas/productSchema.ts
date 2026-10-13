import { z } from 'zod';

const numericPriceSchema = z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && !Number.isNaN(Number(val)), {
        message: 'Harga jual wajib diisi dan berupa angka.',
    })
    .transform((val) => Number(val))
    .pipe(z.number().min(0, 'Harga jual tidak boleh negatif.'));

const numericStockSchema = z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && !Number.isNaN(Number(val)), {
        message: 'Batas stok wajib diisi dan berupa angka.',
    })
    .transform((val) => Number(val))
    .pipe(z.number().min(0, 'Batas stok tidak boleh negatif.'));

export interface ProductVariantDraft {
    id: string;
    variantName: string;
    sku: string;
    sellingPrice: number | string;
    lowStockThreshold: number | string;
}

export const productVariantDraftSchema = z.object({
    id: z.string().default(() => crypto.randomUUID()),
    variantName: z.string().trim().min(1, 'Nama semua varian wajib diisi.'),
    sku: z.string().trim().min(1, 'SKU semua varian wajib diisi.'),
    sellingPrice: numericPriceSchema,
    lowStockThreshold: numericStockSchema,
});

export type ValidatedProductVariant = z.infer<typeof productVariantDraftSchema>;

export function createEmptyVariant(): ProductVariantDraft {
    return {
        id: crypto.randomUUID(),
        variantName: '',
        sku: '',
        sellingPrice: '',
        lowStockThreshold: '',
    };
}

export const productVariantsArraySchema = z
    .array(productVariantDraftSchema)
    .min(1, 'Minimal tambahkan satu varian produk.')
    .superRefine((variants, ctx) => {
        const normalizedSkus = variants.map((v) => v.sku.trim().toLowerCase());
        const hasDuplicateSku = new Set(normalizedSkus).size !== normalizedSkus.length;

        if (hasDuplicateSku) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'SKU setiap varian harus unik.',
            });
        }
    });

export const simpleProductSchema = z.object({
    sku: z.string().trim().min(1, 'SKU wajib diisi untuk produk tanpa varian.'),
    sellingPrice: numericPriceSchema,
    lowStockThreshold: numericStockSchema,
});

export type SimpleProductFormData = z.infer<typeof simpleProductSchema>;

export function validateVariantForm(variants: ProductVariantDraft[]): string | null {
    const result = productVariantsArraySchema.safeParse(variants);
    if (!result.success) {
        return result.error.issues[0].message;
    }
    return null;
}

export function validateSimpleForm(
    sku: string,
    sellingPrice: number | string,
    lowStockThreshold: number | string
): string | null {
    const result = simpleProductSchema.safeParse({
        sku,
        sellingPrice,
        lowStockThreshold,
    });
    if (!result.success) {
        return result.error.issues[0].message;
    }
    return null;
}
