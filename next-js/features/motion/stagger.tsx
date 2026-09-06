"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

type StaggerProps = { children: ReactNode; className?: string };

/**
 * Compound component: `<Stagger>` reveals each `<Stagger.Item>` in sequence.
 * Under reduced motion both render plain elements.
 */
export function Stagger({ children, className }: StaggerProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className }: StaggerProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

Stagger.Item = StaggerItem;
