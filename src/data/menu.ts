import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // SATE TAICHAN (Urutan sesuai nota: Full Daging, Full Crispy, Full Kulit, Daging+Crispy, Daging+Kulit, Crispy+Kulit, +Satuan)
  {
    id: 'tc-daging-porsi',
    name: 'Taichan Daging (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: 'Daging ayam fillet bakar bumbu gurih asin + sambal taichan pedas segar & jeruk nipis',
    skewerCount: 10
  },
  {
    id: 'tc-krispy',
    name: 'Taichan Crispy (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: 'Sate taichan balur tepung krispy renyah spesial',
    skewerCount: 10
  },
  {
    id: 'tc-kulit-porsi',
    name: 'Taichan Kulit (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 16000,
    description: 'Kulit ayam juicy gurih dibakar renyah lembut',
    skewerCount: 10
  },
  {
    id: 'tc-daging-krispy',
    name: 'Taichan Daging + Crispy (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 20000,
    description: 'Kombinasi sate taichan daging bakar + sate taichan krispy renyah',
    skewerCount: 10
  },
  {
    id: 'tc-campur',
    name: 'Taichan Daging + Kulit (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 18000,
    description: 'Kombinasi sate daging ayam bakar + sate kulit juicy gurih',
    skewerCount: 10
  },
  {
    id: 'tc-crispy-kulit',
    name: 'Taichan Crispy + Kulit (10 tsk)',
    category: 'taichan',
    type: 'portion',
    price: 18000,
    description: 'Kombinasi sate taichan krispy renyah + sate kulit juicy gurih',
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
    id: 'tc-kulit-satuan',
    name: 'Taichan Kulit (Satuan / 1 tsk)',
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
    name: 'Aqua / Air Mineral',
    category: 'drink',
    type: 'portion',
    price: 5000,
    description: 'Air mineral kemasan botol dingin / suhu ruang'
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
