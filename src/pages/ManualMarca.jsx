import { HardHat, Palette, MessageSquare, Ruler, Volume2, ShieldCheck } from 'lucide-react';
import useTemaMarca from '@/hooks/useTemaMarca';
import BloqueManual from '@/components/marca/BloqueManual';
import TemaCard from '@/components/marca/TemaCard';
import ChatPreview from '@/components/marca/ChatPreview';
import TokensGrid from '@/components/marca/TokensGrid';

const PRINCIPIOS = [
  { icon: MessageSquare, t: 'La conversación es la interfaz', d: 'El menú es un atajo, no el producto. Todo lo que el OS sabe hacer debe poder pedirse hablando.' },
  { icon: ShieldCheck, t: 'Ningún dato sin respaldo', d: 'Cifra, norma o página: si no se puede verificar, no se muestra. La duda se dice, no se rellena.' },
  { icon: Ruler, t: 'Terreno primero', d: 'Se diseña para un teléfono, con guantes, a pleno sol y con una mano. El escritorio hereda del móvil.' },
  { icon: Volume2, t: 'Tono de colega, no de bot', d: 'Técnico, directo, chileno. Sin cortesías de relleno ni disculpas: el criterio se afirma.' },
];

const VOZ = [
  { si: '“3 partidas en rojo retienen USD 45.000.”', no: '“¡Claro! Con gusto te ayudo a revisar…”' },
  { si: '“Recubrimiento 4 cm — EETT Estructura, p. 27.”', no: '“Normalmente se usan unos 4 cm aprox.”' },
  { si: '“No lo sé, consulte al ingeniero.”', no: '“Podría ser alrededor de 3 o 5 cm.”' },
  { si: '“Listo: NC-0032 abierta, EDP bloqueado.”', no: '“He procedido a realizar la acción solicitada.”' },
];

export default function ManualMarca() {
  const { temaId, aplicar, temas } = useTemaMarca();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Portada */}
      <header>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary">
            <HardHat className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide text-foreground">GoConstruction <span className="text-primary">OS</span></div>
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground">MANUAL DE MARCA · v1.0 · 2026/27</div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-foreground">
          No es un dashboard con chat.<br />
          <span className="text-primary">Es una obra que se opera conversando.</span>
        </h1>
        <p className="text-sm sm:text-base leading-relaxed mt-4 max-w-2xl text-muted-foreground">
          Este manual define cómo se ve, cómo suena y cómo se comporta GoConstruction OS y su agente GO.
          Una sola página, seis temas completos y aplicables en vivo: elige uno y el OS entero se repinta.
        </p>
      </header>

      {/* 01 Principios */}
      <BloqueManual numero="01" titulo="Principios de marca" bajada="Cuatro reglas que resuelven cualquier decisión de diseño o de copy que este manual no alcance a cubrir.">
        <div className="grid gap-3 sm:grid-cols-2">
          {PRINCIPIOS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-surface-raised">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm font-semibold mb-1 text-foreground">{t}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </BloqueManual>

      {/* 02 Temas */}
      <BloqueManual numero="02" titulo="Seis temas del sistema"
        bajada="Lectura cromática 2026/27 para software de construcción: oscuro como línea base y no como variante, superficies estratificadas en vez de bordes duros, un único color de marca saturado reservado a la voz del agente y a la acción, y dos temas claros de alto contraste para el sol de terreno y el documento firmado. Toca APLICAR y el cambio recorre todas las pantallas al instante.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {temas.map(t => (
            <TemaCard key={t.id} tema={t} activo={temaId === t.id} onAplicar={aplicar} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl text-xs bg-surface border border-hairline text-muted-foreground">
          <Palette className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
          El tema queda guardado en el dispositivo: terreno puede trabajar en Cal Terracota mientras la sala de control queda en Faena Nocturna.
        </div>
      </BloqueManual>

      {/* 03 Color y tokens */}
      <BloqueManual numero="03" titulo="Color, superficies y señal" bajada="El color no decora: clasifica. La marca marca la acción; el semáforo marca el riesgo; todo lo demás es superficie.">
        <TokensGrid />
      </BloqueManual>

      {/* 04 Anatomía conversacional */}
      <BloqueManual numero="04" titulo="Anatomía nativa agéntica"
        bajada="La unidad de interfaz del OS no es la tarjeta: es el turno de conversación. Pregunta, respuesta con cita verificada, evidencia del trabajo que hizo el agente y acciones que continúan la tarea sin salir del hilo.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChatPreview />
          <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline space-y-4">
            {[
              { t: 'Turno del usuario', d: 'Burbuja en color de marca, alineada a la derecha. Acepta voz, texto y archivos por igual: el modo lo elige el terreno, no la interfaz.' },
              { t: 'Respuesta de GO', d: 'Máximo 5 líneas más una tabla. El dato clave en negrita en la primera línea. La cita con documento y página va en mono.' },
              { t: 'Trabajo visible', d: 'Cada herramienta ejecutada se muestra como una tira colapsada con su estado. El agente nunca opera a oscuras.' },
              { t: 'Continuidad', d: 'Cierra con una acción o una pregunta concreta. La conversación siempre deja un siguiente paso disponible.' },
            ].map(x => (
              <div key={x.t} className="pb-4 border-b border-hairline last:border-0 last:pb-0">
                <div className="text-sm font-semibold mb-1 text-foreground">{x.t}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </BloqueManual>

      {/* 05 Voz */}
      <BloqueManual numero="05" titulo="Voz y tono de GO" bajada="GO es arquitecto chileno con veinte años de terreno. Habla como se habla en obra: primero el dato, después el contexto, nunca el relleno. En audio, voz masculina de ~42 años, pausada y técnica.">
        <div className="rounded-2xl overflow-hidden bg-surface border border-hairline">
          <div className="grid grid-cols-2 text-[10px] font-mono tracking-widest border-b border-hairline">
            <div className="px-4 py-2.5" style={{ color: 'hsl(var(--ok))' }}>ASÍ SÍ</div>
            <div className="px-4 py-2.5 border-l border-hairline" style={{ color: 'hsl(var(--danger))' }}>ASÍ NO</div>
          </div>
          {VOZ.map(v => (
            <div key={v.si} className="grid grid-cols-2 text-xs border-b border-hairline last:border-0">
              <div className="px-4 py-3 leading-relaxed text-foreground">{v.si}</div>
              <div className="px-4 py-3 leading-relaxed border-l border-hairline text-muted-foreground line-through decoration-1">{v.no}</div>
            </div>
          ))}
        </div>
      </BloqueManual>

      {/* 06 Aplicación */}
      <BloqueManual numero="06" titulo="Reglas de aplicación" bajada="Lo que hace que la marca sobreviva al día 200 de obra.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: 'Una acción principal', d: 'Un solo botón en color de marca por vista. Si hay dos, ninguno es principal.' },
            { t: 'Objetivo táctil 44 px', d: 'Toda zona tocable mide al menos 44 px de alto. Se opera con guantes.' },
            { t: 'Contraste de terreno', d: 'Texto de cuerpo sobre superficie siempre por encima de 4.5:1, en los seis temas.' },
            { t: 'Radios y respiración', d: 'Radio 0.625 rem base, 1 rem en paneles, pleno redondeo en píldoras. Nada cuadrado.' },
            { t: 'Movimiento funcional', d: 'Animación solo para confirmar estado o transición. Nada decorativo, nada sobre 200 ms.' },
            { t: 'Sin hex sueltos', d: 'Todo color pasa por token. Un hex en el código es un bug de marca.' },
          ].map(x => (
            <div key={x.t} className="rounded-xl p-4 bg-surface border border-hairline">
              <div className="text-xs font-semibold mb-1 text-foreground">{x.t}</div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </BloqueManual>

      <footer className="pt-6 border-t border-hairline">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground">
          B2BYTES · GOCONSTRUCTION OS · MANUAL DE MARCA · TEMA ACTIVO: {temaId.replace(/_/g, ' ').toUpperCase()}
        </div>
      </footer>
    </div>
  );
}