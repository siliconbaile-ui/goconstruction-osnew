import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { prioridadColor, formatFecha } from '@/lib/orionUtils';

const COLUMNAS = [
  { id: 'pendiente', titulo: 'PENDIENTE', estados: ['abierto', 'vencido'], drop: 'abierto', color: '#F39C12' },
  { id: 'en_progreso', titulo: 'EN PROGRESO', estados: ['en_revision'], drop: 'en_revision', color: '#5B8DEF' },
  { id: 'resuelto', titulo: 'RESUELTO', estados: ['respondido', 'cerrado'], drop: 'respondido', color: '#27AE60' },
];

export default function RDIKanban({ rdis, partidas, onMove }) {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const col = COLUMNAS.find(c => c.id === result.destination.droppableId);
    const rdi = rdis.find(r => r.id === result.draggableId);
    if (!col || !rdi || col.estados.includes(rdi.estado)) return;
    onMove(result.draggableId, col.drop);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {COLUMNAS.map(col => {
          const items = rdis.filter(r => col.estados.includes(r.estado));
          return (
            <div key={col.id} className="rounded-lg" style={{ background: '#0A1120', border: '1px solid #1E2D4A' }}>
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid #1E2D4A' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="font-mono text-[11px] tracking-wider text-white">{col.titulo}</span>
                <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#0D1526', color: '#4A6FA5', border: '1px solid #1E2D4A' }}>
                  {items.length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-2 space-y-2 min-h-[140px] transition-colors rounded-b-lg"
                    style={snapshot.isDraggingOver ? { background: 'rgba(0,51,153,0.08)' } : {}}
                  >
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-8 font-mono text-[10px]" style={{ color: '#2D4A6E' }}>
                        ARRASTRA UNA TARJETA AQUÍ
                      </div>
                    )}
                    {items.map((rdi, index) => {
                      const partida = partidas.find(p => p.id === rdi.partida_id);
                      return (
                        <Draggable key={rdi.id} draggableId={rdi.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className="rounded-lg p-3"
                              style={{
                                background: '#0D1526',
                                border: `1px solid ${snap.isDragging ? '#003399' : '#1E2D4A'}`,
                                boxShadow: snap.isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
                                ...prov.draggableProps.style,
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <GripVertical className="w-3 h-3 flex-shrink-0" style={{ color: '#2D4A6E' }} />
                                <span className="font-mono text-[11px] font-bold text-white">{rdi.numero_rdi || '—'}</span>
                                <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono border ${prioridadColor(rdi.prioridad)}`}>
                                  {rdi.prioridad?.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-xs font-medium text-white leading-snug mb-1.5">{rdi.titulo}</div>
                              <div className="space-y-0.5 font-mono text-[10px]" style={{ color: '#4A6FA5' }}>
                                {partida && <div className="truncate">◆ {partida.nombre}</div>}
                                {rdi.especialista_asignado
                                  ? <div>→ {rdi.especialista_asignado}</div>
                                  : <div className="text-amber-400">⚠ Sin asignar</div>}
                                {rdi.fecha_vencimiento && <div>Vence: {formatFecha(rdi.fecha_vencimiento)}</div>}
                              </div>
                              {rdi.estado === 'vencido' && (
                                <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono border bg-orange-600/10 text-orange-400 border-orange-500/30">VENCIDO</span>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}