import { ArrowDown, ArrowUpRight, Factory, Leaf, BarChart3, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PolpaicoHero() {
  return <>
    <header className="border-b border-border bg-background/95 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
        <a href="#polpaico-inicio" className="flex items-center gap-3 min-h-11"><Layers3 className="w-8 h-8 text-ok" /><span className="font-heading font-bold tracking-tight text-xl">polpaico<span className="text-ok font-normal"> OS</span></span></a>
        <nav aria-label="Portal Polpaico" className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground"><a href="#logistica" className="hover:text-foreground">Logística</a><a href="#telemetria" className="hover:text-foreground">Telemetría</a><a href="#calidad" className="hover:text-foreground">Calidad</a><a href="#esg" className="hover:text-foreground">Impacto ESG</a></nav>
        <Link to="/" className="flex gap-2 items-center text-xs text-muted-foreground min-h-11">GoConstruction OS <ArrowUpRight className="w-4 h-4" /></Link>
      </div>
    </header>
    <section id="polpaico-inicio" className="bg-gradient-to-br from-secondary via-primary/20 to-background border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 relative">
        <div className="flex flex-wrap gap-3 items-center mb-8"><span className="border border-ok/30 text-ok bg-primary/30 rounded-full px-3 py-1.5 text-xs tracking-wide">Powered by b2bytes Agent OS</span><span className="font-mono text-[10px] text-muted-foreground tracking-widest">PILOTO ICAFAL · COLINA</span></div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-heading font-semibold tracking-tighter">Polpaico OS<span className="text-ok">.</span></h1>
        <h2 className="text-2xl sm:text-4xl leading-tight tracking-tight mt-6 max-w-3xl">Hormigón como Servicio.<br /><span className="text-ok">No vendemos m³.</span> Vendemos trazabilidad certificada.</h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-6 max-w-xl leading-relaxed">Desde el mixer hasta el desencofrado — cada m³ verificado en tiempo real.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm text-muted-foreground mt-8">{[[Factory, 'Cerro Blanco · Tiltil'], [BarChart3, '2.5M m³/año trazables'], [Leaf, 'HormiPurifica · Photio']].map(([Icon, label]) => <span key={label} className="flex items-center gap-2"><Icon className="w-4 h-4 text-ok" />{label}</span>)}</div>
        <div className="mt-10 flex flex-wrap items-center gap-5"><a href="#logistica" className="inline-flex items-center gap-4 rounded-lg px-6 py-3.5 bg-primary text-primary-foreground font-semibold hover:bg-secondary transition-colors duration-200">Ver demo en vivo <ArrowDown className="w-4 h-4" /></a><span className="text-xs text-muted-foreground flex items-center gap-2"><span className="w-2 h-2 bg-ok rounded-full" />Portal demo · datos de sensores simulados</span></div>
        <p className="text-xs text-muted-foreground mt-7 max-w-2xl leading-relaxed">Piloto demostrativo, no autorización de obra. WhatsApp y ObraLink sin conexión operativa; equivalencias ESG preliminares. Cifras corporativas suministradas para la demo.</p>
      </div>
    </section>
  </>;
}