import { ID_ACTIONS } from "../generator/templates.js";

const ID_TARGETS = {
  "authentication logic": "logika autentikasi",
  "code style": "gaya kode",
  "code structure": "struktur kode",
  dependencies: "dependensi",
  documentation: "dokumentasi",
  "email verification": "verifikasi email",
  feature: "fitur",
  issue: "masalah",
  "project files": "file proyek",
  "project maintenance": "pemeliharaan proyek",
  performance: "performa",
  "test cases": "kasus pengujian",
  "validation handling": "penanganan validasi",
  workflow: "workflow"
};

export function formatDescription({ action, target }, language) {
  if (language === "id") {
    return `${ID_ACTIONS[action] ?? action} ${ID_TARGETS[target] ?? target}`;
  }

  return `${action} ${target}`;
}
