export default function applyGoRecordEvent(records, event) {
  if (!event?.id) return records;
  if (event.type === 'delete') return records.filter(record => record.id !== event.id);
  if (!event.data) return records;
  if (event.type === 'create') return [event.data, ...records.filter(record => record.id !== event.id)];
  if (event.type === 'update') return records.map(record => record.id === event.id ? { ...record, ...event.data } : record);
  return records;
}