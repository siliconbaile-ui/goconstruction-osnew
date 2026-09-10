import { useEffect, useRef } from 'react';

export default function useGoDemoPlan(messages) {
  const seen = useRef(new Set());
  useEffect(() => {
    for (const message of messages) {
      for (const call of message.tool_calls || []) {
        if (call.name !== 'crearRecorridoGO' || !['success', 'completed'].includes(call.status)) continue;
        const key = call.id || `${message.id}-${call.arguments_string}`;
        if (seen.current.has(key)) continue;
        try {
          const result = typeof call.results === 'string' ? JSON.parse(call.results) : call.results;
          const plan = result?.plan || result?.data?.plan;
          if (!plan?.steps?.length) continue;
          seen.current.add(key);
          window.dispatchEvent(new CustomEvent('go:demo-plan', { detail: plan }));
        } catch { /* El estado de la herramienta ya muestra el error. */ }
      }
    }
  }, [messages]);
}