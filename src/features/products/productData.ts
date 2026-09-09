export interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    category: string;
    skuCount: number;
    price: string;
    stock: number;
    isActive: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prd-001',
        name: 'Botol Minum 750ml',
        description: 'Botol minum ringan dengan tutup anti bocor untuk aktivitas harian.',
        category: 'Peralatan Rumah',
        skuCount: 3,
        price: 'Rp42.000 - Rp65.000',
        stock: 36,
        isActive: true,
        imageUrl: '/products/Botol Minum 750ml.jpg',
    },
    {
        id: 'prd-002',
        name: 'Kabel Data USB Type-C',
        description: 'Kabel pengisi daya dan transfer data dengan lapisan nilon.',
        category: 'Aksesori Elektronik',
        skuCount: 2,
        price: 'Rp18.000 - Rp25.000',
        stock: 84,
        isActive: true,
        imageUrl: '/products/Kabel Data USB Type-C.jpg',
    },
    {
        id: 'prd-003',
        name: 'Lampu LED Emergency 12 Watt',
        description: 'Lampu LED hemat energi dengan mode darurat saat listrik padam.',
        category: 'Elektronik Rumah',
        skuCount: 2,
        price: 'Rp48.000 - Rp65.000',
        stock: 12,
        isActive: true,
        imageUrl: '/products/Lampu LED Emergency 12 Watt.jpg',
    },
    {
        id: 'prd-004',
        name: 'Minyak Kayu Putih 60ml',
        description: 'Minyak kayu putih dengan aroma hangat untuk kebutuhan keluarga.',
        category: 'Kesehatan',
        skuCount: 1,
        price: 'Rp16.500',
        stock: 73,
        isActive: true,
        imageUrl: '/products/Minyak Kayu Putih 60ml.jpg',
    },
    {
        id: 'prd-005',
        name: 'Sandal Rumah Unisex',
        description: 'Sandal rumah dengan sol anti selip dan pilihan ukuran lengkap.',
        category: 'Fashion',
        skuCount: 4,
        price: 'Rp29.000 - Rp39.000',
        stock: 27,
        isActive: true,
        imageUrl: '/products/Sandal Rumah Unisex.jpg',
    },
    {
        id: 'prd-006',
        name: 'Keranjang Penyimpanan Serbaguna',
        description: 'Keranjang plastik bertutup untuk menyimpan barang di rumah.',
        category: 'Organisasi Rumah',
        skuCount: 2,
        price: 'Rp35.000 - Rp49.000',
        stock: 7,
        isActive: true,
        imageUrl: '/products/Keranjang Penyimpanan Serbaguna.jpg',
    },
];

export async function loadProducts(): Promise<Product[]> {
    return MOCK_PRODUCTS;
}
