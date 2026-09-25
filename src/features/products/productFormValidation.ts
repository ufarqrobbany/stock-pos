// Tipe draft varian yang dipakai di form create & edit produk.
export interface ProductVariantDraft {
    id: string;
    variantName: string;
    sku: string;
    sellingPrice: number | string;
    lowStockThreshold: number | string;
}

// Membuat draft varian kosong untuk form.
export function createEmptyVariant(): ProductVariantDraft {
    return {
        id: crypto.randomUUID(),
        variantName: '',
        sku: '',
        sellingPrice: '',
        lowStockThreshold: '',
    };
}

// Validasi form produk dengan varian.
// Mengembalikan pesan error, atau null jika valid.
export function validateVariantForm(variants: ProductVariantDraft[]): string | null {
    if (!variants.length) {
        return 'Minimal tambahkan satu varian produk.';
    }

    const normalizedSkus = variants.map((variant) => variant.sku.trim().toLowerCase());
    if (new Set(normalizedSkus).size !== normalizedSkus.length) {
        return 'SKU setiap varian harus unik.';
    }

    if (variants.some((variant) => !variant.variantName.trim())) {
        return 'Nama semua varian wajib diisi.';
    }

    if (variants.some((variant) => !variant.sku.trim())) {
        return 'SKU semua varian wajib diisi.';
    }

    if (
        variants.some(
            (variant) =>
                variant.sellingPrice === '' ||
                !Number.isFinite(Number(variant.sellingPrice)) ||
                Number(variant.sellingPrice) < 0
        )
    ) {
        return 'Harga jual semua varian wajib diisi dan tidak boleh negatif.';
    }

    if (
        variants.some(
            (variant) =>
                variant.lowStockThreshold === '' ||
                !Number.isFinite(Number(variant.lowStockThreshold)) ||
                Number(variant.lowStockThreshold) < 0
        )
    ) {
        return 'Batas stok semua varian wajib diisi dan tidak boleh negatif.';
    }

    return null;
}

// Validasi form produk tanpa varian.
// Mengembalikan pesan error, atau null jika valid.
export function validateSimpleForm(
    sku: string,
    sellingPrice: number | string,
    lowStockThreshold: number | string
): string | null {
    if (!sku.trim()) {
        return 'SKU wajib diisi untuk produk tanpa varian.';
    }

    if (sellingPrice === '' || !Number.isFinite(Number(sellingPrice)) || Number(sellingPrice) < 0) {
        return 'Harga jual wajib diisi dan tidak boleh negatif.';
    }

    if (
        lowStockThreshold === '' ||
        !Number.isFinite(Number(lowStockThreshold)) ||
        Number(lowStockThreshold) < 0
    ) {
        return 'Batas stok minimum wajib diisi dan tidak boleh negatif.';
    }

    return null;
}
