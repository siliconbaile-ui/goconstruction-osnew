import LandingCaso from '@/components/landing/LandingCaso';
import { CASOS } from '@/lib/casosUso';

export default function CasoControlCalidad() {
  return <LandingCaso caso={CASOS['control-calidad']} />;
}