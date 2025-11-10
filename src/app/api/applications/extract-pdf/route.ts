import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SmartExtractor } from '@/lib/pdf/smartExtractor'
import PDFParser from 'pdf2json'

/**
 * Extract text using pdf2json (serverless-compatible)
 */
async function extractWithPdf2Json(buffer: Buffer): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      console.log('Attempting pdf2json extraction...')
      const pdfParser = new PDFParser()

      pdfParser.on('pdfParser_dataError', (errData: Error) => {
        console.error('pdf2json extraction failed:', errData)
        resolve(null)
      })

      pdfParser.on('pdfParser_dataReady', () => {
        try {
          // Get raw text from all pages
          const rawText = pdfParser.getRawTextContent()
          console.log(`pdf2json extracted ${rawText.length} characters`)
          resolve(rawText)
        } catch (error) {
          console.error('pdf2json text extraction failed:', error)
          resolve(null)
        }
      })

      // Parse the PDF buffer
      pdfParser.parseBuffer(buffer)
    } catch (error) {
      console.error('pdf2json setup failed:', error)
      resolve(null)
    }
  })
}

/**
 * AppFolio-specific extraction from raw PDF buffer (Tier 3 - most targeted)
 * Extracts data using AppFolio's specific document structure
 * Returns structured data directly (bypasses SmartExtractor for better accuracy)
 */
function extractAppFolio(buffer: Buffer): { text: string; data: Record<string, string | null> } | null {
  try {
    // Try to extract any readable text from the buffer
    const text = buffer.toString('utf8')

    // Log first 1000 chars to see what we're working with
    console.log('===== RAW PDF BUFFER (first 1000 chars) =====')
    console.log(text.substring(0, 1000))
    console.log('===== END RAW BUFFER =====')

    const extractedData: Record<string, string | null> = {
      name: null,
      email: null,
      phone: null,
      moveInDate: null,
      property: null,
      unitNumber: null,
      rent: null,
      createdAt: null
    }

    // AppFolio-specific pattern: "Rental Application for [NAME]"
    // Handles all caps names like "RAYMOND D. GULLETT"
    const appFolioNamePattern = /Rental Application for\s+([A-Z][A-Z\s.]+?)(?:\n|Legacy|Address|$)/i
    const nameMatch = text.match(appFolioNamePattern)
    if (nameMatch && nameMatch[1]) {
      extractedData.name = nameMatch[1].trim()
      console.log('Found applicant name:', extractedData.name)
    }

    // AppFolio-specific pattern: Property name with unit number
    // Look for pattern like "Property Name - UnitNumber" (e.g., "Legacy Meadows - 4600-15", "Prairie Village - 3A")
    const propertyPattern = /([A-Z][A-Za-z\s]+?)\s+-\s+[A-Za-z0-9-]+/
    const propertyMatch = text.match(propertyPattern)
    console.log('Property pattern match:', propertyMatch)
    if (propertyMatch && propertyMatch[1]) {
      const property = propertyMatch[1].trim()
      console.log('Property extracted (before length check):', property, 'length:', property.length)
      if (property.length > 3 && property.length < 100) {
        extractedData.property = property
        console.log('Found property:', extractedData.property)
      } else {
        console.log('Property rejected due to length')
      }
    } else {
      console.log('No property match found')
    }

    // AppFolio-specific pattern: Unit number from property line
    // Extract unit number after " - " (e.g., "4600-15", "712-06", "3A")
    const unitPattern = /[A-Z][A-Za-z\s]+?\s+-\s+([A-Za-z0-9-]+)/
    const unitMatch = text.match(unitPattern)
    if (unitMatch && unitMatch[1]) {
      extractedData.unitNumber = unitMatch[1]
      console.log('Found unit number:', extractedData.unitNumber)
    }

    // AppFolio-specific pattern: "Market Rent" followed by dollar amount
    const rentPattern = /Market Rent[:\s]+\$?([\d,]+\.?\d*)/i
    const rentMatch = text.match(rentPattern)
    if (rentMatch && rentMatch[1]) {
      // Remove commas and format as dollar amount
      const rentValue = rentMatch[1].replace(/,/g, '')
      extractedData.rent = rentValue
      console.log('Found rent:', extractedData.rent)
    }

    // AppFolio-specific pattern: "Desired Move In" followed by date
    const moveInPattern = /Desired Move In[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i
    const moveInMatch = text.match(moveInPattern)
    if (moveInMatch && moveInMatch[1]) {
      extractedData.moveInDate = moveInMatch[1]
      console.log('Found move-in date:', extractedData.moveInDate)
    }

    // AppFolio-specific pattern: Application/creation date from "Submitted Via ... on MM/DD/YYYY"
    const createdAtPattern = /Submitted\s+Via\s+.+?\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i
    const createdAtMatch = text.match(createdAtPattern)
    if (createdAtMatch && createdAtMatch[1]) {
      extractedData.createdAt = createdAtMatch[1]
      console.log('Found application date:', extractedData.createdAt)
    }

    // Find all emails and phones first
    const allEmails = [...new Set(text.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g) || [])]
    const allPhones = [...new Set(text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [])]

    console.log('All emails found:', allEmails)
    console.log('All phones found:', allPhones)

    // For email: Find email in the applicant's detail section
    // The applicant's email comes AFTER their name section and AFTER "Emergency Contact"
    // Look for pattern: applicant name section -> emergency contact section -> applicant detail section with email

    // First, try to find email that's labeled as the applicant's email (not emergency contact)
    const applicantEmailPattern = new RegExp(
      extractedData.name +
      '.*?' +
      'Email\\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}).*?' +
      'Type\\s+Financially',
      's'
    )

    const applicantEmailMatch = text.match(applicantEmailPattern)
    if (applicantEmailMatch && applicantEmailMatch[1]) {
      extractedData.email = applicantEmailMatch[1]
      console.log('Found applicant email (labeled with type):', extractedData.email)
    } else {
      // Fallback: Look for email after "Residential History" or after the applicant name appears a second time
      const afterNamePattern = new RegExp(
        extractedData.name +
        '[\\s\\S]*?' +
        extractedData.name +
        '[\\s\\S]*?' +
        'Email\\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})'
      )

      const afterNameMatch = text.match(afterNamePattern)
      if (afterNameMatch && afterNameMatch[1]) {
        extractedData.email = afterNameMatch[1]
        console.log('Found applicant email (after second name occurrence):', extractedData.email)
      } else if (allEmails.length > 0) {
        // Last resort: take the last email (emergency contact is usually first)
        extractedData.email = allEmails[allEmails.length - 1]
        console.log('Found applicant email (last email):', extractedData.email)
      }
    }

    // For phone: Look for phone with "mobile" label (applicant's phone)
    const mobilePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\s+mobile/i
    const mobileMatch = text.match(mobilePattern)
    if (mobileMatch) {
      const phoneDigits = mobileMatch[0].match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
      if (phoneDigits) {
        extractedData.phone = phoneDigits[0]
        console.log('Found applicant phone (mobile):', extractedData.phone)
      }
    } else {
      // Fallback: Get the first phone that's NOT in the emergency contact section
      const emergencySection = text.indexOf('Emergency Contact')
      if (emergencySection > -1) {
        const beforeEmergency = text.substring(0, emergencySection)
        const phonesBeforeEmergency = beforeEmergency.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g)
        if (phonesBeforeEmergency && phonesBeforeEmergency.length > 0) {
          extractedData.phone = phonesBeforeEmergency[phonesBeforeEmergency.length - 1]
          console.log('Found applicant phone (before emergency section):', extractedData.phone)
        }
      } else if (allPhones.length > 0) {
        extractedData.phone = allPhones[0]
        console.log('Found applicant phone (first):', extractedData.phone)
      }
    }

    console.log('===== APPFOLIO EXTRACTION COMPLETE =====')
    console.log('Extracted data:', extractedData)
    console.log('===== END EXTRACTION =====')

    // Build text representation
    let simpleText = ''
    if (extractedData.name) {
      simpleText += `Name: ${extractedData.name}\n`
    }
    if (extractedData.email) {
      simpleText += `Email: ${extractedData.email}\n`
    }
    if (extractedData.phone) {
      simpleText += `Phone: ${extractedData.phone}\n`
    }
    if (extractedData.moveInDate) {
      simpleText += `Desired Move In: ${extractedData.moveInDate}\n`
    }
    if (extractedData.property) {
      simpleText += `Property: ${extractedData.property}\n`
    }
    if (extractedData.unitNumber) {
      simpleText += `Unit Number: ${extractedData.unitNumber}\n`
    }
    if (extractedData.rent) {
      simpleText += `Rent: ${extractedData.rent}\n`
    }
    if (extractedData.createdAt) {
      simpleText += `Application Date: ${extractedData.createdAt}\n`
    }

    return {
      text: simpleText,
      data: extractedData
    }
  } catch (error) {
    console.error('AppFolio extraction failed:', error)
    return null
  }
}

/**
 * POST /api/applications/extract-pdf
 * Upload and extract data from AppFolio PDF
 */
export async function POST(request: NextRequest) {
  console.log('=== PDF Extract API Called ===')
  const startTime = Date.now()

  try {
    const { userId } = await auth()
    console.log('User ID:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    console.log('File received:', file?.name, file?.type, file?.size)

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'PDF file too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    console.log('Converting to buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('Buffer size:', buffer.length)

    // 2-Tier extraction strategy with fallback (using pdf2json for serverless compatibility)
    let extractedText = ''
    let extractionMethod: 'pdf2json' | 'appfolio' = 'pdf2json'
    let appFolioDirectData: Record<string, string | null> | null = null

    // Tier 1: Try pdf2json first (serverless-compatible, pure JavaScript)
    extractedText = await extractWithPdf2Json(buffer) || ''
    console.log(`[DEBUG] pdf2json extracted ${extractedText.length} characters`)

    if (extractedText.length > 50) {
      console.log('✓ pdf2json extraction successful')
      extractionMethod = 'pdf2json'
    } else {
      // Tier 2: AppFolio-specific pattern extraction (direct buffer parsing)
      console.log('pdf2json insufficient, using AppFolio-specific extraction...')
      const appFolioResult = extractAppFolio(buffer)

      if (!appFolioResult || appFolioResult.text.length < 10) {
        console.log('All extraction methods failed')
        console.log('[DEBUG] pdf2json length:', extractedText.length)
        console.log('[DEBUG] AppFolio result:', appFolioResult ? `text length: ${appFolioResult.text.length}` : 'null')
        return NextResponse.json(
          {
            error: 'Could not extract text from PDF. The file may be a scanned image, corrupted, or in an unsupported format.',
            details: process.env.NODE_ENV === 'development' ? 'All extraction methods (pdf2json, appfolio) failed' : undefined
          },
          { status: 422 }
        )
      }

      extractedText = appFolioResult.text
      appFolioDirectData = appFolioResult.data
      extractionMethod = 'appfolio'
      console.log('✓ AppFolio extraction successful')
    }

    console.log(`Extracted ${extractedText.length} characters using ${extractionMethod}`)
    console.log('[DEBUG] First 500 chars of extracted text:', extractedText.substring(0, 500))

    let extractedData

    // If AppFolio extraction was used, use its direct data (more accurate)
    if (extractionMethod === 'appfolio' && appFolioDirectData) {
      console.log('Using AppFolio direct extraction (bypassing SmartExtractor)')
      console.log('[DEBUG] AppFolio data:', JSON.stringify(appFolioDirectData, null, 2))

      // Calculate field count for confidence
      const fieldsFound = [
        appFolioDirectData.name,
        appFolioDirectData.email,
        appFolioDirectData.phone,
        appFolioDirectData.moveInDate,
        appFolioDirectData.property,
        appFolioDirectData.unitNumber,
        appFolioDirectData.rent,
        appFolioDirectData.createdAt
      ].filter(Boolean).length

      const totalFields = 8
      const overallConfidence = fieldsFound / totalFields

      extractedData = {
        name: appFolioDirectData.name,
        email: appFolioDirectData.email,
        phone: appFolioDirectData.phone,
        moveInDate: appFolioDirectData.moveInDate,
        property: appFolioDirectData.property,
        unitNumber: appFolioDirectData.unitNumber,
        rent: appFolioDirectData.rent,
        createdAt: appFolioDirectData.createdAt,
        confidence: {
          name: appFolioDirectData.name ? 0.95 : 0,
          email: appFolioDirectData.email ? 0.95 : 0,
          phone: appFolioDirectData.phone ? 0.95 : 0,
          moveInDate: appFolioDirectData.moveInDate ? 0.95 : 0,
          property: appFolioDirectData.property ? 0.95 : 0,
          unitNumber: appFolioDirectData.unitNumber ? 0.95 : 0,
          rent: appFolioDirectData.rent ? 0.95 : 0,
          createdAt: appFolioDirectData.createdAt ? 0.95 : 0,
          overall: overallConfidence
        },
        metadata: {
          extractionMethod: 'appfolio' as 'pdf-parse' | 'ocr' | 'appfolio',
          processingTime: Date.now() - startTime
        }
      }
    } else {
      // Use SmartExtractor for pdf2json results
      console.log('[DEBUG] Using SmartExtractor with method:', extractionMethod)
      const extractor = new SmartExtractor(extractedText, 'pdf-parse')
      extractedData = extractor.extract()
      extractedData.metadata.extractionMethod = extractionMethod as 'pdf-parse' | 'ocr' | 'appfolio' | 'pdfjs-dist'
      extractedData.metadata.processingTime = Date.now() - startTime
      console.log('[DEBUG] SmartExtractor results:', JSON.stringify(extractedData, null, 2))
    }

    console.log('Extraction complete:', {
      method: extractionMethod,
      fieldsFound: Object.keys(extractedData).filter(k => extractedData[k as keyof typeof extractedData] && k !== 'metadata' && k !== 'confidence').length,
      confidence: extractedData.confidence.overall
    })
    console.log('[DEBUG] Final extracted data:', JSON.stringify(extractedData, null, 2))

    // Return extracted data
    return NextResponse.json(
      {
        success: true,
        data: extractedData
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error extracting PDF:', error)
    return NextResponse.json(
      {
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
