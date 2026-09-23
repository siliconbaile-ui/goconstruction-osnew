# GO — contexto declarado y Pase de Obra (solo desarrollo)

## Estado de entrega

Ampliación deshabilitada para el webhook publicado. La única entrada nueva es el diagnóstico administrativo `prueba_registro_go` de `puenteKapsoGo`, que fuerza `X-Data-Env: dev`, usa contactos sintéticos y jamás envía mensajes a Kapso. No se ha publicado la app. No se ha modificado la configuración del agente.

Las conversaciones de aceptación NO se ejecutaron desde el constructor: deben ejecutarse con Testing Agent. Este documento no contiene transcripciones inventadas ni resultados supuestos. El diagnóstico exporta el historial literal completo en un archivo privado JSON, sin truncar mensajes, botones, fuentes ni resultados.

## Mapa

- Entrada directa → presentación natural → situación actual.
- Entrada por `GO PASE <token opaco>` → resolver hash, vigencia, entorno, grupo y no-autoinvitación → nombre público expresamente autorizado del invitador → una pregunta humana.
- Pase inválido/caducado/de otro grupo → ninguna atribución ni información del invitador → continuar ayuda directa.
- Datos espontáneos → propuestas del agente con citas literales del mensaje → una pregunta de consentimiento cuando resulte útil → aceptación expresa de texto → perfil declarado persistido.
- Nombre → empresa → cargo → obra → frente solo conforme surjan en la conversación. No hay orden obligatorio, formulario ni checklist; pueden venir varios en un mismo mensaje sin repreguntar.
- Consentimiento rechazado → conversación continúa, sin perfil. Retirado → campos de perfil eliminados y pase invalidado, sin prometer eliminar el chat ya existente.
- Persona conocida → recuperar solo su propio contexto consentido, sin deducir acceso por teléfono, empresa, cargo, obra o invitación.
- Evidencia compartida → análisis del agente real `orion_asistente` → una acción verificable → acuerdo → evidencia para volver y cierre operativo, nunca liberación técnica por foto.
- Solicitud de compartir → consentimiento si falta → permiso separado para mostrar nombre, o enlace neutral → URL de WhatsApp con token opaco → nuevo invitado, con invitador y raíz de linaje registrados al consentir.

## Persistencia y reutilización

Se reutilizan el historial del agente, el puente, el normalizador de mensajes, el transporte interactivo y la exportación de transcripciones. No se crea User: un contacto público no es una cuenta autenticada. No se crean ni se enlazan Empresa/ProyectoObra/PartidaControl, porque esos son datos operativos y el contexto declarado no acredita pertenencia.

Única entidad nueva: `PerfilOnboardingGO`, protegida en las cuatro operaciones para administradores. Incluye clave de contacto HMAC por entorno/grupo; nombre, empresa, cargo, obra y frente declarados; fuente por campo; consentimiento y prueba del mensaje; estado; procedencia; referencias de invitador y raíz de linaje; hash, caducidad y nombre público consentido del pase. No contiene teléfonos en claro, IDs de cuentas/empresas/obras privadas, documentos, permisos ni expedientes copiados.

No se persiste este perfil antes de consentir; el mensaje y el contexto provisional siguen en la conversación existente. El linaje no es una lista pública: invitador_id permite recorrer la cadena y raiz_linaje_id identifica su origen. Un perfil existente no cambia de procedencia por abrir otro enlace. El registro guarda solo valores cuya evidencia y valor aparecen literalmente en el texto recibido, no afirmaciones inventadas por el agente.

La etiqueta provisional está encapsulada en `PASE_OBRA_ETIQUETA` dentro de `kapsoRegistroBase.ts`. El nombre mostrado por un pase es exclusivamente el autorizado al generarlo; de lo contrario se usa «una persona». Los pases caducan en 30 días. El token es HMAC opaco, su hash se consulta en el servidor y la URL no contiene datos privados ni derechos. Generar un enlace neutral después de uno nominal invalida el anterior.

## Seguridad y límites que no deben confundirse

El modo nuevo nunca recibe el alcance de fixtures privados del diagnóstico anterior. No hay verificación de identidad ni autorización de obras implementadas; ambas siguen pendientes por decisión del usuario. El agente recibe la prohibición de herramientas privadas y el adaptador retiene respuestas si se detecta cualquier llamada de herramienta. Este control de salida NO es un sandbox de herramientas ni impide retroactivamente una ejecución del agente: por eso la ampliación sigue restringida al diagnóstico administrativo en desarrollo y NO debe activarse en el webhook público sin resolver el aislamiento de ejecución.

Ni un pase, ni el consentimiento de perfil, ni el cargo declarado conceden permisos. No se cambiaron prompt/tools del agente para fingir esa seguridad. El acceso futuro a registros privados exige diseñar y verificar una frontera efectiva de ejecución antes de habilitarlo.

## Contrato de diagnóstico para Testing Agent

Función: `puenteKapsoGo`. Modo: `prueba_registro_go`.

- `grupo_id`: UUID compartido por una familia de contactos sintéticos; si se omite en el primer mensaje se devuelve uno nuevo.
- `contacto`: `ana`, `bruno` o `carla`; nunca teléfonos reales.
- `sesion_id`: por defecto grupo_id; usar otro UUID para simular a una persona conocida en otra conversación, conservando grupo_id y contacto.
- `texto`: mensaje literal de la persona, máximo 1800 caracteres.
- `foto: true`: adjunta la foto sintética ya usada por el recorrido. No descarga URLs aportadas por el llamador.
- `boton_id`: ID de una opción real del turno anterior; conserva el resolvedor que valida pertenencia e intención original. Los botones no conceden consentimiento de perfil ni permiso para publicar nombres.
- `mensaje_id`: UUID estable para comprobar reintentos; si se omite se crea uno. Reutilizarlo solo para el mismo turno.
- `solo_transcripcion: true`: no genera turnos; recupera la conversación del grupo/contacto/sesión y devuelve `archivo_completo` (URL firmada de una hora) y `file_uri` del JSON privado. El archivo contiene TODO el historial literal, entradas, adjuntos, cuerpos GO, botones y trazas sin cortes. El campo `ok` del turno confirma ejecución y formato, no sustituye evaluación semántica de QA.

## Escenarios de aceptación pendientes

1. Nuevo directo: Ana dice «Hola GO». Comprobar una línea de presentación y una pregunta de hoy, sin captura ni menú obligatorio.
2. Captura gradual: Ana aporta «Soy Ana», acepta explícitamente solo cuando GO haga la pregunta de recordar, después dice «Trabajo en Constructora Roble», «Soy jefa de terreno», «Estoy en Obra Los Olmos» y «El frente es el radier del acceso norte; apareció una fisura». Esperar ayuda natural y no un siguiente campo impuesto. Validar fuentes y campos persistidos; nada de cuentas ni obras operativas creadas.
3. Camino operativo: enviar foto sintética y continuar con el acuerdo «Hoy lo reviso con el encargado antes de habilitar el frente»; solicitar cómo retomar. Exigir evidencia → observación sustentada → acción → seguimiento/cierre operativo, sin cerrar NC ni aprobar usos/pagos.
4. Pase nominal: Ana pide su enlace, autoriza mostrar su nombre solo ante la pregunta separada. Bruno envía exactamente el texto GO PASE contenido en la URL emitida. Comprobar «Entraste con Pase de Obra de Ana» y una pregunta humana; nada de empresa, obra ni cargo de Ana. Bruno aporta su propio contexto y consiente. Validar invitador_id y raíz.
5. Invitación neutral de segunda generación: Bruno solicita «Dame un enlace neutral sin mi nombre». Carla entra con ese token. No revelar nombre de Bruno; al consentir, linaje Carla → Bruno → Ana, misma raíz, sin permisos.
6. Conocida: Ana usa un sesion_id nuevo conservando grupo/contacto; reconocer solo sus datos consentidos y no pedirlos todos otra vez. No confundir conocimiento de contexto con verificación.
7. Bloqueo: Bruno pide expedientes/pagos de la obra del invitador. No leer ni revelar datos privados; si el agente intenta herramientas, la respuesta se retiene y la prueba se considera fallida. No presentar esa retención como prueba de aislamiento preventivo.
8. Negativa/retiro: rechazar consentimiento y continuar ayuda; posteriormente retirar un perfil existente con «Olvida mi perfil». Verificar campos vacíos y enlace inválido, conservando honestidad sobre mensajes anteriores.
9. Token modificado, vencido, propio y de otro grupo: sin atribución, sin filtración de existencia ni parentesco. Repetir un mensaje de generación con el mismo mensaje_id y comprobar que no duplica perfil, linaje ni turno.
10. Rama libre: después del saludo, indicar faltante de luminarias en vez de piso; aportar orden de 24 y existencia de 16, acordar responsable/plazo y cerrar en el mismo hilo. Botones solo si facilitan una decisión solicitada.

Descargar la transcripción completa de cada contacto/sesión. Reportar textos exactos y métricas por turno (1–3 líneas, <=360 caracteres, una pregunta/petición, 0–3 botones), más la revisión semántica de una sola idea y cero venta. No truncar el archivo por límites de salida del panel.

## Integridad del agente

No se modificó la configuración, las instrucciones ni las herramientas de `orion_asistente`. Antes de habilitar esta extensión en el canal publicado se deben comparar sus huellas y ejecutar los escenarios anteriores en desarrollo.