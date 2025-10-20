'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

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
