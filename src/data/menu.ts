import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // MAKANAN (Urutan & nama sesuai nota menu fisik)
  {
    id: 'tc-daging-porsi',
    name: 'Full Daging',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: '10 tusuk sate daging ayam fillet bakar bumbu gurih asin + sambal pedas segar & jeruk nipis',
    skewerCount: 10
  },
  {
    id: 'tc-krispy',
    name: 'Full Crispy',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: '10 tusuk sate balur tepung krispy renyah spesial',
    skewerCount: 10
  },
  {
    id: 'tc-kulit-porsi',
    name: 'Full Kulit',
    category: 'taichan',
    type: 'portion',
    price: 16000,
    description: '10 tusuk sate kulit ayam juicy gurih dibakar renyah lembut',
    skewerCount: 10
  },
  {
    id: 'tc-daging-krispy',
    name: 'Daging + Crispy',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: 'Kombinasi sate daging bakar + sate krispy renyah (10 tusuk)',
    skewerCount: 10
  },
  {
    id: 'tc-campur',
    name: 'Daging + Kulit',
    category: 'taichan',
    type: 'portion',
    price: 18000,
    description: 'Kombinasi sate daging ayam bakar + sate kulit juicy gurih (10 tusuk)',
    skewerCount: 10
  },
  {
    id: 'tc-crispy-kulit',
    name: 'Crispy + Kulit',
    category: 'taichan',
    type: 'portion',
    price: 18000,
    description: 'Kombinasi sate krispy renyah + sate kulit juicy gurih (10 tusuk)',
    skewerCount: 10
  },
  {
    id: 'tc-promo-pelajar',
    name: 'Promo Pelajar (8 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 15000,
    description: 'Paket hemat sate taichan 8 tusuk promo pelajar',
    skewerCount: 8
  },
  {
    id: 'tc-daging-satuan',
    name: 'Daging (1 tsk)',
    category: 'taichan',
    type: 'unit',
    price: 2000,
    description: 'Tambah tusukan daging satuan sesuai selera',
    skewerCount: 1
  },
  {
    id: 'tc-kulit-satuan',
    name: 'Kulit (1 tsk)',
    category: 'taichan',
    type: 'unit',
    price: 1500,
    description: 'Tambah tusukan kulit satuan sesuai selera',
    skewerCount: 1
  },

  // MAKANAN PENDAMPING (Urutan sesuai nota: Lontong dulu, baru Nasi Jeruk)
  {
    id: 'side-lontong',
    name: 'Lontong',
    category: 'side',
    type: 'portion',
    price: 3000,
    description: 'Lontong daun pisang lembut & padat mengenyangkan'
  },
  {
    id: 'side-nasi-jeruk',
    name: 'Nasi Jeruk',
    category: 'side',
    type: 'portion',
    price: 4000,
    description: 'Nasi pulen harum aroma daun jeruk & bumbu gurih alami'
  },

  // MINUMAN (Urutan sesuai nota: Aqua, Es Tea, Tea Hangat, Nutrisari)
  {
    id: 'drink-air-mineral',
    name: 'Aqua',
    category: 'drink',
    type: 'portion',
    price: 5000,
    description: 'Air mineral kemasan botol dingin / suhu ruang'
  },
  {
    id: 'drink-aqua-kecil',
    name: 'Aqua Kecil',
    category: 'drink',
    type: 'portion',
    price: 2000,
    description: 'Air mineral kemasan kecil dingin / suhu ruang'
  },
  {
    id: 'drink-es-teh',
    name: 'Es Tea',
    category: 'drink',
    type: 'portion',
    price: 4000,
    description: 'Es teh manis segar melati dingin'
  },
  {
    id: 'drink-teh-hangat',
    name: 'Tea Hangat',
    category: 'drink',
    type: 'portion',
    price: 3000,
    description: 'Teh hangat manis aroma melati'
  },
  {
    id: 'drink-nutrisari',
    name: 'Nutrisari',
    category: 'drink',
    type: 'portion',
    price: 6000,
    description: 'Nutrisari jeruk manis segar'
  }
];
