// Placeholder: expand to offer CSV/Markdown exports and cloud backups in later revisions.
export function downloadLibraryJson(payload) {
  const filename = `book-review-tracker-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
  return filename;
}
