/**
 * SmartExtractor - Intelligent PDF data extraction
 *
 * Extracts applicant data from AppFolio PDFs using pattern matching
 * and returns structured data with confidence scores.
 */

export interface ExtractedData {
  name: string | null
  email: string | null
  phone: string | null
  moveInDate: string | null
  property?: string | null
  unitNumber?: string | null
  unitId?: string | null  // Resolved unit ID (set by PDFPreviewModal)
  rent?: string | null
  createdAt?: string | null
  confidence: {
    overall: number
    name: number
    email: number
    phone: number
    moveInDate: number
    property?: number
    unitNumber?: number
    rent?: number
    createdAt?: number
  }
  metadata: {
    extractionMethod: 'pdf-parse' | 'ocr' | 'appfolio' | 'pdfjs-dist'
    processingTime: number
  }
}

export class SmartExtractor {
  private text: string
  private extractionMethod: 'pdf-parse' | 'ocr'
  private startTime: number

  constructor(text: string, extractionMethod: 'pdf-parse' | 'ocr' = 'pdf-parse') {
    this.text = text
    this.extractionMethod = extractionMethod
    this.startTime = Date.now()
  }

  /**
   * Main extraction method - extracts all fields
   */
  extract(): ExtractedData {
    const name = this.extractName()
    const email = this.extractEmail()
    const phone = this.extractPhone()
    const moveInDate = this.extractMoveInDate()
    const property = this.extractProperty()
    const unitNumber = this.extractUnitNumber()
    const rent = this.extractRent()
    const createdAt = this.extractCreatedAt()

    const confidence = {
      name: name.confidence,
      email: email.confidence,
      phone: phone.confidence,
      moveInDate: moveInDate.confidence,
      property: property.confidence,
      unitNumber: unitNumber.confidence,
      rent: rent.confidence,
      createdAt: createdAt.confidence,
      overall: (name.confidence + email.confidence + phone.confidence + moveInDate.confidence + property.confidence + unitNumber.confidence + rent.confidence + createdAt.confidence) / 8
    }

    return {
      name: name.value,
      email: email.value,
      phone: phone.value,
      moveInDate: moveInDate.value,
      property: property.value,
      unitNumber: unitNumber.value,
      rent: rent.value,
      createdAt: createdAt.value,
      confidence,
      metadata: {
        extractionMethod: this.extractionMethod,
        processingTime: Date.now() - this.startTime
      }
    }
  }

  /**
   * Extract name using multiple strategies
   */
  private extractName(): { value: string | null; confidence: number } {
    const text = this.text

    // Strategy 1: AppFolio-specific pattern "Rental Application for [NAME]"
    // Handle both structured (with newlines) and unstructured (pdfjs-dist) formats
    const appFolioPattern = /Rental Application for\s+([A-Z][A-Z\s.]+?)(?:\s{2,}|Applicants|Email|Phone|Address|Legacy|Residential|\n|$)/i
    const appFolioMatch = text.match(appFolioPattern)
    if (appFolioMatch && appFolioMatch[1]) {
      const name = appFolioMatch[1].trim()
      if (name.length >= 4 && name.length <= 50) {
        return { value: name, confidence: 0.95 }
      }
    }

    // Strategy 2: Look for "Applicant:" or "Name:" labeled fields (mixed case or all caps)
    const labelPatterns = [
      /(?:Applicant|Name|Full Name|Legal Name):\s*([A-Z][A-Za-z\s.]+?)(?:\n|$)/i,
      /(?:First|Last)\s*Name:\s*([A-Z][A-Za-z]+)/gi
    ]

    for (const pattern of labelPatterns) {
      const match = text.match(pattern)
      if (match) {
        const name = match[1].trim()
        if (this.isValidName(name)) {
          return { value: name, confidence: 0.9 }
        }
      }
    }

    // Strategy 3: Look for name at the top of document (handles both Title Case and ALL CAPS)
    const lines = text.split('\n')
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim()
      // Match both "John Smith" and "JOHN SMITH"
      const nameMatch = line.match(/^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z.]+){1,3})$/)
      if (nameMatch && this.isValidName(nameMatch[1])) {
        return { value: nameMatch[1], confidence: 0.7 }
      }
    }

    // Strategy 4: Look for name before email
    const beforeEmailPattern = /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z.]+)+)\s*[\n\r]+\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const beforeEmailMatch = text.match(beforeEmailPattern)
    if (beforeEmailMatch && this.isValidName(beforeEmailMatch[1])) {
      return { value: beforeEmailMatch[1], confidence: 0.8 }
    }

    return { value: null, confidence: 0 }
  }

  /**
   * Extract email address
   */
  private extractEmail(): { value: string | null; confidence: number } {
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    const matches = this.text.match(emailPattern)

    if (matches && matches.length > 0) {
      // AppFolio-specific: Look for email with "Type Financially" label (applicant's email)
      // Using [\s\S] instead of /s flag for ES2017 compatibility
      const applicantEmailPattern = /Email\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[\s\S]*?Type\s+Financially/
      const applicantMatch = this.text.match(applicantEmailPattern)
      if (applicantMatch && applicantMatch[1]) {
        return { value: applicantMatch[1].toLowerCase(), confidence: 0.95 }
      }

      // Fallback: If multiple emails, take the last one (emergency contact usually first)
      const email = matches[matches.length > 1 ? matches.length - 1 : 0].toLowerCase()
      if (this.isValidEmail(email)) {
        return { value: email, confidence: matches.length > 1 ? 0.7 : 0.95 }
      }
    }

    return { value: null, confidence: 0 }
  }

  /**
   * Extract phone number and format as XXX-XXX-XXXX
   */
  private extractPhone(): { value: string | null; confidence: number } {
    // Match various phone formats
    const phonePatterns = [
      /(?:Phone|Tel|Mobile|Cell):\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i,
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g
    ]

    for (const pattern of phonePatterns) {
      const match = this.text.match(pattern)
      if (match) {
        const phone = match[1] || match[0]
        const formatted = this.formatPhone(phone)
        if (formatted) {
          return { value: formatted, confidence: 0.9 }
        }
      }
    }

    return { value: null, confidence: 0 }
  }

  /**
   * Extract move-in date and format as MM/DD/YYYY
   */
  private extractMoveInDate(): { value: string | null; confidence: number } {
    const datePatterns = [
      /(?:Move[\s-]?In|Lease Start|Start Date):\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(?:Move[\s-]?In|Lease Start)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g // Generic date match
    ]

    for (const pattern of datePatterns) {
      const match = this.text.match(pattern)
      if (match) {
        const dateStr = match[1] || match[0]
        const formatted = this.formatDate(dateStr)
        if (formatted) {
          return { value: formatted, confidence: 0.85 }
        }
      }
    }

    return { value: null, confidence: 0 }
  }

  /**
   * Validate name (at least 2 words, reasonable length)
   */
  private isValidName(name: string): boolean {
    const words = name.trim().split(/\s+/)
    return words.length >= 2 && words.length <= 5 && name.length >= 4 && name.length <= 50
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  /**
   * Format phone as XXX-XXX-XXXX
   */
  private formatPhone(phone: string): string | null {
    // Extract only digits
    const digits = phone.replace(/\D/g, '')

    // Must be 10 digits
    if (digits.length !== 10) return null

    // Format as XXX-XXX-XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  /**
   * Format date as MM/DD/YYYY
   */
  private formatDate(dateStr: string): string | null {
    // Extract digits only
    const digits = dateStr.replace(/\D/g, '')

    // Need 6 or 8 digits (MMDDYY or MMDDYYYY)
    if (digits.length === 6) {
      // MMDDYY format
      const month = digits.slice(0, 2)
      const day = digits.slice(2, 4)
      const year = '20' + digits.slice(4, 6) // Assume 20xx
      return `${month}/${day}/${year}`
    } else if (digits.length === 8) {
      // MMDDYYYY format
      const month = digits.slice(0, 2)
      const day = digits.slice(2, 4)
      const year = digits.slice(4, 8)
      return `${month}/${day}/${year}`
    }

    // Try parsing with Date if above doesn't work
    try {
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) {
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const day = String(parsed.getDate()).padStart(2, '0')
        const year = parsed.getFullYear()
        return `${month}/${day}/${year}`
      }
    } catch {
      // Fall through
    }

    return null
  }

  /**
   * Extract property name
   */
  private extractProperty(): { value: string | null; confidence: number } {
    /**
     * Property extraction for AppFolio PDFs
     *
     * AppFolio PDFs use the inline format: "Property Name - Unit Number"
     * Examples: "Prairie Village - 3A", "Legacy Meadows - 4600-15"
     *
     * This uses the same pattern as extractUnitNumber() but captures the
     * property name (before " - ") instead of the unit (after " - ")
     */

    // Pattern: Capital letter, then letters/spaces (non-greedy), then " - ", then unit
    // Captures group 1: Property name before the " - "
    // Same proven pattern as extractUnitNumber() which is working correctly
    const propertyPattern = /([A-Z][A-Za-z\s]+?)\s+-\s+[A-Za-z0-9-]+/
    const match = this.text.match(propertyPattern)

    if (match && match[1]) {
      const property = match[1].trim()

      // Basic validation: reasonable length for a property name
      if (property.length >= 3 && property.length <= 50) {
        return { value: property, confidence: 0.9 }
      }
    }

    // No valid property found
    return { value: null, confidence: 0 }
  }

  /**
   * Extract rent amount
   */
  private extractRent(): { value: string | null; confidence: number } {
    // AppFolio-specific: "Market Rent" followed by dollar amount
    const marketRentPattern = /Market Rent[:\s]+\$?([\d,]+\.?\d*)/i
    const marketRentMatch = this.text.match(marketRentPattern)
    if (marketRentMatch && marketRentMatch[1]) {
      const rent = marketRentMatch[1].replace(/,/g, '')
      return { value: rent, confidence: 0.95 }
    }

    // Alternative: Look for "Rent:" label
    const rentPattern = /Rent[:\s]+\$?([\d,]+\.?\d*)/i
    const rentMatch = this.text.match(rentPattern)
    if (rentMatch && rentMatch[1]) {
      const rent = rentMatch[1].replace(/,/g, '')
      return { value: rent, confidence: 0.85 }
    }

    return { value: null, confidence: 0 }
  }

  /**
   * Extract unit number from property line
   */
  private extractUnitNumber(): { value: string | null; confidence: number } {
    // AppFolio-specific: Extract unit number after " - " in property line
    // Examples: "Legacy Meadows - 4600-15" → "4600-15", "West Glen Apartments - 712-06" → "712-06", "Prairie Village - 3A" → "3A"
    const unitPattern = /[A-Z][A-Za-z\s]+?\s+-\s+([A-Za-z0-9-]+)/
    const unitMatch = this.text.match(unitPattern)
    if (unitMatch && unitMatch[1]) {
      return { value: unitMatch[1], confidence: 0.9 }
    }

    // Alternative: Look for "Unit:" or "Unit Number:" label
    const labelPattern = /Unit(?:\s+Number)?[:\s]+([A-Za-z0-9-]+)/i
    const labelMatch = this.text.match(labelPattern)
    if (labelMatch && labelMatch[1]) {
      return { value: labelMatch[1].trim(), confidence: 0.85 }
    }

    return { value: null, confidence: 0 }
  }

  /**
   * Extract application/creation date
   */
  private extractCreatedAt(): { value: string | null; confidence: number } {
    // AppFolio-specific: "Submitted Via ... on MM/DD/YYYY"
    const submittedPattern = /Submitted\s+Via\s+.+?\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i
    const submittedMatch = this.text.match(submittedPattern)
    if (submittedMatch && submittedMatch[1]) {
      return { value: submittedMatch[1], confidence: 0.95 }
    }

    // Alternative: Look for "Created:" or "Application Date:" label
    const labelPattern = /(?:Created|Application Date|Submitted)[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i
    const labelMatch = this.text.match(labelPattern)
    if (labelMatch && labelMatch[1]) {
      return { value: labelMatch[1], confidence: 0.85 }
    }

    return { value: null, confidence: 0 }
  }
}
