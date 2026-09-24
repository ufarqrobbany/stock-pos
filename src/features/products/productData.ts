import { db } from '@/db';
import type { Category, Product as DbProduct, ProductVariant } from '@/db/types/product';
import type { StockBalance } from '@/db/types/stock';

export const PRODUCT_SORT_FIELDS = ['name', 'categoryName', 'skuCount', 'price', 'stock'] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export interface ProductQuery {
    search?: string;
    categoryId?: string | null;
    sortBy?: ProductSortField;
    sortDirection?: 'asc' | 'desc';
}

export interface ProductListItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    categoryId: string;
    categoryName: string;
    skuCount: number;
    price: number | null;
    stock: number;
    isActive: boolean;
    variants: ProductListVariant[];
}

export interface ProductListVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
}

export interface ProductListResult {
    data: ProductListItem[];
    total: number;
}

export interface CreateProductInput {
    name: string;
    description?: string;
    categoryId: string;
    image?: string;
    hasVariants: boolean;
    sku?: string | null;
    sellingPrice?: number | null;
    lowStockThreshold?: number | null;
    isActive: boolean;
}

export interface CreateProductVariantInput {
    productId: string;
    variantName: string;
    sku: string;
    sellingPrice: number;
    lowStockThreshold: number;
    isActive: boolean;
}

function mapProductToListItem(
    product: DbProduct,
    categories: Category[],
    variants: ProductVariant[],
    stockBalances: StockBalance[]
): ProductListItem {
    const category = categories.find((item) => item.id === product.categoryId);
    const productVariants = variants.filter((variant) => variant.productId === product.id);
    const productStock = stockBalances
        .filter((balance) => balance.productId === product.id)
        .reduce((total, balance) => total + balance.quantity, 0);
    const variantPrices = productVariants.map((variant) => variant.sellingPrice);
    const productVariantItems = productVariants.map((variant) => ({
        id: variant.id,
        name: variant.variantName,
        sku: variant.sku,
        price: variant.sellingPrice,
        stock: stockBalances
            .filter((balance) => balance.variantId === variant.id)
            .reduce((total, balance) => total + balance.quantity, 0),
    }));

    return {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        imageUrl: product.image ?? null,
        categoryId: product.categoryId,
        categoryName: category?.name ?? 'Tanpa kategori',
        skuCount: product.hasVariants ? productVariants.length : product.sku ? 1 : 0,
        price: product.hasVariants
            ? variantPrices.length
                ? Math.min(...variantPrices)
                : null
            : (product.sellingPrice ?? null),
        stock: productStock,
        isActive: product.isActive,
        variants: productVariantItems,
    };
}

function compareValues(
    first: string | number | null,
    second: string | number | null,
    direction: 'asc' | 'desc'
): number {
    const multiplier = direction === 'desc' ? -1 : 1;

    if (first === second) return 0;
    if (first === null) return -1 * multiplier;
    if (second === null) return 1 * multiplier;

    if (typeof first === 'string' && typeof second === 'string') {
        return first.localeCompare(second, 'id') * multiplier;
    }

    return (first > second ? 1 : -1) * multiplier;
}

export async function loadProducts(query: ProductQuery = {}): Promise<ProductListResult> {
    const [products, categories, variants, stockBalances] = await Promise.all([
        db.products.toArray(),
        db.categories.toArray(),
        db.productVariants.toArray(),
        db.stockBalances.toArray(),
    ]);

    let result = products.map((product) => mapProductToListItem(product, categories, variants, stockBalances));

    const search = query.search?.trim().toLowerCase();
    if (search) {
        const productIdsBySku = new Set(
            variants.filter((variant) => variant.sku.toLowerCase().includes(search)).map((variant) => variant.productId)
        );

        result = result.filter(
            (product) =>
                product.name.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search) ||
                product.categoryName.toLowerCase().includes(search) ||
                productIdsBySku.has(product.id)
        );
    }

    if (query.categoryId) {
        result = result.filter((product) => product.categoryId === query.categoryId);
    }

    const sortBy = query.sortBy;
    if (sortBy) {
        const direction = query.sortDirection ?? 'asc';
        result.sort((first, second) => compareValues(first[sortBy], second[sortBy], direction));
    }

    return {
        data: result,
        total: result.length,
    };
}
