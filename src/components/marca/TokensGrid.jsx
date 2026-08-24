const SUPERFICIES = [
  { token: 'surface-0', uso: 'Lienzo del OS. Nunca lleva contenido directo.', clase: 'bg-surface-base' },
  { token: 'surface-1', uso: 'Panel, tarjeta, burbuja de GO, header.', clase: 'bg-surface' },
  { token: 'surface-2', uso: 'Elevación interna: KPI, chip, tool call.', clase: 'bg-surface-raised' },
  { token: 'primary', uso: 'Voz del agente y única acción principal por vista.', clase: 'bg-primary' },
];

const SENALES = [
  { token: 'ok', label: '🟢 En control', uso: 'Desviación ≤ 0%. EDP liberado. NC cerrada.' },
  { token: 'warn', label: '🟡 En observación', uso: 'Desviación 0–5%. RDI por vencer.' },
  { token: 'danger', label: '🔴 Crítico', uso: 'Desviación > 5%. NC crítica. Pago bloqueado.' },
  { token: 'info', label: 'ℹ️ Informativo', uso: 'Dato de contexto, sin acción requerida.' },
];

export default function TokensGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Superficies */}
      <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
        <div className="text-[10px] font-mono tracking-widest mb-3 text-primary">SUPERFICIES · JERARQUÍA</div>
        <div className="space-y-2">
          {SUPERFICIES.map(s => (
            <div key={s.token} className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-lg flex-shrink-0 border border-hairline ${s.clase}`} />
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-foreground">--{s.token}</div>
                <div className="text-[11px] leading-snug text-muted-foreground">{s.uso}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed mt-4 pt-3 border-t border-hairline text-muted-foreground">
          Regla dura: jamás un hex en el código. Todo color entra por token, y por eso los seis temas se
          aplican al OS completo sin reescribir una sola pantalla.
        </p>
      </div>

      {/* Semáforo + tipografía */}
      <div className="space-y-4">
        <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
          <div className="text-[10px] font-mono tracking-widest mb-3 text-primary">SEMÁFORO OPERACIONAL</div>
          <div className="space-y-2">
            {SENALES.map(s => (
              <div key={s.token} className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: `hsl(var(--${s.token}))` }} />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground">{s.label}</div>
                  <div className="text-[11px] leading-snug text-muted-foreground">{s.uso}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
          <div className="text-[10px] font-mono tracking-widest mb-3 text-primary">TIPOGRAFÍA</div>
          <div className="text-2xl font-semibold tracking-tight leading-tight text-foreground">Inter · titulares</div>
          <p className="text-sm leading-relaxed mt-1 text-muted-foreground">
            Inter para todo el discurso: 400 en cuerpo, 500–600 en jerarquía. Tracking cerrado en titulares.
          </p>
          <div className="font-mono text-xs mt-3 px-3 py-2 rounded-lg bg-surface-raised text-foreground">
            IBM Plex Mono · 4 cm · NCh 170 · p. 27
          </div>
          <p className="text-[11px] leading-relaxed mt-2 text-muted-foreground">
            La mono es obligatoria en cifras, códigos normativos, correlativos y citas: es la marca de que el
            dato es verificable, no una opinión.
          </p>
        </div>
      </div>
    </div>
  );
}