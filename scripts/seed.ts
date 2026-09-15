/**
 * Seeds Firestore with sample categories, products, store settings and shipping rules
 * for local development. Not used in production — run manually with `npm run seed`.
 */
import 'dotenv/config'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`)
  return value
}

const app = initializeApp({
  credential: cert({
    projectId: requireEnv('FIREBASE_PROJECT_ID'),
    clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
    privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore(app)

const now = new Date().toISOString()

const categories = [
  { slug: 'aneis', name: 'Anéis', order: 0 },
  { slug: 'brincos', name: 'Brincos', order: 1 },
  { slug: 'colares', name: 'Colares', order: 2 },
  { slug: 'pulseiras', name: 'Pulseiras', order: 3 },
  { slug: 'conjuntos', name: 'Conjuntos', order: 4 },
]

const products = [
  {
    name: 'Anel Dourado',
    slug: 'anel-dourado',
    description: 'Anel banhado a ouro 18k, design minimalista e atemporal.',
    categorySlug: 'aneis',
    price: 199.9,
    promotionalPrice: null,
    stock: 12,
    featured: true,
    isNew: false,
  },
  {
    name: 'Brinco Pérola',
    slug: 'brinco-perola',
    description: 'Brinco delicado com pérola natural e acabamento em ouro.',
    categorySlug: 'brincos',
    price: 89.9,
    promotionalPrice: 79.9,
    stock: 20,
    featured: true,
    isNew: true,
  },
  {
    name: 'Colar Delicado',
    slug: 'colar-delicado',
    description: 'Colar fino banhado a ouro com pingente minimalista.',
    categorySlug: 'colares',
    price: 149.9,
    promotionalPrice: null,
    stock: 8,
    featured: false,
    isNew: true,
  },
  {
    name: 'Pulseira Elegance',
    slug: 'pulseira-elegance',
    description: 'Pulseira ajustável com detalhes em zircônia.',
    categorySlug: 'pulseiras',
    price: 129.9,
    promotionalPrice: null,
    stock: 15,
    featured: true,
    isNew: false,
  },
  {
    name: 'Conjunto Premium',
    slug: 'conjunto-premium',
    description: 'Conjunto de colar e brincos combinando, ideal para ocasiões especiais.',
    categorySlug: 'conjuntos',
    price: 349.9,
    promotionalPrice: 299.9,
    stock: 5,
    featured: true,
    isNew: true,
  },
]

async function seed() {
  console.log('Seeding categories...')
  const categoryIds: Record<string, string> = {}

  for (const category of categories) {
    const ref = await db.collection('categories').add({
      name: category.name,
      slug: category.slug,
      description: '',
      imageUrl: null,
      active: true,
      order: category.order,
      createdAt: now,
      updatedAt: now,
    })
    categoryIds[category.slug] = ref.id
  }

  console.log('Seeding products...')
  for (const product of products) {
    await db.collection('products').add({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: categoryIds[product.categorySlug],
      price: product.price,
      promotionalPrice: product.promotionalPrice,
      stock: product.stock,
      images: [],
      videoUrl: null,
      featured: product.featured,
      isNew: product.isNew,
      active: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  console.log('Seeding store settings...')
  await db.collection('settings').doc('store').set({
    storeName: 'Joias Jaguariúna',
    logoUrl: null,
    whatsapp: process.env.VITE_OWNER_WHATSAPP || '5519999999999',
    instagram: '@joiasjaguariuna',
    email: '',
    address: '',
    city: 'Jaguariúna',
    state: 'SP',
    zipCode: '',
    updatedAt: now,
  })

  console.log('Seeding shipping settings...')
  await db.collection('settings').doc('shipping').set({
    mode: 'region',
    singlePrice: 15,
    updatedAt: now,
  })

  console.log('Seeding shipping regions...')
  const regions = [
    { name: 'Jaguariúna', zipCodeStart: '13820000', zipCodeEnd: '13829999', price: 10 },
    { name: 'Pedreira', zipCodeStart: '13920000', zipCodeEnd: '13929999', price: 15 },
    { name: 'Campinas', zipCodeStart: '13000000', zipCodeEnd: '13109999', price: 25 },
  ]

  for (const region of regions) {
    await db.collection('shippingRegions').add({ ...region, active: true, createdAt: now, updatedAt: now })
  }

  console.log('Done! Sample data created successfully.')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
