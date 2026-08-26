import { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useSeo from '@/lib/useSeo';
import { porSlug, ARTICULOS, OG_IMAGEN, jsonLdArticulo } from '@/lib/blogArticulos';
import Logo from '@/components/marca/Logo';
import CuerpoArticulo from '@/components/blog/CuerpoArticulo';
import FaqArticulo from '@/components/blog/FaqArticulo';
import CTAArticulo from '@/components/blog/CTAArticulo';
import ArticuloCard from '@/components/blog/ArticuloCard';
import FooterPublico from '@/components/marca/FooterPublico';

export default function BlogArticulo() {
  const { slug } = useParams();
  const articulo = porSlug(slug);
  const jsonLd = useMemo(() => (articulo ? jsonLdArticulo(articulo) : null), [articulo]);

  useSeo({
    titulo: articulo?.seoTitulo || 'Blog técnico | GoConstruction OS',
    descripcion: articulo?.seoDescripcion || '',
    ruta: `/blog/${slug}`,
    imagen: OG_IMAGEN,
    jsonLd,
  });

  if (!articulo) return <Navigate to="/blog" replace />;

  const otros = ARTICULOS.filter(a => a.slug !== articulo.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14 space-y-7">
        <Link to="/"><Logo /></Link>

        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-3.5 h-3.5" /> VOLVER AL BLOG
        </Link>

        <header className="space-y-2.5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="text-primary">{articulo.categoria.toUpperCase()}</span>
            <span>·</span>
            <span>{articulo.lectura}</span>
            <span>·</span>
            <time dateTime={articulo.fecha}>{articulo.fecha}</time>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{articulo.titulo}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{articulo.resumen}</p>
        </header>

        <CuerpoArticulo secciones={articulo.secciones} />
        <FaqArticulo faq={articulo.faq} />
        <CTAArticulo articulo={articulo} />

        <section className="space-y-3">
          <h2 className="text-sm font-mono tracking-widest text-muted-foreground">SEGUIR LEYENDO</h2>
          {otros.map(a => <ArticuloCard key={a.slug} articulo={a} />)}
        </section>

        <FooterPublico />
      </div>
    </div>
  );
}