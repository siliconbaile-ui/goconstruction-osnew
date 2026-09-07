import { motion, useReducedMotion } from 'framer-motion';

export default function PolpaicoSection({ id, number, eyebrow, title, subtitle, children }) {
  const reduce = useReducedMotion();
  return <motion.section id={id} initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.35 }} className="py-10 sm:py-14 border-b border-border">
    <div className="flex items-start gap-4 mb-7">
      <span className="font-mono text-xs text-ok border border-primary rounded px-2.5 py-2 mt-1">{number}</span>
      <div><p className="text-xs uppercase tracking-[0.18em] text-ok mb-2">{eyebrow}</p><h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2><p className="text-muted-foreground mt-2 leading-relaxed max-w-3xl">{subtitle}</p></div>
    </div>
    {children}
  </motion.section>;
}