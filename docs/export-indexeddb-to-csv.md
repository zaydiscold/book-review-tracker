How to export your current browser data (books) to CSV for Supabase import

Run this in the browser console while the app is open on the same origin. It will pull from the IndexedDB database (`book-review-tracker`), export the `books` object store, and download `books-export.csv` with columns that match `docs/supabase.sql`.

```js
(function exportBooksToCsv() {
  const DB_NAME = "book-review-tracker";
  const STORE = "books";

  const headers = [
    "id",
    "title",
    "author",
    "status",
    "cover",
    "openLibraryUrl",
    "openLibraryIdentifiers",
    "availability",
    "createdAt",
    "updatedAt"
  ];

  const req = indexedDB.open(DB_NAME);
  req.onerror = () => console.error("Failed to open IndexedDB", req.error);
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const getAllReq = store.getAll();
    getAllReq.onerror = () => console.error("Failed to read books", getAllReq.error);
    getAllReq.onsuccess = () => {
      const rows = getAllReq.result || [];
      const csv = [headers.join(",")];
      for (const row of rows) {
        const values = headers.map((key) => {
          const value = row[key];
          if (value === undefined || value === null) return "";
          const stringified = typeof value === "object" ? JSON.stringify(value) : String(value);
          // Escape quotes and wrap in quotes if needed
          if (stringified.includes(",") || stringified.includes("\"") || stringified.includes("\n")) {
            return `"${stringified.replace(/"/g, '""')}"`;
          }
          return stringified;
        });
        csv.push(values.join(","));
      }

      const blob = new Blob([csv.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "books-export.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      console.log(`Exported ${rows.length} books to books-export.csv`);
    };
  };
})();
```

Then upload `books-export.csv` in the Supabase table import UI.
