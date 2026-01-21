'use client'

import { motion } from 'framer-motion'

interface AnimatedListProps {
    children: React.ReactNode
    className?: string
}

export function AnimatedList({ children, className }: AnimatedListProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedItem({ children, className }: { children: React.ReactNode, className?: string }) {
    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <motion.div variants={item} className={className}>
            {children}
        </motion.div>
    )
}
