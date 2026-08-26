import { Link } from 'react-router-dom';

// Pie público: enlaces institucionales visibles para visitantes y buscadores.
export default function FooterPublico() {
  return (
    <footer className="mt-10 pt-6 border-t border-hairline">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3 text-xs">
        <Link to="/" className="text-muted-foreground hover:text-primary">Inicio</Link>
        <Link to="/blog" className="text-muted-foreground hover:text-primary">Blog técnico</Link>
        <Link to="/nosotros" className="text-muted-foreground hover:text-primary">Nosotros</Link>
        <Link to="/contacto" className="text-muted-foreground hover:text-primary">Contacto</Link>
        <Link to="/demo" className="text-muted-foreground hover:text-primary">Demo</Link>
        <Link to="/privacidad" className="text-muted-foreground hover:text-primary">Privacidad</Link>
        <Link to="/terminos" className="text-muted-foreground hover:text-primary">Términos</Link>
        <Link to="/login" className="text-muted-foreground hover:text-primary">Iniciar sesión</Link>
      </nav>
      <div className="text-[10px] font-mono tracking-widest text-muted-foreground">
        B2BYTES · GOCONSTRUCTION OS · SANTIAGO, CHILE
      </div>
    </footer>
  );
}