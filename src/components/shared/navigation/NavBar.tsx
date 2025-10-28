'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { fadeIn, listStagger, slideUp } from '@/lib/animations/variants'

/**
 * NavBar Component
 *
 * A fixed navigation bar displaying all main application pages.
 * Shows active state for current page and provides quick navigation.
 *
 * @example
 * ```tsx
 * <NavBar />
 * ```
 *
 * To adapt for new projects:
 * 1. Update the navigation links array with your app's pages
 * 2. Adjust active state styling as needed
 * 3. Modify positioning (top-[73px]) to match your layout
 */

const navigationLinks = [
  { label: 'Dashboard', href: '/' },
  { label: 'Applications', href: '/applications' },
  { label: 'New Application', href: '/newapp' },
  { label: 'Properties', href: '/properties' },
  { label: 'Settings', href: '/settings' },
  { label: 'About', href: '/about' }
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <motion.nav
      key={`navbar-${pathname}`}
      data-navbar
      className="fixed left-0 right-0 w-full h-fit flex items-center gap-4 text-base font-sans text-gray-600 px-6 md:px-8 py-6 bg-white border-b border-gray-200 z-40"
      style={{ top: 'var(--topbar-height, 0px)' }}
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <motion.div
        key={`nav-links-${pathname}`}
        className="flex items-center gap-4"
        variants={listStagger}
        initial="hidden"
        animate="visible"
      >
        {navigationLinks.map((link, index) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href)

          return (
            <motion.div key={link.href} className="flex items-center gap-3" variants={slideUp}>
              {index > 0 && <span className="text-gray-300 select-none">/</span>}
              <Link
                href={link.href}
                className={`transition-colors font-sans ${
                  isActive
                    ? 'text-blue-700 font-semibold'
                    : 'hover:text-gray-900 hover:underline'
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.nav>
  )
}
