import { Check } from 'lucide-react';

// Cuerpo del artículo: h2 por sección y listas cuando el contenido es enumerable.
export default function CuerpoArticulo({ secciones }) {
  return (
    <div className="space-y-7">
      {secciones.map(s => (
        <section key={s.h} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground leading-snug">{s.h}</h2>
          {s.parrafos.map(p => (
            <p key={p} className="text-sm leading-relaxed text-foreground/85">{p}</p>
          ))}
          {s.lista && (
            <ul className="space-y-2 pt-1">
              {s.lista.map(li => (
                <li key={li} className="flex gap-2.5 text-sm text-foreground/85">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}