import LandingCaso from '@/components/landing/LandingCaso';
import { CASOS } from '@/lib/casosUso';

export default function CasoRdiAutomaticos() {
  return <LandingCaso caso={CASOS['rdi-automaticos']} />;
}