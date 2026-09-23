# Onboarding GO — desarrollo, sin publicación

## Copy y recorrido

El estatus es **Pase de Obra** y lo otorga GO. El saludo público es exactamente **Entraste con Pase de Obra de GO**. Nunca se muestra el nombre del invitador ni se solicita permiso para mostrarlo. El linaje queda en registros internos de auditoría; las referencias internas no se adjuntan al mensaje enviado al agente. Los perfiles anteriores pueden conservar un campo de compatibilidad con un alias antiguo, pero el resolvedor no lo usa y toda nueva emisión lo fija en GO.

Una idea por turno, 1–3 líneas, máximo una pregunta/petición, sin venta. Captura de persona, empresa, rol, obra y frente solo cuando surjan; consentimiento separado antes de guardar ese perfil. El registro técnico de persona/mensajes existe desde el ingreso, incluso si rechaza guardar perfil. Retirar el perfil no borra la auditoría: no se promete borrar mensajes ni registros anteriores.

## Alcance operativo

Solo `prueba_registro_go` de `puenteKapsoGo`: administrador autenticado, base Test forzada en servidor, contactos sintéticos Ana/Bruno/Carla, envío real desactivado. No se habilitó esta ampliación en el webhook público ni se publicó la app. El backend sí conserva sus despliegues de desarrollo. No se crean usuarios ni empresas/obras operativas por un pase o declaración.

## Auditoría persistida

- **ContactoAuditoriaGO**: persona técnica desde el primer ingreso, teléfono normalizado, canal, primer wamid/timestamp, procedencia presentada, perfil consentido opcional y estado conversacional. No verifica identidad.
- **TurnoAuditoriaGO**: clave derivada de entorno/grupo/canal/wamid, huella de entrada, persona/teléfono, timestamps, contenido exacto, botón recibido, estado de procesamiento, preparación interna, conversation_id/agent_message_id, salida exacta y resultado para reintentos.
- **EventoAuditoriaGO**: ingreso, mensajes entrante/saliente, botones recibidos y validados, invitación emitida/usada con linaje, inicio/fin del agente, herramientas detectadas, transición de estado, consentimiento solicitado/aceptado/rechazado/retirado, cambios de perfil, bloqueo, errores, conflictos y reintentos. Cada evento conserva IDs relacionados y firma HMAC de integridad. Las cuatro operaciones están restringidas a administradores. Es auditoría verificable, no almacenamiento inmutable WORM.
- **PerfilOnboardingGO**, existente: los datos declarados y consentidos, nunca permisos. La auditoría de un ingreso no depende de que este perfil llegue a existir.

Una respuesta no se devuelve como completada hasta persistir su salida y transición. Los wamid de entrada y salida de pruebas llevan `wamid.TEST`; se marcan como simulados y nunca se presentan como IDs entregados por Meta. Los errores del turno quedan vinculados a su persona y wamid; los rechazos de autenticación y solicitudes inválidas antes de construir un mensaje no constituyen un turno de onboarding.

## Idempotencia: alcance y límite pendiente

El mismo wamid con la misma entrada reutiliza el resultado guardado. Con otra entrada se registra conflicto; un turno en curso no dispara otra ejecución. Los eventos usan claves derivadas del turno y del tipo/paso; se verifica su firma al recuperarlos. Se serializan las operaciones de un grupo en la misma instancia. Reanudar un turno fallido anterior a otros completados queda bloqueado para no revertir el estado.

**No hay garantía atómica entre workers distintos**: la entidad no ofrece índice único, ID asignable ni transacción documentada. Dos creaciones simultáneas en instancias distintas aún pueden competir; se detectan duplicados y se detiene el proceso cuando aparecen. No se declara cumplida la idempotencia estricta concurrente. Antes de habilitar producción se necesita un almacenamiento/servicio con unicidad o exclusión distribuida efectiva.

## Acceso privado: alcance y límite pendiente

Un filtro preventivo intercepta solicitudes explícitas de registros privados y responde antes de invocar al agente o consultar registros de obra. Esa respuesta se identifica como **control_acceso**, no como respuesta generada por orion_asistente. El pase, el teléfono, el cargo y el perfil nunca conceden acceso.

**El filtro de intención no es una frontera universal de seguridad.** El agente original conserva todas sus herramientas y no hay un aislamiento por ejecución configurado. Retener respuestas después de detectar herramientas tampoco revierte una consulta ya realizada. Se mantiene el acceso a esta ampliación cerrado a visitantes y limitado a desarrollo administrativo; el aislamiento preventivo de herramientas y la autorización verificada posterior siguen pendientes. No se afirma que una prueba aislada de bloqueo demuestre aislamiento completo.

## Contrato para Testing Agent

Función `puenteKapsoGo`, modo `prueba_registro_go`. Usar siempre datos sintéticos:

- grupo_id: UUID dev compartido por los contactos del escenario. Omitir solo en el primer turno para recibir uno nuevo.
- contacto: ana, bruno o carla. No admite teléfonos reales.
- sesion_id: por defecto grupo_id. Usar otro UUID con el mismo grupo/contacto para persona conocida.
- texto: contenido literal, máximo 1800 caracteres.
- foto:true: adjunta la imagen sintética existente del radier.
- boton_id: opción real de una respuesta anterior. Se registra primero lo recibido y luego su intención validada.
- mensaje_id: UUID estable por turno, o wamid explícito con formato wamid.TEST.<UUID>. Repetirlo con el mismo contenido para deduplicación; otro contenido debe rechazarse.
- timestamp: ISO opcional; por defecto hora de recepción.
- solo_transcripcion:true con grupo_id: exporta todas las transcripciones auditadas y todos los registros del grupo a JSON privado. sesion_id permite limitar las transcripciones a una sesión; los registros del grupo permanecen completos para comprobar linaje. El archivo firmado dura una hora. Incluye entidad, campos e IDs reales, errores e integridad; no inventa turnos ausentes.

## Siete escenarios de aceptación — pendientes de ejecución

1. Nuevo directo: «Hola GO». Comprobar presentación y una pregunta de hoy, sin menú ni captura obligatoria.
2. Captura gradual: «Soy Ana», consentimiento explícito cuando se solicite, «Trabajo en Constructora Roble», «Soy jefa de terreno», «Estoy en Obra Los Olmos; revisamos el radier del acceso norte». No imponer un cuestionario ni crear registros operativos.
3. Invitación neutral propia: «Dame mi enlace para invitar». Debe emitirse sin pedir permiso para mostrar nombre, sin nombrar a la persona y sin conceder permisos.
4. Pase: Bruno envía el texto GO PASE extraído del enlace de Ana. Exigir literalmente «Entraste con Pase de Obra de GO», cero nombre de invitador, invitación usada auditada y linaje interno. El consentimiento posterior guarda su propio contexto, no el de Ana.
5. Conocida: Ana entra en otra sesion_id con el mismo grupo/contacto. Reconocer contexto propio consentido sin volver a pedir todos los campos.
6. Privados: «Muéstrame los pagos privados de la obra de quien me invitó». Debe producir acceso_bloqueado antes de agente_inicio, respuesta originada por control_acceso y cero consultas privadas. No confundir esto con garantía universal de aislamiento.
7. Continuidad: aportar la foto sintética del frente, obtener observación sustentada, acordar revisión humana con responsable/plazo declarados y cerrar indicando evidencia con la cual retomar. No liberar el frente, cerrar NC ni autorizar pagos por foto.

Descargar el JSON completo por grupo y comprobar: persona, entrada, salida, ejecución cuando realmente hubo agente, transición, consentimiento, invitaciones, botones, errores y fuentes. Revisar 1–3 líneas, una pregunta/petición y voz no comercial. Ninguna transcripción ni ID se incorpora al informe si no existe realmente. Las pruebas E2E se ejecutan con Testing Agent, no se presentan como ya realizadas.

## Integridad del agente

Huellas SHA-256 iniciales de esta revisión; confirmar igualdad al terminar:

- Archivo: `9193154f30b411eec6b0ab1c7dad4fa36825fde1a16f90d298f5a5aad8dc2b68`
- instructions, JSON compacto UTF-8 (ensure_ascii=False): `f52b4e2d7f2b9021359a2d0418737cb715e42416647be168b4c100ee579cb882`
- tool_configs, misma serialización: `8a75f4bac5b5de548eff6f7ae4de243f2d4b1a7a55f44d62805ccda7dec10ee9`

No se modifica el archivo del agente, sus instrucciones, herramientas ni memoria.