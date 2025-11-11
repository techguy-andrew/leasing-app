/**
 * CRM Data Migration Script
 *
 * This script safely migrates existing application data to the new CRM structure:
 * - Creates Person records from existing applicant data
 * - Creates Unit records from existing property + unitNumber combinations
 * - Links applications to the new Person and Unit entities
 * - Preserves ALL original data (no deletions)
 *
 * SAFETY FEATURES:
 * - Read-only analysis mode (dry run)
 * - All original fields remain intact
 * - Can be run multiple times safely (idempotent)
 * - Detailed logging of all actions
 *
 * Usage:
 *   DRY RUN (safe, shows what would happen):
 *   npx tsx scripts/migrateToCRM.ts
 *
 *   ACTUAL MIGRATION (after reviewing dry run):
 *   npx tsx scripts/migrateToCRM.ts --execute
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if we're in execute mode (default is dry run)
const EXECUTE_MODE = process.argv.includes('--execute')

interface MigrationStats {
  personsCreated: number
  unitsCreated: number
  applicationsLinked: number
  applicationsSkipped: number
  errors: string[]
}

/**
 * Main migration function
 */
async function migrateToCRM() {
  console.log('🚀 CRM Data Migration Script')
  console.log('=' .repeat(60))
  console.log(`Mode: ${EXECUTE_MODE ? '⚡ EXECUTE' : '🔍 DRY RUN (no changes)'}`)
  console.log('=' .repeat(60))
  console.log()

  const stats: MigrationStats = {
    personsCreated: 0,
    unitsCreated: 0,
    applicationsLinked: 0,
    applicationsSkipped: 0,
    errors: []
  }

  try {
    // Step 1: Fetch all applications
    console.log('📊 Step 1: Fetching all applications...')
    const applications = await prisma.application.findMany({
      include: {
        unit: true,
        persons: true
      }
    })
    console.log(`   Found ${applications.length} applications\n`)

    // Step 2: Extract and create unique persons
    console.log('👤 Step 2: Creating Person records...')
    const personMap = new Map<string, number>() // key: email|name, value: personId

    for (const app of applications) {
      // Skip if already linked to a person
      if (app.persons.length > 0) {
        console.log(`   ⏭️  Skipping app ${app.id} - already has ${app.persons.length} person(s) linked`)
        stats.applicationsSkipped++
        continue
      }

      // Create unique key for person (email if available, otherwise name)
      const personKey = app.email ? app.email.toLowerCase() : app.applicant.toLowerCase()

      // Check if we've already created this person
      if (!personMap.has(personKey)) {
        // Split applicant name into first and last
        const nameParts = app.applicant.trim().split(' ')
        const firstName = nameParts[0] || 'Unknown'
        const lastName = nameParts.slice(1).join(' ') || 'Unknown'

        if (EXECUTE_MODE) {
          // Create the person
          const person = await prisma.person.create({
            data: {
              userId: app.userId,
              firstName,
              lastName,
              email: app.email,
              phone: app.phone,
              status: 'Applicant', // Default status
              becameApplicant: new Date(app.createdAt), // Use application creation date
              createdAt: new Date(app.createdAt)
            }
          })
          personMap.set(personKey, person.id)
          console.log(`   ✅ Created Person: ${firstName} ${lastName} (ID: ${person.id})`)
        } else {
          // Dry run - just count
          const mockId = personMap.size + 1
          personMap.set(personKey, mockId)
          console.log(`   🔍 Would create Person: ${firstName} ${lastName}`)
        }
        stats.personsCreated++
      }
    }
    console.log(`   📈 Total persons ${EXECUTE_MODE ? 'created' : 'to create'}: ${stats.personsCreated}\n`)

    // Step 3: Extract and create unique units
    console.log('🏢 Step 3: Creating Unit records...')

    // First, get all properties
    const properties = await prisma.property.findMany()
    const propertyMap = new Map<string, number>() // key: property name, value: propertyId
    properties.forEach(prop => propertyMap.set(prop.name.toLowerCase(), prop.id))

    const unitMap = new Map<string, number>() // key: propertyId|unitNumber, value: unitId

    for (const app of applications) {
      // Skip if already linked to a unit
      if (app.unitId) {
        console.log(`   ⏭️  Skipping app ${app.id} - already linked to unit ${app.unitId}`)
        continue
      }

      // Skip if property is not set
      if (!app.property) {
        console.log(`   ⏭️  Skipping app ${app.id} - no property set`)
        continue
      }

      // Find the property ID
      const propertyId = propertyMap.get(app.property.toLowerCase())

      if (!propertyId) {
        const error = `   ⚠️  Warning: Property "${app.property}" not found for app ${app.id}`
        console.log(error)
        stats.errors.push(error)
        continue
      }

      // Skip if unit number is not set
      if (!app.unitNumber) {
        console.log(`   ⏭️  Skipping app ${app.id} - no unit number set`)
        continue
      }

      // Create unique key for unit
      const unitKey = `${propertyId}|${app.unitNumber}`

      // Check if we've already created this unit
      if (!unitMap.has(unitKey)) {
        if (EXECUTE_MODE) {
          try {
            // Create the unit
            const unit = await prisma.unit.create({
              data: {
                userId: app.userId,
                propertyId,
                unitNumber: app.unitNumber,
                baseRent: app.rent || null,
                status: 'Occupied' // Assume occupied if there's an application
              }
            })
            unitMap.set(unitKey, unit.id)
            console.log(`   ✅ Created Unit: ${app.property} - Unit ${app.unitNumber} (ID: ${unit.id})`)
          } catch (error: any) {
            // Handle duplicate unit error
            if (error.code === 'P2002') {
              console.log(`   ⏭️  Unit already exists: ${app.property} - Unit ${app.unitNumber}`)
              // Fetch existing unit
              const existingUnit = await prisma.unit.findFirst({
                where: {
                  propertyId,
                  unitNumber: app.unitNumber
                }
              })
              if (existingUnit) {
                unitMap.set(unitKey, existingUnit.id)
              }
            } else {
              throw error
            }
          }
        } else {
          // Dry run - just count
          const mockId = unitMap.size + 1
          unitMap.set(unitKey, mockId)
          console.log(`   🔍 Would create Unit: ${app.property} - Unit ${app.unitNumber}`)
        }
        stats.unitsCreated++
      }
    }
    console.log(`   📈 Total units ${EXECUTE_MODE ? 'created' : 'to create'}: ${stats.unitsCreated}\n`)

    // Step 4: Link applications to persons and units
    console.log('🔗 Step 4: Linking applications to Persons and Units...')

    for (const app of applications) {
      // Skip if already linked
      if (app.unitId && app.persons.length > 0) {
        console.log(`   ⏭️  Skipping app ${app.id} - already fully linked`)
        continue
      }

      // Get person ID
      const personKey = app.email ? app.email.toLowerCase() : app.applicant.toLowerCase()
      const personId = personMap.get(personKey)

      // Get unit ID (if property and unitNumber are set)
      const propertyId = app.property ? propertyMap.get(app.property.toLowerCase()) : null
      const unitKey = propertyId && app.unitNumber ? `${propertyId}|${app.unitNumber}` : null
      const unitId = unitKey ? unitMap.get(unitKey) : null

      if (!personId) {
        console.log(`   ⚠️  Warning: No person found for app ${app.id}`)
        continue
      }

      if (EXECUTE_MODE) {
        try {
          // Link person to application (via join table)
          if (app.persons.length === 0) {
            await prisma.applicationPerson.create({
              data: {
                applicationId: app.id,
                personId,
                isPrimary: true
              }
            })
          }

          // Link unit to application (if unit exists)
          if (unitId && !app.unitId) {
            await prisma.application.update({
              where: { id: app.id },
              data: { unitId }
            })
          }

          console.log(`   ✅ Linked app ${app.id}: Person ${personId}, Unit ${unitId || 'N/A'}`)
          stats.applicationsLinked++
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log(`   ⏭️  App ${app.id} already linked to person ${personId}`)
          } else {
            throw error
          }
        }
      } else {
        console.log(`   🔍 Would link app ${app.id}: Person ${personId}, Unit ${unitId || 'N/A'}`)
        stats.applicationsLinked++
      }
    }
    console.log()

    // Final summary
    console.log('=' .repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('=' .repeat(60))
    console.log(`Persons ${EXECUTE_MODE ? 'created' : 'to create'}:       ${stats.personsCreated}`)
    console.log(`Units ${EXECUTE_MODE ? 'created' : 'to create'}:         ${stats.unitsCreated}`)
    console.log(`Applications ${EXECUTE_MODE ? 'linked' : 'to link'}:     ${stats.applicationsLinked}`)
    console.log(`Applications skipped:   ${stats.applicationsSkipped}`)
    console.log(`Errors/Warnings:        ${stats.errors.length}`)
    console.log('=' .repeat(60))

    if (!EXECUTE_MODE) {
      console.log()
      console.log('🔍 This was a DRY RUN - no changes were made')
      console.log('To execute the migration, run:')
      console.log('   npx tsx scripts/migrateToCRM.ts --execute')
    } else {
      console.log()
      console.log('✅ Migration completed successfully!')
      console.log('All original data has been preserved.')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateToCRM()
  .then(() => {
    console.log()
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
