import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed from CSV...')

  // Read CSV file
  const csvPath = '/Users/andrewbarron/Downloads/Move-in Tracker - Sheet1.csv'
  const csvContent = readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n')

  let count = 0

  // Parse CSV (skip first 2 rows: "Approved" header and column headers)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines or lines starting with "Pending"
    if (!line || line.startsWith('Pending') || line === ',,,,,') {
      continue
    }

    // Parse CSV line (basic parsing - doesn't handle quoted commas)
    const columns = line.split(',')
    const moveInDate = columns[0]?.trim()
    const property = columns[1]?.trim()
    const unit = columns[2]?.trim()
    const name = columns[3]?.trim()

    // Skip if any required field is missing
    if (!moveInDate || !property || !unit || !name) {
      console.log(`Skipping row ${i + 1}: missing required fields`)
      continue
    }

    // Normalize property names to match existing properties
    const propertyMap: Record<string, string> = {
      'Legacy': 'Legacy Apartments',
      'Prairie Village': 'Prairie Village',
      'Orchard': 'Orchard Meadows Apartments',
      'Parkside': 'Parkside Luxury Apartments',
      'Burbank': 'Burbank Village Apartments',
      'NW Pine': 'NW Pine Apartments',
      'Norwalk': 'Norwalk Village Estates'
    }

    const fullPropertyName = propertyMap[property] || property

    // Generate createdAt in MM/DD/YYYY format
    const now = new Date()
    const createdAt = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`

    // Create application
    await prisma.application.create({
      data: {
        applicant: name,
        moveInDate,
        property: fullPropertyName,
        unitNumber: unit,
        status: ['New'],
        email: null,
        phone: null,
        createdAt
      }
    })

    count++
    console.log(`Created application ${count}: ${name} - ${fullPropertyName} ${unit}`)
  }

  console.log(`Database seed completed! Created ${count} applications.`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
