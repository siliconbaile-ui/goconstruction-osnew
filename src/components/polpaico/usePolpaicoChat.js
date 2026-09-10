import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
export default function usePolpaicoChat(onActivity) {
  const [messages,setMessages]=useState([]), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const conv=useRef(null), unsubscribe=useRef(null), lock=useRef(false), mounted=useRef(true), generation=useRef(0), activity=useRef(onActivity), seen=useRef(new Set());
  activity.current=onActivity;
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;unsubscribe.current?.();};},[]);
  const receive=data=>{if(!mounted.current)return;const rows=data.messages||[];setMessages(rows);for(const m of rows){for(const t of m.tool_calls||[]){const key=t.id||`${m.id}:${t.name}:${t.arguments_string}`;if(['completed','success'].includes(t.status)&&!seen.current.has(key)){seen.current.add(key);activity.current?.();}}}};
  const send=async(text,files=[])=>{
    if(lock.current||(!text.trim()&&!files.length))return false;
    lock.current=true;setBusy(true);setError('');const current=generation.current;
    try {
      if(!conv.current){const c=await base44.agents.createConversation({agent_name:'polpaico_go',metadata:{name:'Polpaico · Soluciones y operación'}});if(!mounted.current||generation.current!==current)return false;conv.current=c;unsubscribe.current=base44.agents.subscribeToConversation(c.id,receive);}
      const c=await base44.agents.getConversation(conv.current.id);
      const msg={role:'user',content:text,...(files.length?{file_urls:files}:{})};
      setMessages(prev=>[...prev,{...msg,id:`local-${Date.now()}`}]);
      await base44.agents.addMessage(c,msg);
      if(mounted.current&&generation.current===current){const fresh=await base44.agents.getConversation(c.id);receive(fresh);activity.current?.();}
      return true;
    }catch(err){if(mounted.current){setError(err.response?.data?.message||err.message||'No se pudo enviar el mensaje. Reintenta.');setMessages(prev=>prev.filter(m=>!String(m.id).startsWith('local-')));}return false;}
    finally{lock.current=false;if(mounted.current)setBusy(false);}
  };
  const reset=()=>{if(lock.current)return;generation.current++;unsubscribe.current?.();unsubscribe.current=null;conv.current=null;seen.current.clear();setMessages([]);setError('');};
  return {messages,busy,error,send,reset};
}