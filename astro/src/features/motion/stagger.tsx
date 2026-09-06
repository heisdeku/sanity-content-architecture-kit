import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { revealVariants } from './reveal';
import { useReducedMotion } from './use-reduced-motion';

type StaggerProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  gap?: number;
  as?: 'div' | 'ul';
};

/**
 * Staggers direct children into view. Wrap each child in <Stagger.Item>.
 */
export function Stagger({ children, className, gap = 0.08, as = 'div' }: StaggerProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ visible: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Component>
  );
}

function StaggerItem({ children, className, as = 'div' }: Omit<StaggerProps, 'gap'>) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const Component = motion[as];
  return (
    <Component className={className} variants={revealVariants}>
      {children}
    </Component>
  );
}

Stagger.Item = StaggerItem;
