'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-9 h-9" />

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent dark:border-gray-700"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                    <motion.div
                        key="moon"
                        initial={{ y: 10, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -10, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-5 h-5" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: 10, opacity: 0, rotate: 90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -10, opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-5 h-5" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    )
}
