// Service type hierarchy mapping
export const SERVICE_TYPE_HIERARCHY = {
  JASA: [
    'Sertifikat Penyelenggaraan Jasa Panggilan Terkelola (Calling Card)',
    'Sertifikat Penyelenggaraan Jasa Konten SMS Premium',
    'Izin Penyelenggaraan Jasa teleponi dasar melalui jaringan telekomunikasi',
    'Izin Penyelenggaraan Jasa Pusat Panggilan Informasi (Call Center)',
    'Izin Penyelenggaraan Jasa Gerbang Akses Internet (Network Access Point/NAP)',
    'Izin Penyelenggaraan Jasa Televisi Protokol Internet (Internet Protocol Television/IPTV)',
    'Izin Penyelenggaraan Jasa Sistem Komunikasi Data',
    'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
    'Izin Penyelenggaraan Jasa Internet Teleponi untuk Keperluan Publik (ITKP)',
    'Izin Penyelenggaraan Jasa teleponi dasar melalui satelit yang telah memperoleh Hak Labuh (Landing Right)',
    'Sertifikat Penyelenggaraan Jasa Panggilan Premium (Premium Call)'
  ],
  JARINGAN: [
    'Izin Penyelenggaraan Jaringan Tetap Tertutup melalui Media Fiber Optik Terestrial',
    'Izin Penyelenggaraan Jaringan Tetap Tertutup melalui Media Satelit',
    'Izin Penyelenggaraan Jaringan Tetap Tertutup melalui Media Fiber Optik Sistem Komunikasi Kabel Laut (SKKL)',
    'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik',
    'Izin Penyelenggaraan Jaringan Tetap Tertutup melalui Media VSAT',
    'Izin Penyelenggaraan Jaringan Bergerak Satelit',
    'Izin Penyelenggaraan Jaringan Tetap Tertutup melalui Media Microwave (MW) Link',
    'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Non-Kabel (BWA)',
    'Izin Penyelenggaraan Jaringan Bergerak Terestrial Radio Trunking',
    'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Circuit Switched melalui Media Fiber Optik'
  ],
  TELEKOMUNIKASI_KHUSUS: [
    'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri'
  ]
} as const;

// Get sub-services for a main service type
export const getSubServices = (serviceType: string): readonly string[] => {
  switch (serviceType.toUpperCase()) {
    case 'JASA':
      return SERVICE_TYPE_HIERARCHY.JASA;
    case 'JARINGAN':
      return SERVICE_TYPE_HIERARCHY.JARINGAN;
    case 'TELEKOMUNIKASI_KHUSUS':
      return SERVICE_TYPE_HIERARCHY.TELEKOMUNIKASI_KHUSUS;
    default:
      return [];
  }
};

// Get main service type from sub-service
export const getMainServiceType = (subService: string): string => {
  for (const [mainType, subServices] of Object.entries(SERVICE_TYPE_HIERARCHY)) {
    if ((subServices as readonly string[]).includes(subService)) {
      return mainType.toLowerCase();
    }
  }
  return '';
};

// All sub-services flattened
export const ALL_SUB_SERVICES = [
  ...SERVICE_TYPE_HIERARCHY.JASA,
  ...SERVICE_TYPE_HIERARCHY.JARINGAN,
  ...SERVICE_TYPE_HIERARCHY.TELEKOMUNIKASI_KHUSUS
];