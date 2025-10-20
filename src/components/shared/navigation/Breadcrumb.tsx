'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

/**
 * Breadcrumb Component
 *
 * A navigation breadcrumb trail showing the current page hierarchy.
 * Last item is displayed as plain text, others as clickable links.
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Applications', href: '/applications' },
 *     { label: 'Application Details', href: '/applications/123' }
 *   ]}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Pass array of { label, href } objects
 * 2. Last item automatically displays without link
 * 3. Items separated by "/" character
 * 4. Customize separator by changing the <span>/</span>
 * 5. Adjust padding (px-[3%]) to match your layout
 */

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      className="flex items-center gap-2 text-sm font-sans text-gray-600 px-[3%] sm:px-[4%] md:px-[5%] lg:px-[6%] py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400">/</span>}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium font-sans">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-gray-900 transition-colors hover:underline font-sans"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  )
}
