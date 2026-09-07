import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { crearPdfPolpaico } from '../../shared/polpaicoPdf.ts';
export default async function(req: Request): Promise<Response> {
  try {
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user)return Response.json({error:'Inicia sesión para operar el piloto.'},{status:401});
    if(user.role!=='admin')return Response.json({error:'Solo administradores pueden registrar operaciones en este piloto.'},{status:403});
    const b=await req.json(), e=base44.entities;
    const proyectoId='6a9f1261cdec16c7f4ff4774';
    if(b.proyecto_id && b.proyecto_id!==proyectoId)return Response.json({error:'Proyecto fuera del piloto autorizado.'},{status:403});
    const [proyecto]=await e.ProyectoObra.filter({id:proyectoId,codigo:'POLPAICO-DEMO-01',es_demo:true},undefined,1);
    if(!proyecto)return Response.json({error:'Piloto no disponible.'},{status:404});
    if(b.accion==='historial')return Response.json({decisiones:await e.DecisionPolpaico.filter({proyecto_id:proyectoId},'-created_date',100),simulacion:true});
    if(!['certificado','despacho','lectura','revision'].includes(b.accion))return Response.json({error:'Acción no válida.'},{status:400});
    const [p]=await e.PartidaControl.filter({proyecto_id:proyectoId,id:b.partida_id},undefined,1);
    if(!p)return Response.json({error:'La partida no pertenece al piloto.'},{status:400});
    if(b.confirmar!==true)return Response.json({error:'Presenta los datos y solicita confirmación explícita antes de guardar.'},{status:409});
    if(typeof b.request_id!=='string'||b.request_id.length<8||b.request_id.length>100)return Response.json({error:'Falta identificador estable de la operación.'},{status:400});
    const txt=(v,max=500)=>typeof v==='string'?v.trim().slice(0,max):'';
    const validNum=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
    if(b.accion==='certificado'){
      const espesor=b.espesor_m??0.15;
      if(!['hormipurifica','hormieco'].includes(p.tipo_hormigon)||!validNum(p.volumen_m3,0.01,1000000)||!validNum(espesor,0.01,5))return Response.json({error:'La partida debe ser HormiPurifica/HormiEco con volumen positivo; espesor entre 0,01 y 5 m.'},{status:400});
      const round=v=>Math.round(v*100)/100, superficie=p.volumen_m3/espesor;
      const codigo=`ESG-DEMO-${p.codigo}-${p.volumen_m3}-${espesor}`;
      let [c]=await e.CertificadoESG.filter({proyecto_id:proyectoId,codigo_certificado:codigo},undefined,1);
      if(b.solo_validar)return Response.json({validado:true,simulacion:true,superficie_m2:round(superficie)});
      if(!c)c=await e.CertificadoESG.create({proyecto_id:proyectoId,partida_id:p.id,tipo_hormigon:p.tipo_hormigon,volumen_m3:p.volumen_m3,espesor_m:espesor,superficie_m2:round(superficie),arboles_equivalentes:round(superficie*2),kg_co2_mitigado:round(superficie*0.85),obra_destinataria:`${proyecto.nombre} · ${p.nombre}`,constructora:proyecto.mandante||'Icafal',codigo_certificado:codigo,fecha_emision:new Date().toISOString().slice(0,10),estado:'borrador'});
      if(!c.pdf_url){const uri=await crearPdfPolpaico(base44,c); c=await e.CertificadoESG.update(c.id,{pdf_url:uri});}
      const signed=await base44.integrations.Core.CreateFileSignedUrl({file_uri:c.pdf_url,expires_in:3600});
      return Response.json({success:true,certificado_id:c.id,codigo:c.codigo_certificado,estado:c.estado,url:signed.signed_url,expira_en_horas:1,simulacion:true,nota:'Borrador de demostración, sin validez de certificación ambiental.'});
    }
    if(b.accion==='despacho'){
      if(!txt(b.guia_despacho,50)||!txt(b.chofer_nombre,100)||!txt(b.patente_mixer,30)||!validNum(b.volumen_m3,0.01,40)||!['en_carga','en_ruta','descargado'].includes(b.estado))return Response.json({error:'Indica guía, chofer, patente, volumen entre 0,01 y 40 m³ y estado válido.'},{status:400});
      const [anterior]=await e.DespachoMixer.filter({proyecto_id:proyectoId,guia_despacho:txt(b.guia_despacho,50)},undefined,1);
      if(anterior){if(anterior.partida_id!==p.id||anterior.volumen_m3!==b.volumen_m3||anterior.estado!==b.estado)return Response.json({error:'La guía ya existe con datos distintos; no se modificó.'},{status:409});return Response.json({success:true,despacho_id:anterior.id,reutilizado:true,simulacion:true});}
      if(b.solo_validar)return Response.json({validado:true,simulacion:true});
      const ahora=new Date().toISOString();
      const d=await e.DespachoMixer.create({proyecto_id:proyectoId,partida_id:p.id,guia_despacho:txt(b.guia_despacho,50),chofer_nombre:txt(b.chofer_nombre,100),patente_mixer:txt(b.patente_mixer,30),volumen_m3:b.volumen_m3,tipo_hormigon:p.tipo_hormigon,estado:b.estado,origen_planta:'Cerro Blanco, Tiltil',destino_obra:proyecto.nombre,fecha_hora_carga:ahora,...(b.estado==='descargado'?{fecha_hora_descarga:ahora}:{}),audio_transcripcion:txt(b.audio_transcripcion,4000),observaciones:'Registro manual de demostración confirmado por administrador. Hora de registro; no acredita hora efectiva de carga.'});
      return Response.json({success:true,despacho_id:d.id,guia:d.guia_despacho,simulacion:true});
    }
    if(b.accion==='lectura'){
      const fecha=b.timestamp_lectura;
      if(!p.sensor_id||!validNum(b.mpa_lectura,0,150)||!validNum(b.temperatura_c,-20,100)||typeof fecha!=='string'||!Number.isFinite(Date.parse(fecha))||Date.parse(fecha)>Date.now()+60000)return Response.json({error:'Indica MPa (0–150), temperatura (-20–100 °C) y timestamp_lectura ISO válido, no futuro; la partida necesita sensor.'},{status:400});
      const timestamp=new Date(fecha).toISOString();
      const [prev]=await e.TelemetriaLectura.filter({proyecto_id:proyectoId,partida_id:p.id,sensor_id:p.sensor_id,timestamp_lectura:timestamp},undefined,1);
      if(prev&&(prev.mpa_lectura!==b.mpa_lectura||prev.temperatura_c!==b.temperatura_c))return Response.json({error:'Ya existe una lectura distinta para ese instante.'},{status:409});
      if(b.solo_validar)return Response.json({validado:true,simulacion:true});
      const lectura=prev||await e.TelemetriaLectura.create({proyecto_id:proyectoId,partida_id:p.id,sensor_id:p.sensor_id,mpa_lectura:b.mpa_lectura,temperatura_c:b.temperatura_c,timestamp_lectura:timestamp,fuente:'simulacion'});
      const [latest]=await e.TelemetriaLectura.filter({proyecto_id:proyectoId,partida_id:p.id,sensor_id:p.sensor_id},'-timestamp_lectura',1);
      await e.PartidaControl.update(p.id,{mpa_lectura_actual:latest.mpa_lectura});
      return Response.json({success:true,lectura_id:lectura.id,mpa_actual:latest.mpa_lectura,simulacion:true,nota:'Calidad y pagos no modificados. No es una lectura recibida de ObraLink.'});
    }
    if(!['solicitar_revision','mantener_bloqueo','aprobacion_demo'].includes(b.decision)||txt(b.motivo).length<10)return Response.json({error:'Indica una decisión válida y un motivo de al menos 10 caracteres.'},{status:400});
    const [prev]=await e.DecisionPolpaico.filter({proyecto_id:proyectoId,request_id:b.request_id},undefined,1);
    if(prev)return Response.json({success:true,decision_id:prev.id,decision:prev.decision,reutilizado:true,simulacion:true});
    if(b.decision==='aprobacion_demo'){
      const abiertas=await e.InspeccionCalidad.filter({proyecto_id:proyectoId,partida_id:p.id,es_no_conformidad:true,estado:{$nin:['cerrada','aprobada']}},undefined,1);
      if(abiertas.length||p.estado_calidad!=='aprobado'||!(p.mpa_especificado>0)||!(p.mpa_lectura_actual>=p.mpa_especificado))return Response.json({error:'Aprobación rechazada: exige calidad aprobada, ninguna NC abierta y resistencia objetivo alcanzada. No se cambió ningún pago.'},{status:409});
    }
    if(b.solo_validar)return Response.json({validado:true,simulacion:true});
    const decision=await e.DecisionPolpaico.create({proyecto_id:proyectoId,partida_id:p.id,decision:b.decision,motivo:txt(b.motivo),responsable:user.full_name||user.email,request_id:b.request_id,mpa_registrado:p.mpa_lectura_actual||0,simulacion:true});
    return Response.json({success:true,decision_id:decision.id,decision:decision.decision,simulacion:true,nota:'Decisión de demostración registrada. No autoriza trabajos reales ni modifica pagos.'});
  } catch(error){return Response.json({error:error.message},{status:500});}
}