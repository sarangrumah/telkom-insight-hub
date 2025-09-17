import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung minimal 1 karakter khusus');

// Email validation
export const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .min(1, 'Email wajib diisi');

// Phone validation (Indonesian format)
export const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor telepon tidak valid (contoh: +628123456789)');

// NIB validation (15 digits)
export const nibSchema = z
  .string()
  .regex(/^\d{15}$/, 'NIB harus terdiri dari 15 digit');

// NPWP validation (15 digits with dots and hyphens)
export const npwpSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, 'Format NPWP tidak valid (contoh: 12.345.678.9-012.345)');

// KTP validation (16 digits)
export const ktpSchema = z
  .string()
  .regex(/^\d{16}$/, 'NIK KTP harus terdiri dari 16 digit');

// File validation helper
export const validatePDFFile = (file: File) => {
  const errors: string[] = [];
  
  // Check file type
  if (file.type !== 'application/pdf') {
    errors.push('File harus berformat PDF');
  }
  
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    errors.push('File harus memiliki ekstensi .pdf');
  }
  
  // Check file size (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('Ukuran file maksimal 5MB');
  }
  
  return errors;
};

// Account form validation
export const accountFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['pelaku_usaha', 'internal_group'], {
    required_error: 'Pilih tipe pengguna'
  }),
  maksudTujuan: z.string().min(10, 'Maksud tujuan minimal 10 karakter')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword']
});

// Company form validation (removed website and business_field)
export const companyFormSchema = z.object({
  companyName: z.string().min(2, 'Nama perusahaan wajib diisi'),
  nibNumber: nibSchema,
  npwpNumber: npwpSchema,
  phone: phoneSchema,
  companyType: z.enum(['pt', 'cv', 'ud', 'koperasi', 'yayasan', 'other'], {
    required_error: 'Pilih jenis perusahaan'
  }),
  aktaNumber: z.string().min(1, 'Nomor akta wajib diisi'),
  address: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  provinceId: z.string().min(1, 'Pilih provinsi'),
  kabupaténId: z.string().min(1, 'Pilih kabupaten/kota'),
  kecamatan: z.string().min(1, 'Pilih kecamatan'),
  kelurahan: z.string().min(1, 'Pilih kelurahan'),
  postalCode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit')
});

// Helper function to get company type display name
export const getCompanyTypeLabel = (type: string): string => {
  const labels = {
    pt: 'PT (Perseroan Terbatas)',
    cv: 'CV (Commanditaire Vennootschap)', 
    ud: 'UD (Usaha Dagang)',
    koperasi: 'Koperasi',
    yayasan: 'Yayasan',
    other: 'Lainnya'
  };
  return labels[type as keyof typeof labels] || type;
};

// PIC form validation
export const picFormSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  idNumber: ktpSchema,
  phoneNumber: phoneSchema,
  position: z.string().min(2, 'Jabatan wajib diisi'),
  address: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  provinceId: z.string().min(1, 'Pilih provinsi'),
  kabupaténId: z.string().min(1, 'Pilih kabupaten/kota'),
  kecamatan: z.string().min(1, 'Pilih kecamatan'),
  kelurahan: z.string().min(1, 'Pilih kelurahan'),
  postalCode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit')
});

export type AccountFormData = z.infer<typeof accountFormSchema>;
export type CompanyFormData = z.infer<typeof companyFormSchema>;
export type PICFormData = z.infer<typeof picFormSchema>;