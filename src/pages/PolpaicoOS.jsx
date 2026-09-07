import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PolpaicoNav from '@/components/polpaico/PolpaicoNav';
import PolpaicoChatHeader from '@/components/polpaico/PolpaicoChatHeader';
import PolpaicoChatMessages from '@/components/polpaico/PolpaicoChatMessages';
import PolpaicoComposer from '@/components/polpaico/PolpaicoComposer';
import PolpaicoContext from '@/components/polpaico/PolpaicoContext';
import PolpaicoDetail from '@/components/polpaico/PolpaicoDetail';
import usePolpaicoChat from '@/components/polpaico/usePolpaicoChat';

export default function PolpaicoOS() {
  const [view,setView]=useState('resumen'), [showData,setShowData]=useState(true), [mobileData,setMobileData]=useState(false), [detail,setDetail]=useState(false);
  const [session,setSession]=useState(0);
  const client=useQueryClient();
  const {data,isFetching,isError,refetch}=useQuery({queryKey:['polpaico-public-dashboard'],queryFn:async()=> (await base44.functions.invoke('dashboardPolpaico',{})).data,refetchInterval:30000,staleTime:15000,retry:1});
  const chat=usePolpaicoChat(()=>{client.invalidateQueries({queryKey:['polpaico-public-dashboard']});client.invalidateQueries({queryKey:['polpaico-decisiones']});});
  useEffect(()=>{const previous=document.title;document.title='GO · Polpaico OS';return()=>{document.title=previous;};},[]);
  const onView=key=>{setView(key);setShowData(true);if(window.innerWidth<768)setMobileData(true);};
  const ask=async(text,files)=>{setMobileData(false); const ok=await chat.send(text,files); if(ok){if(/ESG|HormiPurifica|certificado/i.test(text))setView('esg');else if(/despacho|guía|mixer/i.test(text))setView('logistica');else if(/MPa|resistencia|sensor|lectura/i.test(text))setView('telemetria');else if(/NC|pago|retiene/i.test(text))setView('calidad');} return ok;};
  const context=<PolpaicoContext data={data} view={view} onAsk={ask} onExpand={()=>{setMobileData(false);setDetail(true);}} refreshing={isFetching} onRefresh={refetch}/>;
  return <div className="polpaico-portal polpaico-workspace bg-background text-foreground font-body h-[100dvh] overflow-hidden flex">
    <PolpaicoNav view={view} onView={onView}/>
    <main className="flex-1 min-w-0 min-h-0 flex flex-col">
      <PolpaicoChatHeader busy={chat.busy} onNew={()=>{chat.reset();setSession(n=>n+1);}} view={view} onView={onView} onData={()=>window.innerWidth<768?setMobileData(v=>!v):setShowData(v=>!v)}/>
      {isError&&<p role="alert" className="px-4 py-2 bg-warn/10 text-warn text-xs">No se pudo actualizar el piloto. <button onClick={()=>refetch()} className="underline">Reintentar</button></p>}
      <PolpaicoChatMessages messages={chat.messages} busy={chat.busy} onSend={ask} data={data}/>
      {chat.error&&<p role="alert" className="text-xs text-danger px-5 py-2">{chat.error} Puedes volver a enviar tu consulta.</p>}
      <PolpaicoComposer key={session} onSend={ask} busy={chat.busy}/>
    </main>
    {showData&&<aside className="hidden md:block w-72 lg:w-80 xl:w-96 shrink-0 border-l border-border bg-background overflow-y-auto" aria-label="Datos del piloto">{context}</aside>}
    {mobileData&&<div className="fixed inset-0 z-40 bg-background overflow-y-auto md:hidden" role="dialog" aria-modal="true" aria-label="Datos del piloto"><div className="flex justify-between items-center p-4 border-b border-border"><h2 className="font-semibold">Polpaico · datos del piloto</h2><button autoFocus aria-label="Volver al chat" onClick={()=>setMobileData(false)} className="p-3"><X className="w-5 h-5"/></button></div>{context}</div>}
    <PolpaicoDetail open={detail} onOpenChange={setDetail} view={view} data={data}/>
  </div>;
}