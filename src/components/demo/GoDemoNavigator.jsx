import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detenerAudio, reproducirTexto } from '@/lib/hablarTexto';
import GoDemoOverlay from './GoDemoOverlay';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function GoDemoNavigator() {
  const navigate = useNavigate();
  const run = useRef(0);
  const [state, setState] = useState(null);
  const clearVisuals = () => document.querySelectorAll('.go-demo-focus').forEach(el => el.classList.remove('go-demo-focus'));
  const stop = () => {
    run.current += 1;
    detenerAudio();
    clearVisuals();
    setState(null);
    window.dispatchEvent(new Event('go:demo-end'));
  };

  useEffect(() => {
    const start = async event => {
      run.current += 1;
      detenerAudio();
      clearVisuals();
      setState(null);
      window.dispatchEvent(new Event('go:demo-start'));
      const plan = event.detail;
      const token = ++run.current;
      for (let index = 0; index < plan.steps.length; index += 1) {
        if (token !== run.current) return;
        const step = plan.steps[index];
        navigate(step.route);
        setState({ plan, index, speaking: false });
        await wait(850);
        const target = step.target ? document.querySelector(`[data-go-demo="${step.target}"]`) : null;
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.add('go-demo-focus'); }
        setState({ plan, index, speaking: true });
        await reproducirTexto(step.narration, null, plan.voice || 'honey');
        if (token !== run.current) return;
        if (target && step.interaction === 'click') {
          target.classList.add('go-demo-press');
          if (target.dataset.goDemoAction === 'read') target.click();
          await wait(350);
          target.classList.remove('go-demo-press');
        }
        await wait(step.hold_ms || 1200);
        target?.classList.remove('go-demo-focus');
      }
      if (token === run.current) {
        setState(null);
        window.dispatchEvent(new Event('go:demo-end'));
      }
    };
    window.addEventListener('go:demo-plan', start);
    return () => { window.removeEventListener('go:demo-plan', start); stop(); };
  }, [navigate]);

  return state ? <GoDemoOverlay {...state} onStop={stop} /> : null;
}