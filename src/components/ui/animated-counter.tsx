import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number | undefined | null;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const controls = animate(displayValue, value, {
        duration: 0.5,
        ease: "easeOut",
        onUpdate: (value) => setDisplayValue(value),
      });

      return () => controls.stop();
    }
  }, [value, displayValue]);

  return (
    <motion.span className={className}>
      {displayValue.toFixed(0)} credits
    </motion.span>
  );
} 