import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from './use-reduced-motion';

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'span' | 'li';
};

/**
 * Fades and lifts children into view once. Mount it as a `client:visible`
 * island; reduced motion renders children without animation.
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={revealVariants}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
