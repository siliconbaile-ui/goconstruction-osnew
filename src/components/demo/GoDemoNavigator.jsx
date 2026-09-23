import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { detenerAudio, reproducirTexto } from '@/lib/hablarTexto';
import { startGoMasterDemo } from '@/lib/goMasterDemo';
import GoDemoOverlay from './GoDemoOverlay';
import GoDemoWelcome from './GoDemoWelcome';

const COMPLETED_KEY = 'go-demo-completed';
const DISMISSED_KEY = 'go-demo-dismissed';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function GoDemoNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const run = useRef(0);
  const goToStepRef = useRef(null);
  const [state, setState] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const clearVisuals = () => document.querySelectorAll('.go-demo-focus').forEach(el => el.classList.remove('go-demo-focus'));

  const stop = useCallback(() => {
    run.current += 1;
    detenerAudio();
    clearVisuals();
    setState(null);
    window.dispatchEvent(new Event('go:demo-end'));
  }, []);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(COMPLETED_KEY, '1'); } catch {}
    stop();
  }, [stop]);

  const goToStep = useCallback((plan, index) => {
    if (index < 0 || index >= plan.steps.length) return;
    run.current += 1;
    detenerAudio();
    clearVisuals();
    const token = run.current;

    (async () => {
      const step = plan.steps[index];
      navigate(step.route);
      setState({ plan, index, speaking: false, finished: false });
      await wait(850);
      if (token !== run.current) return;

      const target = step.target ? document.querySelector(`[data-go-demo="${step.target}"]`) : null;
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.add('go-demo-focus'); }
      setState({ plan, index, speaking: true, finished: false });

      // Narración con timeout de respaldo: si la síntesis falla o se cuelga,
      // el demo avanza igual en lugar de quedarse atrapado.
      const narrationPromise = reproducirTexto(step.narration, null, plan.voice || 'honey');
      const timeoutMs = Math.max(10000, step.narration.length * 100);
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, timeoutMs));
      await Promise.race([narrationPromise, timeoutPromise]);
      if (token !== run.current) return;

      if (target && step.interaction === 'click') {
        target.classList.add('go-demo-press');
        if (target.dataset.goDemoAction === 'read') target.click();
        await wait(350);
        target.classList.remove('go-demo-press');
      }
      await wait(step.hold_ms || 1200);
      target?.classList.remove('go-demo-focus');
      if (token !== run.current) return;

      if (index + 1 < plan.steps.length) {
        goToStepRef.current?.(plan, index + 1);
      } else {
        try { localStorage.setItem(COMPLETED_KEY, '1'); } catch {}
        setState({ plan, index, speaking: false, finished: true });
        window.dispatchEvent(new Event('go:demo-end'));
      }
    })();
  }, [navigate]);

  useEffect(() => {
    goToStepRef.current = goToStep;
  }, [goToStep]);

  const next = useCallback(() => {
    if (!state || state.finished) return;
    const nextIndex = state.index + 1;
    if (nextIndex >= state.plan.steps.length) {
      try { localStorage.setItem(COMPLETED_KEY, '1'); } catch {}
      run.current += 1;
      detenerAudio();
      clearVisuals();
      setState({ ...state, speaking: false, finished: true });
      window.dispatchEvent(new Event('go:demo-end'));
      return;
    }
    goToStepRef.current?.(state.plan, nextIndex);
  }, [state]);

  const prev = useCallback(() => {
    if (!state || state.index <= 0) return;
    goToStepRef.current?.(state.plan, state.index - 1);
  }, [state]);

  useEffect(() => {
    const start = (event) => {
      const plan = event.detail;
      goToStepRef.current?.(plan, 0);
    };
    window.addEventListener('go:demo-plan', start);
    return () => { window.removeEventListener('go:demo-plan', start); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modal de bienvenida al entrar por primera vez a /app
  useEffect(() => {
    if (location.pathname !== '/app') return;
    const justRegistered = sessionStorage.getItem('go-just-registered') === '1';
    if (justRegistered) {
      setShowWelcome(true);
      return;
    }
    try {
      const completed = localStorage.getItem(COMPLETED_KEY);
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!completed && !dismissed) {
        const timer = setTimeout(() => setShowWelcome(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [location.pathname]);

  const startDemo = () => {
    setShowWelcome(false);
    sessionStorage.removeItem('go-just-registered');
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch {}
    startGoMasterDemo();
  };

  const skipWelcome = () => {
    setShowWelcome(false);
    sessionStorage.removeItem('go-just-registered');
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch {}
    window.dispatchEvent(new Event('go:welcome-dismissed'));
  };

  return (
    <>
      {showWelcome && !state && <GoDemoWelcome onStart={startDemo} onSkip={skipWelcome} />}
      {state && <GoDemoOverlay {...state} onStop={stop} onNext={next} onPrev={prev} onDismiss={dismiss} />}
    </>
  );
}