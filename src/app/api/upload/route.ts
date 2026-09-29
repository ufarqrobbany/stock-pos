import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
        }

        // konversi file ke Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // buat nentui lokasi folder public/products
        const uploadDir = path.join(process.cwd(), 'public', 'products');

        // pastikan folder ada
        await mkdir(uploadDir, { recursive: true });

        // simpan file dengan nama asli
        const filePath = path.join(uploadDir, file.name);
        await writeFile(filePath, buffer);

        // return path URL yang akan disimpan ke database
        const fileUrl = `/products/${file.name}`;
        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ message: 'URL gambar tidak ditemukan' }, { status: 400 });
        }

        // ambil path file relatif dari folder public
        const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
        const filePath = path.join(process.cwd(), 'public', cleanPath);

        // hapuss file fisik jika ada
        await unlink(filePath);

        return NextResponse.json({ message: 'Gambar lama berhasil dihapus' });
    } catch (error) {
        console.error('Gagal menghapus file gambar:', error);
        // abaikan error jika file memang tidak ditemukan
        return NextResponse.json({ message: 'Gagal menghapus file atau file tidak ditemukan' }, { status: 500 });
    }
}
