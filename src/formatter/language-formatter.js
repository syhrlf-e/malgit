import { ID_ACTIONS } from "../generator/templates.js";

const ID_TARGETS = {
  "author information": "informasi author",
  "authentication logic": "logika autentikasi",
  caching: "caching",
  "calculation logic": "logika perhitungan",
  "code style": "gaya kode",
  "code structure": "struktur kode",
  "commit message classification": "klasifikasi commit message",
  "commit workflow": "alur commit",
  "configuration guide": "panduan konfigurasi",
  dependencies: "dependensi",
  documentation: "dokumentasi",
  "email verification": "verifikasi email",
  feature: "fitur",
  "installation guide": "panduan instalasi",
  issue: "masalah",
  "package metadata": "metadata package",
  "package scripts": "script package",
  "project files": "file proyek",
  "project maintenance": "pemeliharaan proyek",
  "project description": "deskripsi proyek",
  performance: "performa",
  styles: "style",
  "test cases": "kasus pengujian",
  "total calculation": "perhitungan total",
  "usage instructions": "instruksi penggunaan",
  "validation handling": "penanganan validasi",
  workflow: "workflow"
};

export function formatDescription({ action, target }, language) {
  if (language === "id") {
    return `${ID_ACTIONS[action] ?? action} ${ID_TARGETS[target] ?? target}`;
  }

  return `${action} ${target}`;
}
