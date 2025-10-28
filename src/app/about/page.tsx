'use client'

import { motion } from 'motion/react'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations/variants'
import NavBar from '@/components/shared/navigation/NavBar'

export default function AboutVersion2() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full">
        {/* Main Container */}
        <div className="flex flex-col w-full gap-8 p-6">

        {/* Header */}
        <motion.div
          className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            React + Tailwind CSS v4: Pure Vanilla Stack
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Learn Layout with Direct Tailwind Classes - No Abstractions!
          </h2>
          <p className="text-lg text-gray-600">
            This page teaches the same concepts as the Frame tutorial, but using <strong>pure React, Tailwind, and TypeScript</strong>.
            Every section shows the <strong>exact Tailwind classes</strong> and the CSS they generate.
            No custom components, no abstractions - just standard HTML elements with utility classes.
          </p>

          {/* Code Reference: This Header */}
          <div className="flex flex-col gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 rounded-lg">
            <p className="font-semibold text-blue-900"> This Header Uses:</p>
            <div className="font-mono text-sm bg-white/60 rounded p-3">
              <code className="text-blue-700">&lt;motion.div</code><br />
              <code className="text-blue-700 ml-4">className=&quot;flex flex-col gap-6 p-8&quot;</code><br />
              <code className="text-blue-700 ml-4">variants={`{fadeInUp}`}</code><br />
              <code className="text-blue-700">&gt;</code>
            </div>
            <div className="text-xs text-gray-700 bg-white/60 rounded p-2">
              <strong>Generates CSS:</strong> <code>display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem;</code>
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-4">
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium">
              <strong>Layer 1:</strong> HTML Elements
            </div>
            <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 font-medium">
              <strong>Layer 2:</strong> Tailwind Utilities
            </div>
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-900 font-medium">
              <strong>Layer 3:</strong> Motion Animations
            </div>
          </div>
        </motion.div>

        {/* SECTION 1: POSITION PROPERTIES */}
        <motion.section
          className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={staggerItem}>
            <h2 className="text-3xl font-bold text-gray-800"> Section 1: CSS Position (4 Values)</h2>
          </motion.div>
          <motion.p variants={staggerItem} className="text-gray-600">
            Control element positioning with Tailwind&apos;s position utilities
          </motion.p>

          {/* Exercise 1.1: Relative Position */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">1.1 Position: Relative</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <p className="font-semibold text-sm text-blue-900"> The Card Below Uses:</p>
              <code className="text-sm font-mono bg-white rounded px-2 py-1">className=&quot;relative&quot;</code>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>position: relative;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Element participates in document flow, can be offset</p>
            </div>

            <div className="flex flex-col w-full gap-4 p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
              <div className="relative rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Relative Positioned Card</h3>
                <p className="text-sm opacity-80">I use className=&quot;relative&quot; - I&apos;m in the normal document flow</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 1.2: Absolute Position */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">1.2 Position: Absolute</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <p className="font-semibold text-sm text-green-900"> This Example Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <p><strong>Container:</strong> <code className="text-green-700">className=&quot;relative&quot;</code></p>
                <p><strong>Card Inside:</strong> <code className="text-green-700">className=&quot;absolute&quot;</code></p>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>position: absolute;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Card removed from flow, positions relative to container</p>
            </div>

            <div className="relative flex flex-col w-full gap-4 p-4 border-2 border-dashed border-green-400 rounded-lg bg-green-50 min-h-[200px]">
              <div
                className="absolute rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6"
                style={{ top: '10px', right: '10px', zIndex: 10 }}
              >
                <h3 className="text-xl font-semibold mb-2">Absolute Card</h3>
                <p className="text-sm opacity-80">I use className=&quot;absolute&quot; - I float above everything!</p>
              </div>
              <div className="h-24 bg-white/60 rounded-lg p-4">
                <p className="text-gray-700">Container has className=&quot;relative&quot; - the absolute card positions relative to me!</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 1.3: Sticky Position */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">1.3 Position: Sticky</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-orange-50 border-l-4 border-orange-600 rounded">
              <p className="font-semibold text-sm text-orange-900"> The Card Below Uses:</p>
              <code className="text-sm font-mono bg-white rounded px-2 py-1">className=&quot;sticky&quot;</code>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>position: sticky;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Switches between relative and fixed based on scroll</p>
            </div>

            <div className="flex flex-col w-full border-2 border-dashed border-orange-400 rounded-lg overflow-auto" style={{ height: '300px' }}>
              <div
                className="sticky rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6"
                style={{ top: '0', zIndex: 5 }}
              >
                <h3 className="text-xl font-semibold mb-2">Sticky Header Card</h3>
                <p className="text-sm opacity-80">I use className=&quot;sticky&quot; - Scroll to see me stick!</p>
              </div>
              <div className="p-4 bg-orange-50" style={{ height: '600px' }}>
                <p className="text-gray-700">Scroll down to see the sticky behavior...</p>
                <p className="text-gray-700 mt-24">The card above stays fixed at the top while you scroll!</p>
                <p className="text-gray-700 mt-24">Keep scrolling...</p>
                <p className="text-gray-700 mt-24">Notice how the sticky card follows you!</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 1.4: Fixed Position */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">1.4 Position: Fixed</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
              <p className="font-semibold text-sm text-purple-900"> Fixed Position Class:</p>
              <code className="text-sm font-mono bg-white rounded px-2 py-1">className=&quot;fixed&quot;</code>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>position: fixed;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Positioned relative to viewport, stays during scroll</p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
              ⚠️ Fixed elements removed from normal flow - use sparingly for overlays, modals, navigation
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 2: SIZE PROPERTIES */}
        <motion.section
          className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={staggerItem}>
            <h2 className="text-3xl font-bold text-gray-800"> Section 2: Sizing Utilities (Width & Height)</h2>
          </motion.div>
          <motion.p variants={staggerItem} className="text-gray-600">
            Control element dimensions with Tailwind&apos;s width and height utilities
          </motion.p>

          {/* Exercise 2.1: Full Size (w-full, h-full) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">2.1 Size: Full (w-full, h-full)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <p className="font-semibold text-sm text-blue-900"> This Example Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <p><strong>Container:</strong> <code className="text-blue-700">className=&quot;w-full&quot;</code></p>
                <p><strong>Card Inside:</strong> <code className="text-blue-700">className=&quot;w-full h-full&quot;</code></p>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>width: 100%; height: 100%;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Element expands to fill all available container space</p>
            </div>

            <div className="flex flex-col w-full p-2 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50" style={{ height: '200px' }}>
              <div className="w-full h-full rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Full-Sized Card</h3>
                <p className="text-sm opacity-80">I use className=&quot;w-full h-full&quot; - I fill the blue dashed container!</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 2.2: Flex Size (flex-1) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">2.2 Size: Flex Grow (flex-1)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <p className="font-semibold text-sm text-green-900"> This Example Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <p><strong>Container:</strong> <code className="text-green-700">className=&quot;flex flex-row&quot;</code></p>
                <p><strong>Each Card:</strong> <code className="text-green-700">className=&quot;flex-1&quot;</code></p>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>flex: 1 1 0%;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Elements share space proportionally</p>
            </div>

            <div className="flex flex-row gap-4 p-2 border-2 border-dashed border-green-400 rounded-lg bg-green-50" style={{ height: '120px' }}>
              <div className="flex-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Flex 1</h3>
                <p className="text-sm opacity-80">flex-1</p>
              </div>
              <div className="flex-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Flex 2</h3>
                <p className="text-sm opacity-80">flex-1</p>
              </div>
              <div className="flex-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Flex 3</h3>
                <p className="text-sm opacity-80">flex-1</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 2.3: Fixed Size (w-80, h-80) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">2.3 Size: Fixed (w-80 = 320px)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-orange-50 border-l-4 border-orange-600 rounded">
              <p className="font-semibold text-sm text-orange-900"> This Example Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <p><strong>Card (left):</strong> <code className="text-orange-700">className=&quot;w-80 h-80&quot;</code></p>
                <p><strong>Div (right):</strong> <code className="text-orange-700">className=&quot;flex-1&quot;</code></p>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>width: 20rem; height: 20rem;</code> (320px)</p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Card stays 320px, div fills remaining space</p>
            </div>

            <div className="flex flex-row gap-4 p-2 border-2 border-dashed border-orange-400 rounded-lg bg-orange-50">
              <div className="w-80 h-80 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Fixed Card</h3>
                <p className="text-sm opacity-80">className=&quot;w-80 h-80&quot; - Always 320px!</p>
              </div>
              <div className="flex-1 p-4 bg-white/60 rounded-lg">
                <p className="text-gray-700">I have className=&quot;flex-1&quot; - I take the remaining space after the fixed 320px card!</p>
                <p className="text-gray-700 mt-2">The fixed card never changes size, even if you resize the browser.</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 2.4: Fit Content Size (w-fit, h-fit) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">2.4 Size: Fit Content (w-fit, h-fit)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
              <p className="font-semibold text-sm text-purple-900"> This Example Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <p><strong>Container:</strong> <code className="text-purple-700">className=&quot;flex items-start&quot;</code></p>
                <p><strong>Each Card:</strong> <code className="text-purple-700">className=&quot;w-fit h-fit&quot;</code></p>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>width: fit-content; height: fit-content;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Cards shrink to content size, grow only as needed</p>
            </div>

            <div className="flex flex-row gap-4 items-start p-2 border-2 border-dashed border-purple-400 rounded-lg bg-purple-50">
              <div className="w-fit h-fit rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Fit Content</h3>
                <p className="text-sm opacity-80">I&apos;m small</p>
              </div>
              <div className="w-fit h-fit rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">This card has much longer content</h3>
                <p className="text-sm opacity-80">I&apos;m bigger because I have more content!</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 2.5: Viewport Size (w-screen, h-screen) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">2.5 Size: Viewport (w-screen, h-screen)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded">
              <p className="font-semibold text-sm text-indigo-900"> Viewport Size Classes:</p>
              <code className="text-sm font-mono bg-white rounded px-2 py-1">className=&quot;w-screen h-screen&quot;</code>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>width: 100vw; height: 100vh;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Sizes relative to viewport (100vw, 100vh)</p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
              ⚠️ Viewport sizing shown conceptually - full viewport cards would break page layout
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 3: LAYOUT & DIRECTION */}
        <motion.section
          className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={staggerItem}>
            <h2 className="text-3xl font-bold text-gray-800">️ Section 3: Layout & Direction</h2>
          </motion.div>
          <motion.p variants={staggerItem} className="text-gray-600">
            Control layout containers with Flexbox and CSS Grid
          </motion.p>

          {/* Exercise 3.1: Flexbox Layout */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">3.1 Layout: Flexbox (flex)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-red-50 border-l-4 border-red-600 rounded">
              <p className="font-semibold text-sm text-red-900"> The Container Below Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <code className="text-red-700">className=&quot;flex flex-row gap-4&quot;</code>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>display: flex; flex-direction: row; gap: 1rem;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Creates flexbox container</p>
            </div>

            <div className="flex flex-row gap-4 p-2 border-2 border-dashed border-red-400 rounded-lg bg-red-50">
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Flex Child 1</h3>
                <p className="text-sm opacity-80">In flex container</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Flex Child 2</h3>
                <p className="text-sm opacity-80">Linear arrangement</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Flex Child 3</h3>
                <p className="text-sm opacity-80">Perfect alignment</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 3.2: Grid Layout */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">3.2 Layout: CSS Grid</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-cyan-50 border-l-4 border-cyan-600 rounded">
              <p className="font-semibold text-sm text-cyan-900"> The Container Below Uses:</p>
              <div className="font-mono text-sm bg-white rounded px-2 py-1">
                <code className="text-cyan-700">className=&quot;grid gap-4 grid-cols-2 md:grid-cols-4&quot;</code>
              </div>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0, 1fr));</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> CSS grid container for 2D layouts</p>
            </div>

            <div className="grid gap-4 p-2 border-2 border-dashed border-cyan-400 rounded-lg bg-cyan-50 grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Grid Item 1</h3>
                <p className="text-sm opacity-80">grid layout</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Grid Item 2</h3>
                <p className="text-sm opacity-80">Wraps auto</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Grid Item 3</h3>
                <p className="text-sm opacity-80">Responsive</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">Grid Item 4</h3>
                <p className="text-sm opacity-80">Resize to see</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 3.3: Horizontal Direction (flex-row) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">3.3 Direction: Horizontal (flex-row)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-lime-50 border-l-4 border-lime-600 rounded">
              <p className="font-semibold text-sm text-lime-900"> The Container Below Uses:</p>
              <code className="text-sm font-mono bg-white rounded px-2 py-1">className=&quot;flex flex-row&quot;</code>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>flex-direction: row;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Main axis flows left to right (→ → →)</p>
            </div>

            <div className="flex flex-row gap-4 p-2 border-2 border-dashed border-lime-400 rounded-lg bg-lime-50">
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">→ Left</h3>
                <p className="text-sm opacity-80">flex-row</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">→ Center</h3>
                <p className="text-sm opacity-80">Horizontal flow</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">→ Right</h3>
                <p className="text-sm opacity-80">Left to right</p>
              </div>
            </div>
          </motion.div>

          {/* Exercise 3.4: Vertical Direction (flex-col) */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">3.4 Direction: Vertical (flex-col)</h3>

            {/* Code Reference Box */}
            <div className="flex flex-col gap-2 p-4 bg-orange-50 border-l-4 border-orange-600 rounded">
              <p className="font-semibold text-sm text-orange-900"> The Container Below Uses:</p>
              <code className="text-sm font-mono bg-white rounded px-2 py-1">className=&quot;flex flex-col&quot;</code>
              <p className="text-xs text-gray-700"><strong>CSS Output:</strong> <code>flex-direction: column;</code></p>
              <p className="text-xs text-gray-600"><strong>Behavior:</strong> Main axis flows top to bottom (↓ ↓ ↓)</p>
            </div>

            <div className="flex flex-col gap-4 p-2 border-2 border-dashed border-orange-400 rounded-lg bg-orange-50 w-64">
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">↓ Top</h3>
                <p className="text-sm opacity-80">flex-col</p>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                <h3 className="text-xl font-semibold mb-2">↓ Middle</h3>
                <p className="text-sm opacity-80">Vertical flow</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                <h3 className="text-xl font-semibold mb-2">↓ Bottom</h3>
                <p className="text-sm opacity-80">Top to bottom</p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 4: DISTRIBUTION & ALIGNMENT */}
        <motion.section
          className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={staggerItem}>
            <h2 className="text-3xl font-bold text-gray-800">️ Section 4: Distribution & Alignment</h2>
          </motion.div>
          <motion.p variants={staggerItem} className="text-gray-600">
            Control justify-content (distribution) and align-items (alignment)
          </motion.p>

          {/* Distribution Examples */}
          <motion.div variants={staggerItem} className="flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-gray-800">4.1-4.4 Distribution (justify-content)</h3>

            {/* Start Distribution */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Start Distribution (justify-start)</h4>
              <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                <code className="text-sm font-mono">className=&quot;justify-start&quot;</code>
                <p className="text-xs text-gray-700"> <code>justify-content: flex-start;</code></p>
              </div>
              <div className="flex flex-row justify-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 h-20">
                <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">Start 1</h3>
                  <p className="text-sm opacity-80">Packed at start</p>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">Start 2</h3>
                  <p className="text-sm opacity-80">[■■      ]</p>
                </div>
              </div>
            </div>

            {/* Center Distribution */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Center Distribution (justify-center)</h4>
              <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                <code className="text-sm font-mono">className=&quot;justify-center&quot;</code>
                <p className="text-xs text-gray-700"> <code>justify-content: center;</code></p>
              </div>
              <div className="flex flex-row justify-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 h-20">
                <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">Center 1</h3>
                  <p className="text-sm opacity-80">Centered together</p>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">Center 2</h3>
                  <p className="text-sm opacity-80">[   ■■   ]</p>
                </div>
              </div>
            </div>

            {/* End Distribution */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">End Distribution (justify-end)</h4>
              <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                <code className="text-sm font-mono">className=&quot;justify-end&quot;</code>
                <p className="text-xs text-gray-700"> <code>justify-content: flex-end;</code></p>
              </div>
              <div className="flex flex-row justify-end gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 h-20">
                <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">End 1</h3>
                  <p className="text-sm opacity-80">Packed at end</p>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">End 2</h3>
                  <p className="text-sm opacity-80">[      ■■]</p>
                </div>
              </div>
            </div>

            {/* Space Between */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Space Between (justify-between)</h4>
              <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                <code className="text-sm font-mono">className=&quot;justify-between&quot;</code>
                <p className="text-xs text-gray-700"> <code>justify-content: space-between;</code></p>
              </div>
              <div className="flex flex-row justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 h-20">
                <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">Space 1</h3>
                  <p className="text-sm opacity-80">Equal space between</p>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">Space 2</h3>
                  <p className="text-sm opacity-80">[■      ■]</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alignment Examples */}
          <motion.div variants={staggerItem} className="flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-gray-800">4.5-4.7 Alignment (align-items)</h3>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Start Alignment */}
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">Start Alignment (items-start)</h4>
                <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                  <code className="text-sm font-mono">className=&quot;items-start&quot;</code>
                  <p className="text-xs text-gray-700"> <code>align-items: flex-start;</code></p>
                </div>
                <div className="flex flex-row items-start gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50 h-32">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Top</h3>
                    <p className="text-sm opacity-80">items-start</p>
                  </div>
                </div>
              </div>

              {/* Center Alignment */}
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">Center Alignment (items-center)</h4>
                <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                  <code className="text-sm font-mono">className=&quot;items-center&quot;</code>
                  <p className="text-xs text-gray-700"> <code>align-items: center;</code></p>
                </div>
                <div className="flex flex-row items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50 h-32">
                  <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Middle</h3>
                    <p className="text-sm opacity-80">items-center</p>
                  </div>
                </div>
              </div>

              {/* End Alignment */}
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">End Alignment (items-end)</h4>
                <div className="flex flex-col gap-1 p-2 bg-gray-50 border-l-4 border-gray-600 rounded">
                  <code className="text-sm font-mono">className=&quot;items-end&quot;</code>
                  <p className="text-xs text-gray-700"> <code>align-items: flex-end;</code></p>
                </div>
                <div className="flex flex-row items-end gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50 h-32">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Bottom</h3>
                    <p className="text-sm opacity-80">items-end</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 5: WRAP & SPACING */}
        <motion.section
          className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={staggerItem}>
            <h2 className="text-3xl font-bold text-gray-800"> Section 5: Wrap & Spacing</h2>
          </motion.div>
          <motion.p variants={staggerItem} className="text-gray-600">
            Control wrapping behavior and spacing with gap and padding utilities
          </motion.p>

          {/* Wrap Examples */}
          <motion.div variants={staggerItem} className="flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-gray-800">5.1-5.2 Wrap Utilities</h3>

            {/* Wrap Yes */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Wrap: Yes (flex-wrap)</h4>
              <div className="flex flex-col gap-1 p-2 bg-green-50 border-l-4 border-green-600 rounded">
                <code className="text-sm font-mono">className=&quot;flex-wrap&quot;</code>
                <p className="text-xs text-gray-700"> <code>flex-wrap: wrap;</code></p>
                <p className="text-xs text-gray-600">Elements wrap to new lines when needed</p>
              </div>
              <div className="flex flex-row flex-wrap gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-fit rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6" style={{ minWidth: '200px' }}>
                  <h3 className="text-xl font-semibold mb-2">Wrap 1</h3>
                  <p className="text-sm opacity-80">Wraps if needed</p>
                </div>
                <div className="w-fit rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6" style={{ minWidth: '200px' }}>
                  <h3 className="text-xl font-semibold mb-2">Wrap 2</h3>
                  <p className="text-sm opacity-80">Responsive!</p>
                </div>
                <div className="w-fit rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6" style={{ minWidth: '200px' }}>
                  <h3 className="text-xl font-semibold mb-2">Wrap 3</h3>
                  <p className="text-sm opacity-80">Resize browser</p>
                </div>
                <div className="w-fit rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6" style={{ minWidth: '200px' }}>
                  <h3 className="text-xl font-semibold mb-2">Wrap 4</h3>
                  <p className="text-sm opacity-80">See wrapping</p>
                </div>
              </div>
            </div>

            {/* Wrap No */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Wrap: No (flex-nowrap)</h4>
              <div className="flex flex-col gap-1 p-2 bg-red-50 border-l-4 border-red-600 rounded">
                <code className="text-sm font-mono">className=&quot;flex-nowrap&quot;</code>
                <p className="text-xs text-gray-700"> <code>flex-wrap: nowrap;</code></p>
                <p className="text-xs text-gray-600">Elements stay on single line, may overflow</p>
              </div>
              <div className="flex flex-row flex-nowrap gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-auto">
                <div className="w-80 shrink-0 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">No Wrap 1</h3>
                  <p className="text-sm opacity-80">Single line</p>
                </div>
                <div className="w-80 shrink-0 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">No Wrap 2</h3>
                  <p className="text-sm opacity-80">Stays inline</p>
                </div>
                <div className="w-80 shrink-0 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">No Wrap 3</h3>
                  <p className="text-sm opacity-80">May overflow</p>
                </div>
                <div className="w-80 shrink-0 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                  <h3 className="text-xl font-semibold mb-2">No Wrap 4</h3>
                  <p className="text-sm opacity-80">Scroll →</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Spacing Examples */}
          <motion.div variants={staggerItem} className="flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-gray-800">5.3-5.4 Spacing Utilities</h3>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Gap Spacing */}
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">Gap Spacing (gap-4)</h4>
                <div className="flex flex-col gap-1 p-2 bg-blue-50 border-l-4 border-blue-600 rounded">
                  <code className="text-sm font-mono">className=&quot;gap-4&quot;</code>
                  <p className="text-xs text-gray-700"> <code>gap: 1rem;</code> (16px)</p>
                </div>
                <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Gap Card 1</h3>
                    <p className="text-sm opacity-80">16px between items</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Gap Card 2</h3>
                    <p className="text-sm opacity-80">Consistent spacing</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Gap Card 3</h3>
                    <p className="text-sm opacity-80">No margin needed!</p>
                  </div>
                </div>
              </div>

              {/* Padding Spacing */}
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">Padding Spacing (p-6)</h4>
                <div className="flex flex-col gap-1 p-2 bg-purple-50 border-l-4 border-purple-600 rounded">
                  <code className="text-sm font-mono">className=&quot;p-6&quot;</code>
                  <p className="text-xs text-gray-700"> <code>padding: 1.5rem;</code> (24px)</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="rounded-xl bg-purple-50 border border-purple-200 text-purple-900 p-6">
                    <h3 className="text-xl font-semibold mb-2">Padded Card</h3>
                    <p className="text-sm opacity-80">Inside container with p-6</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* MASTERY SUMMARY */}
        <motion.section
          className="flex flex-col gap-6 p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl text-white"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold"> Congratulations! You&apos;ve Mastered Tailwind Layout Utilities</h2>
          <p className="text-xl opacity-90">
            This entire page was built using vanilla React, Tailwind classes, and TypeScript - no custom abstractions!
          </p>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mt-4">
            <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-2xl font-bold mb-3"> What You Learned</h3>
              <div className="flex flex-col gap-2 text-sm opacity-90">
                <p>✓ 4 Position utilities (relative, absolute, sticky, fixed)</p>
                <p>✓ Width utilities (w-full, flex-1, w-80, w-fit, w-screen)</p>
                <p>✓ Height utilities (h-full, flex-1, h-80, h-fit, h-screen)</p>
                <p>✓ Layout utilities (flex, grid)</p>
                <p>✓ Direction utilities (flex-row, flex-col)</p>
                <p>✓ Distribution utilities (justify-*)</p>
                <p>✓ Alignment utilities (items-*)</p>
                <p>✓ Wrap utilities (flex-wrap, flex-nowrap)</p>
                <p>✓ Spacing utilities (gap-*, p-*)</p>
                <p className="font-bold text-base mt-2">= Complete Tailwind Layout System</p>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-2xl font-bold mb-3"> The Pattern</h3>
              <div className="flex flex-col gap-2 text-sm opacity-90">
                <p><strong>1. You write:</strong></p>
                <code className="bg-white/20 px-2 py-1 rounded">className=&quot;flex justify-between&quot;</code>
                <p className="mt-2"><strong>2. Tailwind generates:</strong></p>
                <code className="bg-white/20 px-2 py-1 rounded">display: flex; justify-content: space-between;</code>
                <p className="mt-2"><strong>3. Browser renders:</strong></p>
                <code className="bg-white/20 px-2 py-1 rounded">Flexbox with space-between distribution</code>
                <p className="mt-3 font-semibold">Direct Tailwind → Pure CSS → Perfect Layouts</p>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-2xl font-bold mb-3"> Next Steps</h3>
              <div className="flex flex-col gap-2 text-sm opacity-90">
                <p>✓ Use semantic HTML elements</p>
                <p>✓ Apply Tailwind utilities directly</p>
                <p>✓ Combine classes for complex layouts</p>
                <p>✓ Use responsive modifiers (md:, lg:)</p>
                <p>✓ Add Motion for animations</p>
                <p>✓ Build with TypeScript for type safety</p>
                <p className="font-bold text-base mt-3">Build anything with vanilla React + Tailwind!</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl mt-2">
            <h3 className="text-2xl font-bold mb-3"> This Page&apos;s Philosophy</h3>
            <div className="flex flex-col gap-2 opacity-90">
              <p><strong>No custom components:</strong> Just div, section, and standard HTML</p>
              <p><strong>No abstractions:</strong> Direct Tailwind utility classes</p>
              <p><strong>All concepts demonstrated</strong> with real, working examples</p>
              <p><strong>Every example shows exact classes</strong> and the CSS they generate</p>
              <p className="mt-3 text-lg font-semibold">
                This is the vanilla stack approach: pure, simple, and powerful!
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-4 flex-wrap mt-4">
            <button className="px-6 py-3 bg-white/20 border border-white/40 text-white rounded-lg hover:bg-white/30 transition-colors">
              View Tailwind Docs
            </button>
            <button className="px-6 py-3 bg-white/20 border border-white/40 text-white rounded-lg hover:bg-white/30 transition-colors">
              Compare with Frame Version
            </button>
            <button className="px-6 py-3 bg-white/20 border border-white/40 text-white rounded-lg hover:bg-white/30 transition-colors">
              Start Building
            </button>
          </div>
        </motion.section>

        </div>
      </div>
    </>
  )
}
