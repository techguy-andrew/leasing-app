/**
 * Link Applications to Units Migration Script
 *
 * This script fixes the issue where applications store property/unitNumber as strings
 * instead of using proper database relationships via unitId.
 *
 * What it does:
 * 1. Finds all applications with property/unitNumber strings but no unitId
 * 2. For each application, finds or creates a matching Unit record
 * 3. Links the application to the unit via unitId foreign key
 * 4. Keeps legacy property/unitNumber fields intact (for safety)
 *
 * SAFETY FEATURES:
 * - Dry run mode by default (shows what would happen)
 * - No data is deleted
 * - Legacy fields remain as backup
 * - Can be run multiple times safely (idempotent)
 * - Detailed logging of all actions
 *
 * Usage:
 *   DRY RUN (safe, shows what would happen):
 *   npx tsx scripts/linkApplicationsToUnits.ts
 *
 *   ACTUAL MIGRATION (after reviewing dry run):
 *   npx tsx scripts/linkApplicationsToUnits.ts --execute
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if we're in execute mode (default is dry run)
const EXECUTE_MODE = process.argv.includes('--execute')

interface MigrationStats {
  totalApplications: number
  alreadyLinked: number
  unitsCreated: number
  applicationsLinked: number
  skipped: number
  errors: string[]
}

/**
 * Main migration function
 */
async function linkApplicationsToUnits() {
  console.log('🔗 Link Applications to Units Migration')
  console.log('=' .repeat(60))
  console.log(`Mode: ${EXECUTE_MODE ? '⚡ EXECUTE' : '🔍 DRY RUN (no changes)'}`)
  console.log('=' .repeat(60))
  console.log()

  const stats: MigrationStats = {
    totalApplications: 0,
    alreadyLinked: 0,
    unitsCreated: 0,
    applicationsLinked: 0,
    skipped: 0,
    errors: []
  }

  try {
    // Step 1: Fetch all applications
    console.log('📊 Step 1: Fetching all applications...')
    const applications = await prisma.application.findMany({
      include: {
        unit: true
      }
    })
    stats.totalApplications = applications.length
    console.log(`   Found ${applications.length} applications\n`)

    // Step 2: Get all properties (we'll need their IDs)
    console.log('🏢 Step 2: Loading properties...')
    const properties = await prisma.property.findMany()
    const propertyMap = new Map<string, number>() // key: property name (lowercase), value: propertyId
    properties.forEach(prop => propertyMap.set(prop.name.toLowerCase(), prop.id))
    console.log(`   Loaded ${properties.length} properties\n`)

    // Step 3: Process each application
    console.log('🔗 Step 3: Processing applications...')
    console.log()

    const unitCache = new Map<string, number>() // key: propertyId|unitNumber, value: unitId

    for (const app of applications) {
      // Skip if already linked to a unit
      if (app.unitId) {
        console.log(`   ⏭️  App ${app.id} (${app.applicant}): Already linked to unit ${app.unitId}`)
        stats.alreadyLinked++
        continue
      }

      // Skip if property is null or empty
      if (!app.property || app.property.trim() === '') {
        console.log(`   ⏭️  App ${app.id} (${app.applicant}): No property set - skipping`)
        stats.skipped++
        continue
      }

      // Skip if unitNumber is null or empty
      if (!app.unitNumber || app.unitNumber.trim() === '') {
        console.log(`   ⏭️  App ${app.id} (${app.applicant}): No unit number set - skipping`)
        stats.skipped++
        continue
      }

      // Find the property ID
      const propertyId = propertyMap.get(app.property.toLowerCase())

      if (!propertyId) {
        const error = `App ${app.id}: Property "${app.property}" not found in database`
        console.log(`   ⚠️  ${error}`)
        stats.errors.push(error)
        stats.skipped++
        continue
      }

      // Create unique key for this property+unit combination
      const unitKey = `${propertyId}|${app.unitNumber}`

      // Check if we've already processed this unit in this run
      let unitId = unitCache.get(unitKey)

      if (!unitId) {
        // Check if unit already exists in database
        const existingUnit = await prisma.unit.findFirst({
          where: {
            propertyId,
            unitNumber: app.unitNumber
          }
        })

        if (existingUnit) {
          unitId = existingUnit.id
          unitCache.set(unitKey, unitId)
          console.log(`   ℹ️  App ${app.id}: Found existing unit ${app.property} - Unit ${app.unitNumber} (ID: ${unitId})`)
        } else {
          // Need to create the unit
          if (EXECUTE_MODE) {
            try {
              const newUnit = await prisma.unit.create({
                data: {
                  userId: app.userId,
                  propertyId,
                  unitNumber: app.unitNumber,
                  baseRent: app.rent || null,
                  status: 'Occupied' // Default to occupied since there's an application
                }
              })
              unitId = newUnit.id
              unitCache.set(unitKey, unitId)
              console.log(`   ✅ App ${app.id}: Created unit ${app.property} - Unit ${app.unitNumber} (ID: ${unitId})`)
              stats.unitsCreated++
            } catch (error: any) {
              const errorMsg = `App ${app.id}: Failed to create unit - ${error.message}`
              console.log(`   ❌ ${errorMsg}`)
              stats.errors.push(errorMsg)
              continue
            }
          } else {
            // Dry run - simulate unit creation
            const mockId = 1000 + unitCache.size
            unitId = mockId
            unitCache.set(unitKey, unitId)
            console.log(`   🔍 App ${app.id}: Would create unit ${app.property} - Unit ${app.unitNumber}`)
            stats.unitsCreated++
          }
        }
      }

      // Link application to unit
      if (unitId) {
        if (EXECUTE_MODE) {
          try {
            await prisma.application.update({
              where: { id: app.id },
              data: { unitId }
            })
            console.log(`   ✅ App ${app.id} (${app.applicant}): Linked to unit ${unitId}`)
            stats.applicationsLinked++
          } catch (error: any) {
            const errorMsg = `App ${app.id}: Failed to link - ${error.message}`
            console.log(`   ❌ ${errorMsg}`)
            stats.errors.push(errorMsg)
          }
        } else {
          console.log(`   🔍 App ${app.id} (${app.applicant}): Would link to unit ${unitId}`)
          stats.applicationsLinked++
        }
      }
    }

    console.log()

    // Final summary
    console.log('=' .repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('=' .repeat(60))
    console.log(`Total applications:                ${stats.totalApplications}`)
    console.log(`Already linked to units:           ${stats.alreadyLinked}`)
    console.log(`Units ${EXECUTE_MODE ? 'created' : 'to create'}:                  ${stats.unitsCreated}`)
    console.log(`Applications ${EXECUTE_MODE ? 'linked' : 'to link'}:            ${stats.applicationsLinked}`)
    console.log(`Skipped (missing property/unit):   ${stats.skipped}`)
    console.log(`Errors:                            ${stats.errors.length}`)
    console.log('=' .repeat(60))

    if (stats.errors.length > 0) {
      console.log()
      console.log('⚠️  ERRORS:')
      stats.errors.forEach(err => console.log(`   - ${err}`))
      console.log('=' .repeat(60))
    }

    if (!EXECUTE_MODE) {
      console.log()
      console.log('🔍 This was a DRY RUN - no changes were made')
      console.log('To execute the migration, run:')
      console.log('   npx tsx scripts/linkApplicationsToUnits.ts --execute')
    } else {
      console.log()
      console.log('✅ Migration completed!')
      console.log()
      console.log('⚠️  IMPORTANT: Legacy fields preserved')
      console.log('   - property and unitNumber fields still contain original values')
      console.log('   - These can be removed later once you verify everything works')
      console.log('   - Applications now use unitId for proper database relationships')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
linkApplicationsToUnits()
  .then(() => {
    console.log()
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
