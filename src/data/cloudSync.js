// Placeholder: implement secure authenticated sync once a backend datastore is approved.
export async function syncToCloud(snapshot) {
  console.info("Cloud sync disabled in local-first mode", snapshot);
  return { status: "disabled" };
}

export function scheduleBackgroundSync() {
  // No-op for now. Future implementation will register background sync or CRDT merges.
  return null;
}
