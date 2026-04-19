import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  /** `load` starts on mount; `view` starts when the element enters the viewport. */
  trigger?: 'load' | 'view';
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Duration of the reveal, in seconds. */
  duration?: number;
  /** How far to translate up during the reveal. */
  y?: number | string;
  /** Starting scale (for a subtle zoom-in effect). */
  scale?: number;
  as?: 'div' | 'section' | 'span' | 'li' | 'header' | 'footer' | 'p';
  className?: string;
  style?: HTMLMotionProps<'div'>['style'];
};

/**
 * Simple fade + slide-up reveal wrapper. Honours prefers-reduced-motion.
 */
export function Reveal({
  children,
  trigger = 'view',
  delay = 0,
  duration = 0.7,
  y = 24,
  scale = 1,
  as = 'div',
  className,
  style,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return (
      <Tag className={className} style={style as React.CSSProperties | undefined}>
        {children}
      </Tag>
    );
  }

  const transition = { duration, delay, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y, scale }}
      {...(trigger === 'view'
        ? { whileInView: { opacity: 1, y: 0, scale: 1 }, viewport: { once: true, amount: 0.2 } }
        : { animate: { opacity: 1, y: 0, scale: 1 } })}
      transition={transition}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Container that staggers its child `<Reveal>` or motion elements.
 */
export function RevealStagger({
  children,
  trigger = 'view',
  delay = 0,
  stagger = 0.08,
  as = 'div',
  className,
}: {
  children: ReactNode;
  trigger?: 'load' | 'view';
  delay?: number;
  stagger?: number;
  as?: 'div' | 'section' | 'span' | 'li' | 'ul' | 'ol';
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...(trigger === 'view'
        ? { whileInView: 'show', viewport: { once: true, amount: 0.2 } }
        : { animate: 'show' })}
      variants={{ hidden: {}, show: {} }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Variant preset for a child inside `<RevealStagger>`. */
export const revealItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
} as const;
