import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import LogisticaPolpaico from '@/components/polpaico/LogisticaPolpaico';
import TelemetriaPolpaico from '@/components/polpaico/TelemetriaPolpaico';
import CalidadPolpaico from '@/components/polpaico/CalidadPolpaico';
import ESGPolpaico from '@/components/polpaico/ESGPolpaico';
import InformePolpaico from '@/components/polpaico/InformePolpaico';
import ComandoPolpaico from '@/components/polpaico/ComandoPolpaico';
import PolpaicoReviewHistory from '@/components/polpaico/PolpaicoReviewHistory';
const views={resumen:InformePolpaico,logistica:LogisticaPolpaico,telemetria:TelemetriaPolpaico,calidad:CalidadPolpaico,esg:ESGPolpaico,informe:InformePolpaico,comando:ComandoPolpaico};
export default function PolpaicoDetail({ open,onOpenChange,view,data }) {
  const Section=views[view]||InformePolpaico;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="polpaico-portal bg-background text-foreground max-w-6xl w-[95vw] max-h-[90dvh] overflow-y-auto border-border"><DialogHeader><DialogTitle>Polpaico OS · Registros del piloto</DialogTitle><DialogDescription>Consulta detallada de demostración. Cierra para continuar conversando con GO.</DialogDescription></DialogHeader>{data&&<><Section data={data}/>{view==='comando'&&<PolpaicoReviewHistory/>}</>}</DialogContent></Dialog>;
}