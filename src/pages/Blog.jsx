import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSeo from '@/lib/useSeo';
import { ARTICULOS, OG_IMAGEN } from '@/lib/blogArticulos';
import Logo from '@/components/marca/Logo';
import ArticuloCard from '@/components/blog/ArticuloCard';
import FooterPublico from '@/components/marca/FooterPublico';

// Índice del blog técnico: normativa chilena y procedimientos de obra.
export default function Blog() {
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog técnico GoConstruction OS',
    description: 'Normativa chilena de construcción y procedimientos de obra explicados para oficina técnica y terreno.',
    url: 'https://gobim.lat/blog',
    inLanguage: 'es-CL',
    blogPost: ARTICULOS.map(a => ({
      '@type': 'BlogPosting',
      headline: a.titulo,
      datePublished: a.fecha,
      url: `https://gobim.lat/blog/${a.slug}`,
    })),
  }), []);

  useSeo({
    titulo: 'Blog técnico de obra: NCh 430, RDIs, estados de pago y calidad | GoConstruction OS',
    descripcion: 'Artículos técnicos para constructoras en Chile: exigencias de la NCh 430, cómo redactar RDIs, retención de estados de pago por calidad y registro de inspecciones en terreno.',
    ruta: '/blog',
    imagen: OG_IMAGEN,
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14 space-y-7">
        <Link to="/"><Logo /></Link>

        <header className="space-y-2">
          <p className="text-[10px] font-mono tracking-widest text-primary">BLOG TÉCNICO · CHILE</p>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
            Normativa y procedimientos de obra, explicados para quien firma
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Criterio técnico aplicable en terreno: qué exige la norma chilena, cómo se verifica antes de hormigonar,
            cómo se redacta un RDI que se responde y cuándo corresponde retener un estado de pago.
          </p>
        </header>

        <div className="space-y-3">
          {ARTICULOS.map(a => <ArticuloCard key={a.slug} articulo={a} />)}
        </div>

        <FooterPublico />
      </div>
    </div>
  );
}