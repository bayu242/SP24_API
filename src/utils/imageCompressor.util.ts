// File: src/utils/imageCompressor.util.ts
import sharp from "sharp";

/**
 * Opsi konfigurasi kompresi gambar menggunakan Sharp.
 */
export interface CompressImageOptions {
  /** Lebar maksimum output (dalam piksel). Default: 800 */
  maxWidth?: number;
  /** Tinggi maksimum output (dalam piksel). Default: 800 */
  maxHeight?: number;
  /** Kualitas JPEG output (1–100). Default: 80 */
  quality?: number;
  /** Format output. Default: 'jpeg' */
  format?: "jpeg" | "webp" | "png";
}

/**
 * Mengompres gambar menggunakan library Sharp.
 *
 * Proses:
 * 1. Menerima Buffer gambar dari Multer (memoryStorage).
 * 2. Me-resize gambar agar tidak melebihi dimensi maksimum (menjaga aspek rasio).
 * 3. Mengonversi ke format target (default: JPEG) dengan kualitas yang ditentukan.
 * 4. Mengembalikan Buffer gambar yang telah dikompres.
 *
 * @param inputBuffer - Buffer mentah gambar yang diunggah
 * @param options - Opsi konfigurasi kompresi (opsional)
 * @returns Promise<Buffer> - Buffer gambar yang sudah dikompres
 */
export const compressImage = async (
  inputBuffer: Buffer,
  options: CompressImageOptions = {},
): Promise<Buffer> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 80,
    format = "jpeg",
  } = options;

  const compressedBuffer = await sharp(inputBuffer)
    .resize(maxWidth, maxHeight, {
      fit: "inside",       // Jaga aspek rasio, tidak memotong gambar
      withoutEnlargement: true, // Tidak memperbesar jika gambar sudah lebih kecil
    })
    [format]({ quality }) // Konversi ke format & kualitas yang dipilih
    .toBuffer();

  return compressedBuffer;
};
