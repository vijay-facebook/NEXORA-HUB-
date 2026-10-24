import React, { ReactNode } from 'react';
import { motion, useScroll, useSpring, HTMLMotionProps, Variants } from 'framer-motion';

// ==========================================
// 1. SCROLL PROGRESS BAR
// ==========================================
export function ScrollProgressBar({ className = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 z-50 origin-left ${className}`}
      style={{ scaleX }}
    />
  );
}

// ==========================================
// 2. SCROLL REVEAL WRAPPER
// ==========================================
interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance = 30,
  once = true,
  threshold = 0.15,
  className = '',
  ...props
}: ScrollRevealProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialOffset = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// 3. ENTRANCE ANIMATION (On Load / Mount)
// ==========================================
interface EntranceProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export function Entrance({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  distance = 20,
  className = '',
  ...props
}: EntranceProps) {
  const getInitial = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: distance };
      case 'down': return { opacity: 0, y: -distance };
      case 'left': return { opacity: 0, x: distance };
      case 'right': return { opacity: 0, x: -distance };
      case 'none':
      default: return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// 4. STAGGER CONTAINER & ITEMS
// ==========================================
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  viewportOnce?: boolean;
}

const staggerVariants = (staggerDelay: number, delayChildren: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    }
  }
});

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className = '',
  viewportOnce = true,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerVariants(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, amount: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.21, 0.47, 0.32, 0.98]
    }
  }
};

export function StaggerItem({
  children,
  className = '',
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// ==========================================
// 5. HOVER & INTERACTIVE CARD
// ==========================================
interface HoverCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hoverY?: number;
  hoverScale?: number;
  className?: string;
}

export function HoverCard({
  children,
  hoverY = -4,
  hoverScale = 1.01,
  className = '',
  ...props
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: hoverY, scale: hoverScale }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// 6. PAGE VIEW TRANSITION
// ==========================================
interface PageTransitionProps {
  children: ReactNode;
  viewKey: string;
  key?: string;
  className?: string;
}

export function PageTransition({ children, viewKey, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
