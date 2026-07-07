// Splits examples/sample-stub-mappings.json (the bulk-import file) into one
// JSON file per stub mapping, written to two locations:
//
//   - docker/wiremock-seed/mappings/  — bind-mounted by docker-compose.yml
//     into the WireMock container's `mappings` directory, which WireMock
//     auto-loads at startup.
//   - k8s/wiremock/seed-mappings/     — packaged into a ConfigMap by
//     k8s/wiremock/kustomization.yaml and copied onto the StatefulSet's PVC
//     by an initContainer on first boot (see k8s/wiremock/statefulset.yaml).
//     This copy must live under k8s/wiremock/ because Kustomize's
//     configMapGenerator refuses to reference files outside the
//     kustomization root for security reasons.
//
// Run with: node scripts/generate-wiremock-seed.mjs
// Re-run this whenever examples/sample-stub-mappings.json changes.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const sourceFile = join(rootDir, "examples", "sample-stub-mappings.json");
const outputDirs = [
  join(rootDir, "docker", "wiremock-seed", "mappings"),
  join(rootDir, "k8s", "wiremock", "seed-mappings"),
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const { mappings } = JSON.parse(readFileSync(sourceFile, "utf8"));

if (!Array.isArray(mappings) || mappings.length === 0) {
  throw new Error(`No mappings found in ${sourceFile}`);
}

for (const outputDir of outputDirs) {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  mappings.forEach((mapping, index) => {
    const order = String(index + 1).padStart(2, "0");
    const slug = slugify(mapping.name ?? mapping.id ?? `mapping-${order}`);
    const fileName = `${order}-${slug}.json`;
    writeFileSync(join(outputDir, fileName), `${JSON.stringify(mapping, null, 2)}\n`, "utf8");
  });

  const written = readdirSync(outputDir).filter((file) => file.endsWith(".json"));
  console.log(`Wrote ${written.length} stub mapping file(s) to ${outputDir}`);
}
