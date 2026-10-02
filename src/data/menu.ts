import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // SATE TAICHAN (Porsi & Satuan)
  {
    id: 'tc-daging-porsi',
    name: 'Taichan Daging (Porsi 10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: 'Daging ayam fillet bakar bumbu gurih asin + sambal taichan pedas segar & jeruk nipis',
    skewerCount: 10
  },
  {
    id: 'tc-daging-satuan',
    name: 'Taichan Daging (Satuan / 1 tsk)',
    category: 'taichan',
    type: 'unit',
    price: 2000,
    description: 'Tambah tusukan daging satuan sesuai selera',
    skewerCount: 1
  },
  {
    id: 'tc-kulit-porsi',
    name: 'Taichan Kulit (Porsi 10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 16000,
    description: 'Kulit ayam juicy gurih dibakar renyah lembut',
    skewerCount: 10
  },
  {
    id: 'tc-kulit-satuan',
    name: 'Taichan Kulit (Satuan / 1 tsk)',
    category: 'taichan',
    type: 'unit',
    price: 1500,
    description: 'Tambah tusukan kulit satuan sesuai selera',
    skewerCount: 1
  },
  {
    id: 'tc-campur',
    name: 'Taichan Campur (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 18000,
    description: 'Kombinasi 5 tusuk daging ayam + 5 tusuk kulit juicy',
    skewerCount: 10
  },
  {
    id: 'tc-krispy',
    name: 'Taichan Krispy (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: 'Sate taichan balur tepung krispy renyah spesial',
    skewerCount: 10
  },

  // MAKANAN PENDAMPING (Karbohidrat)
  {
    id: 'side-nasi-jeruk',
    name: 'Nasi Daun Jeruk',
    category: 'side',
    type: 'portion',
    price: 4000,
    description: 'Nasi pulen harum aroma daun jeruk & bumbu gurih alami'
  },
  {
    id: 'side-lontong',
    name: 'Lontong',
    category: 'side',
    type: 'portion',
    price: 3000,
    description: 'Lontong daun pisang lembut & padat mengenyangkan'
  },

  // MINUMAN (Dingin & Hangat)
  {
    id: 'drink-es-teh',
    name: 'Es Teh Manis / Tawar',
    category: 'drink',
    type: 'portion',
    price: 4000,
    description: 'Teh melati wangi segar dingin / hangat (pilih manis/tawar)'
  },
  {
    id: 'drink-nutrisari',
    name: 'Nutrisari Jeruk Dingin',
    category: 'drink',
    type: 'portion',
    price: 6000,
    description: 'Sari jeruk segar dingin penawar pedas taichan'
  },
  {
    id: 'drink-air-mineral',
    name: 'Air Mineral 600ml',
    category: 'drink',
    type: 'portion',
    price: 5000,
    description: 'Air mineral kemasan botol dingin / suhu ruang'
  }
];
