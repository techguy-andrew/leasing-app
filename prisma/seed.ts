import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const properties = [
  'Burbank Village Apartments',
  'Carlisle Apartments',
  'Clover Hills Apartments',
  'Legacy Apartments',
  'Norwalk Village Estates',
  'NW Pine Apartments',
  'Orchard Meadows Apartments',
  'Parkside Luxury Apartments',
  'Prairie Village',
  'West Glen Apartments'
]

async function main() {
  console.log('Starting database seed...')

  // Get all existing applications
  const applications = await prisma.application.findMany()

  console.log(`Found ${applications.length} applications to update`)

  // Update each application with a property from the list
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i]
    const property = properties[i % properties.length]

    await prisma.application.update({
      where: { id: application.id },
      data: {
        property,
        updatedAt: new Date()
      }
    })

    console.log(`Updated application ${application.id} with property: ${property}`)
  }

  console.log('Database seed completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
