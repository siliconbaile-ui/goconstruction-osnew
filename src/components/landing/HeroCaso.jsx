import { Link } from 'react-router-dom';
import Logo from '@/components/marca/Logo';
import CTACaso from './CTACaso';

export default function HeroCaso({ caso }) {
  return (
    <header className="space-y-5">
      <Link to="/"><Logo /></Link>
      <span className="inline-block font-mono text-[10px] tracking-widest px-2.5 py-1 rounded-full border border-hairline text-primary">
        {caso.etiqueta}
      </span>
      <h1 className="text-2xl sm:text-4xl font-semibold leading-tight text-foreground">{caso.h1}</h1>
      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl">{caso.bajada}</p>
      <CTACaso caso={caso} ubicacion="hero" />
    </header>
  );
}