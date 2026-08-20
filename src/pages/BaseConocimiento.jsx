import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Upload, Loader2, Database } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import DocumentoCard from '@/components/conocimiento/DocumentoCard';
import ConsultaTecnica from '@/components/conocimiento/ConsultaTecnica';

const TIPOS = ['plano', 'eett', 'normativa', 'contrato', 'protocolo', 'presupuesto', 'otro'];
const ESPECIALIDADES = ['arquitectura', 'estructura', 'sanitario', 'electrico', 'clima', 'obra_civil', 'general'];

export default function BaseConocimiento() {
  const [docs, setDocs] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [tipo, setTipo] = useState('eett');
  const [especialidad, setEspecialidad] = useState('general');
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [dList, pvs] = await Promise.all([
        base44.entities.DocumentoTecnico.list('-created_date', 100),
        base44.entities.ProyectoObra.list('-created_date', 10),
      ]);
      setDocs(dList);
      setProyectos(pvs);
      if (pvs[0]) setProyectoId(pvs[0].id);
      setLoading(false);
    })();
  }, []);

  const indexar = async (doc) => {
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, estado_indexacion: 'indexando' } : d));
    await base44.entities.DocumentoTecnico.update(doc.id, { estado_indexacion: 'indexando' });
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres el motor de ingesta documental de GoConstruction OS. Analiza este documento técnico de obra ("${doc.titulo}", tipo ${doc.tipo}, especialidad ${doc.especialidad}) y devuelve su índice navegable.

Entrega:
- resumen: 2 líneas sobre qué contiene y para qué sirve en terreno.
- paginas_totales: número de páginas del documento.
- indice: lista de secciones relevantes con la PÁGINA EXACTA de cada una y las palabras clave técnicas que contiene (partidas, materiales, dosificaciones, diámetros, recubrimientos, normas citadas). Este índice se usará después para ubicar respuestas, así que sé exhaustivo en las palabras clave.`,
        file_urls: [doc.file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            resumen: { type: 'string' },
            paginas_totales: { type: 'number' },
            indice: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  seccion: { type: 'string' },
                  pagina: { type: 'string' },
                  palabras_clave: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      });
      const patch = {
        estado_indexacion: 'indexado',
        resumen: result.resumen,
        paginas_totales: result.paginas_totales,
        indice_contenido: JSON.stringify(result.indice || []),
      };
      await base44.entities.DocumentoTecnico.update(doc.id, patch);
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, ...patch } : d));
    } catch {
      await base44.entities.DocumentoTecnico.update(doc.id, { estado_indexacion: 'error' });
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, estado_indexacion: 'error' } : d));
    }
  };

  const subir = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSubiendo(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const doc = await base44.entities.DocumentoTecnico.create({
          proyecto_id: proyectoId,
          titulo: file.name.replace(/\.[^.]+$/, ''),
          nombre_archivo: file.name,
          tipo,
          especialidad,
          file_url,
          estado_indexacion: 'pendiente',
        });
        setDocs(prev => [doc, ...prev]);
        indexar(doc);
      }
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  const eliminar = async (id) => {
    await base44.entities.DocumentoTecnico.delete(id);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const visibles = proyectoId ? docs.filter(d => !d.proyecto_id || d.proyecto_id === proyectoId) : docs;
  const indexados = visibles.filter(d => d.estado_indexacion === 'indexado').length;
  const paginas = visibles.reduce((s, d) => s + (d.paginas_totales || 0), 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO 2 · MOTOR RAG Y VERIFICACIÓN</div>
        <h1 className="text-xl font-bold text-white">Base de Conocimiento Técnico</h1>
        <p className="text-sm mt-1" style={{ color: '#4A6FA5' }}>
          Planos, EETT y normativas indexadas. Toda respuesta cita la página exacta del documento original.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'DOCUMENTOS', value: visibles.length, color: '#4A6FA5', icon: BookOpen },
          { label: 'INDEXADOS', value: indexados, color: indexados === visibles.length && visibles.length > 0 ? '#27AE60' : '#F39C12', icon: Database },
          { label: 'PÁGINAS INDEXADAS', value: paginas, color: '#5B8DEF', icon: BookOpen },
        ].map(s => (
          <OrionCard key={s.label} className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#4A6FA5' }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </OrionCard>
        ))}
      </div>

      <ConsultaTecnica proyectoId={proyectoId} />

      <OrionCard className="p-5">
        <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>INGESTA DE DOCUMENTOS TÉCNICOS</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Obra</label>
            <select value={proyectoId} onChange={e => setProyectoId(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
              <option value="">Todas</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Especialidad</label>
            <select value={especialidad} onChange={e => setEspecialidad(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
              {ESPECIALIDADES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={subir} accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv,.html" />
        <button onClick={() => fileRef.current?.click()} disabled={subiendo}
          className="w-full py-6 rounded flex flex-col items-center gap-2 disabled:opacity-50"
          style={{ background: '#0A1628', border: '1px dashed #1E2D4A' }}>
          {subiendo
            ? <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#003399' }} />
            : <Upload className="w-6 h-6" style={{ color: '#4A6FA5' }} />}
          <span className="font-mono text-xs" style={{ color: '#4A6FA5' }}>
            {subiendo ? 'SUBIENDO E INDEXANDO...' : 'SUBIR PLANOS, EETT, NORMATIVAS O PROTOCOLOS'}
          </span>
        </button>
      </OrionCard>

      <div className="space-y-3">
        {loading ? (
          <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO BASE DE CONOCIMIENTO...</OrionCard>
        ) : visibles.length === 0 ? (
          <OrionCard className="p-8 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-slate-500 font-mono text-xs">SIN DOCUMENTOS INDEXADOS</p>
          </OrionCard>
        ) : (
          visibles.map(d => <DocumentoCard key={d.id} doc={d} onDelete={eliminar} onReindexar={indexar} />)
        )}
      </div>
    </div>
  );
}