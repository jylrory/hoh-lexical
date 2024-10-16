// vite.config.ts
import babel from "file:///Users/rory/Projects/hoh-lexical/node_modules/@rollup/plugin-babel/dist/es/index.js";
import commonjs from "file:///Users/rory/Projects/hoh-lexical/node_modules/@rollup/plugin-commonjs/dist/es/index.js";
import react from "file:///Users/rory/Projects/hoh-lexical/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { createRequire as createRequire2 } from "node:module";
import { defineConfig } from "file:///Users/rory/Projects/hoh-lexical/node_modules/vite/dist/node/index.js";
import { replaceCodePlugin } from "file:///Users/rory/Projects/hoh-lexical/node_modules/vite-plugin-replace/index.js";

// ../shared/viteModuleResolution.ts
import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
var __vite_injected_original_import_meta_url = "file:///Users/rory/Projects/hoh-lexical/packages/shared/viteModuleResolution.ts";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var { packagesManager } = require2("../../scripts/shared/packagesManager");
var sourceModuleResolution = () => {
  function toAlias(pkg, entry) {
    return {
      find: entry.name,
      replacement: pkg.resolve("src", entry.sourceFileName)
    };
  }
  return [
    ...packagesManager.getPublicPackages().flatMap(
      (pkg) => pkg.getExportedNpmModuleEntries().map(toAlias.bind(null, pkg))
    ),
    ...["shared"].map((name) => packagesManager.getPackageByDirectoryName(name)).flatMap(
      (pkg) => pkg.getPrivateModuleEntries().map(toAlias.bind(null, pkg))
    )
  ];
};
var distModuleResolution = (environment) => {
  return [
    ...packagesManager.getPublicPackages().flatMap(
      (pkg) => pkg.getNormalizedNpmModuleExportEntries().map((entry) => {
        const [name, moduleExports] = entry;
        const replacements = [environment, "default"].map(
          (condition) => pkg.resolve("dist", moduleExports.import[condition])
        );
        const replacement = replacements.find(fs.existsSync.bind(fs));
        if (!replacement) {
          throw new Error(
            `ERROR: Missing ./${path.relative(
              "../..",
              replacements[1]
            )}. Did you run \`npm run build\` in the monorepo first?`
          );
        }
        return {
          find: name,
          replacement
        };
      })
    ),
    ...[packagesManager.getPackageByDirectoryName("shared")].flatMap(
      (pkg) => pkg.getPrivateModuleEntries().map((entry) => {
        return {
          find: entry.name,
          replacement: pkg.resolve("src", entry.sourceFileName)
        };
      })
    )
  ];
};
function moduleResolution(environment) {
  return environment === "source" ? sourceModuleResolution() : distModuleResolution(environment);
}

// viteCopyEsm.ts
import * as fs2 from "node:fs";
import * as path2 from "node:path";
import copy from "file:///Users/rory/Projects/hoh-lexical/node_modules/rollup-plugin-copy/dist/index.commonjs.js";
function parseImportMapImportEntries() {
  const m = /<script type="importmap">([\s\S]+?)<\/script>/g.exec(
    fs2.readFileSync("./esm/index.html", "utf8")
  );
  if (!m) {
    throw new Error("Could not parse importmap from esm/index.html");
  }
  return Object.entries(JSON.parse(m[1]).imports);
}
function viteCopyEsm() {
  return copy({
    hook: "writeBundle",
    targets: [
      { dest: "./build/esm/", src: "./esm/*" },
      { dest: "./build/", src: ["./*.png", "./*.ico"] },
      ...parseImportMapImportEntries().map(([mod, fn]) => ({
        dest: "./build/esm/dist/",
        src: path2.join(
          `../${mod.replace(/^@/, "").replace(/\//g, "-")}`,
          // Fork modules are only produced by build-release, which is not run
          // in CI, so we don't need to worry about choosing dev or prod
          fn
        )
      }))
    ],
    verbose: true
  });
}

// vite.config.ts
var __vite_injected_original_import_meta_url2 = "file:///Users/rory/Projects/hoh-lexical/packages/lexical-playground/vite.config.ts";
var require3 = createRequire2(__vite_injected_original_import_meta_url2);
var vite_config_default = defineConfig(({ command }) => {
  return {
    base: "/ghost/classic-editor",
    build: {
      outDir: "build",
      rollupOptions: {
        input: {
          main: new URL("./index.html", __vite_injected_original_import_meta_url2).pathname,
          split: new URL("./split/index.html", __vite_injected_original_import_meta_url2).pathname
        },
        onwarn(warning, warn) {
          if (warning.code === "EVAL" && warning.id && /[\\/]node_modules[\\/]@excalidraw\/excalidraw[\\/]/.test(
            warning.id
          )) {
            return;
          }
          warn(warning);
        }
      }
    },
    define: {
      "process.env.IS_PREACT": process.env.IS_PREACT
    },
    plugins: [
      replaceCodePlugin({
        replacements: [
          {
            from: /__DEV__/g,
            to: "true"
          },
          {
            from: "process.env.LEXICAL_VERSION",
            to: JSON.stringify(`${process.env.npm_package_version}+git`)
          }
        ]
      }),
      babel({
        babelHelpers: "bundled",
        babelrc: false,
        configFile: false,
        exclude: "/**/node_modules/**",
        extensions: ["jsx", "js", "ts", "tsx", "mjs"],
        plugins: [
          "@babel/plugin-transform-flow-strip-types",
          [
            require3("../../scripts/error-codes/transform-error-messages"),
            {
              noMinify: true
            }
          ]
        ],
        presets: [["@babel/preset-react", { runtime: "automatic" }]]
      }),
      react(),
      viteCopyEsm(),
      commonjs({
        // This is required for React 19 (at least 19.0.0-beta-26f2496093-20240514)
        // because @rollup/plugin-commonjs does not analyze it correctly
        strictRequires: [/\/node_modules\/(react-dom|react)\/[^/]\.js$/]
      })
    ],
    resolve: {
      alias: moduleResolution(command === "serve" ? "source" : "development")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vc2hhcmVkL3ZpdGVNb2R1bGVSZXNvbHV0aW9uLnRzIiwgInZpdGVDb3B5RXNtLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3JvcnkvUHJvamVjdHMvaG9oLWxleGljYWwvcGFja2FnZXMvbGV4aWNhbC1wbGF5Z3JvdW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcm9yeS9Qcm9qZWN0cy9ob2gtbGV4aWNhbC9wYWNrYWdlcy9sZXhpY2FsLXBsYXlncm91bmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3JvcnkvUHJvamVjdHMvaG9oLWxleGljYWwvcGFja2FnZXMvbGV4aWNhbC1wbGF5Z3JvdW5kL3ZpdGUuY29uZmlnLnRzXCI7LyoqXG4gKiBDb3B5cmlnaHQgKGMpIE1ldGEgUGxhdGZvcm1zLCBJbmMuIGFuZCBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICpcbiAqL1xuXG5pbXBvcnQgYmFiZWwgZnJvbSAnQHJvbGx1cC9wbHVnaW4tYmFiZWwnXG5pbXBvcnQgY29tbW9uanMgZnJvbSAnQHJvbGx1cC9wbHVnaW4tY29tbW9uanMnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbm9kZTptb2R1bGUnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgcmVwbGFjZUNvZGVQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1yZXBsYWNlJ1xuXG5pbXBvcnQgbW9kdWxlUmVzb2x1dGlvbiBmcm9tICcuLi9zaGFyZWQvdml0ZU1vZHVsZVJlc29sdXRpb24nXG5pbXBvcnQgdml0ZUNvcHlFc20gZnJvbSAnLi92aXRlQ29weUVzbSdcblxuY29uc3QgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoaW1wb3J0Lm1ldGEudXJsKVxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kIH0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBiYXNlOiAnL2dob3N0L2NsYXNzaWMtZWRpdG9yJyxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnYnVpbGQnLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDoge1xuICAgICAgICAgIG1haW46IG5ldyBVUkwoJy4vaW5kZXguaHRtbCcsIGltcG9ydC5tZXRhLnVybCkucGF0aG5hbWUsXG4gICAgICAgICAgc3BsaXQ6IG5ldyBVUkwoJy4vc3BsaXQvaW5kZXguaHRtbCcsIGltcG9ydC5tZXRhLnVybCkucGF0aG5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIG9ud2Fybih3YXJuaW5nLCB3YXJuKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgd2FybmluZy5jb2RlID09PSAnRVZBTCcgJiZcbiAgICAgICAgICAgIHdhcm5pbmcuaWQgJiZcbiAgICAgICAgICAgIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBleGNhbGlkcmF3XFwvZXhjYWxpZHJhd1tcXFxcL10vLnRlc3QoXG4gICAgICAgICAgICAgIHdhcm5pbmcuaWQsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgd2Fybih3YXJuaW5nKVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52LklTX1BSRUFDVCc6IHByb2Nlc3MuZW52LklTX1BSRUFDVCxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlcGxhY2VDb2RlUGx1Z2luKHtcbiAgICAgICAgcmVwbGFjZW1lbnRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZnJvbTogL19fREVWX18vZyxcbiAgICAgICAgICAgIHRvOiAndHJ1ZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmcm9tOiAncHJvY2Vzcy5lbnYuTEVYSUNBTF9WRVJTSU9OJyxcbiAgICAgICAgICAgIHRvOiBKU09OLnN0cmluZ2lmeShgJHtwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9ufStnaXRgKSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICBiYWJlbCh7XG4gICAgICAgIGJhYmVsSGVscGVyczogJ2J1bmRsZWQnLFxuICAgICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgICAgY29uZmlnRmlsZTogZmFsc2UsXG4gICAgICAgIGV4Y2x1ZGU6ICcvKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICAgZXh0ZW5zaW9uczogWydqc3gnLCAnanMnLCAndHMnLCAndHN4JywgJ21qcyddLFxuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgJ0BiYWJlbC9wbHVnaW4tdHJhbnNmb3JtLWZsb3ctc3RyaXAtdHlwZXMnLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHJlcXVpcmUoJy4uLy4uL3NjcmlwdHMvZXJyb3ItY29kZXMvdHJhbnNmb3JtLWVycm9yLW1lc3NhZ2VzJyksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5vTWluaWZ5OiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgICBwcmVzZXRzOiBbWydAYmFiZWwvcHJlc2V0LXJlYWN0JywgeyBydW50aW1lOiAnYXV0b21hdGljJyB9XV0sXG4gICAgICB9KSxcbiAgICAgIHJlYWN0KCksXG4gICAgICB2aXRlQ29weUVzbSgpLFxuICAgICAgY29tbW9uanMoe1xuICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGZvciBSZWFjdCAxOSAoYXQgbGVhc3QgMTkuMC4wLWJldGEtMjZmMjQ5NjA5My0yMDI0MDUxNClcbiAgICAgICAgLy8gYmVjYXVzZSBAcm9sbHVwL3BsdWdpbi1jb21tb25qcyBkb2VzIG5vdCBhbmFseXplIGl0IGNvcnJlY3RseVxuICAgICAgICBzdHJpY3RSZXF1aXJlczogWy9cXC9ub2RlX21vZHVsZXNcXC8ocmVhY3QtZG9tfHJlYWN0KVxcL1teL11cXC5qcyQvXSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IG1vZHVsZVJlc29sdXRpb24oY29tbWFuZCA9PT0gJ3NlcnZlJyA/ICdzb3VyY2UnIDogJ2RldmVsb3BtZW50JyksXG4gICAgfSxcbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3JvcnkvUHJvamVjdHMvaG9oLWxleGljYWwvcGFja2FnZXMvc2hhcmVkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcm9yeS9Qcm9qZWN0cy9ob2gtbGV4aWNhbC9wYWNrYWdlcy9zaGFyZWQvdml0ZU1vZHVsZVJlc29sdXRpb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3JvcnkvUHJvamVjdHMvaG9oLWxleGljYWwvcGFja2FnZXMvc2hhcmVkL3ZpdGVNb2R1bGVSZXNvbHV0aW9uLnRzXCI7LyoqXG4gKiBDb3B5cmlnaHQgKGMpIE1ldGEgUGxhdGZvcm1zLCBJbmMuIGFuZCBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICpcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE1vZHVsZUV4cG9ydEVudHJ5LFxuICBOcG1Nb2R1bGVFeHBvcnRFbnRyeSxcbiAgUGFja2FnZU1ldGFkYXRhLFxufSBmcm9tICcuLi8uLi9zY3JpcHRzL3NoYXJlZC9QYWNrYWdlTWV0YWRhdGEnO1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7Y3JlYXRlUmVxdWlyZX0gZnJvbSAnbm9kZTptb2R1bGUnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5jb25zdCByZXF1aXJlID0gY3JlYXRlUmVxdWlyZShpbXBvcnQubWV0YS51cmwpO1xuY29uc3Qge3BhY2thZ2VzTWFuYWdlcn0gPVxuICByZXF1aXJlKCcuLi8uLi9zY3JpcHRzL3NoYXJlZC9wYWNrYWdlc01hbmFnZXInKSBhcyB0eXBlb2YgaW1wb3J0KCcuLi8uLi9zY3JpcHRzL3NoYXJlZC9wYWNrYWdlc01hbmFnZXInKTtcblxuY29uc3Qgc291cmNlTW9kdWxlUmVzb2x1dGlvbiA9ICgpID0+IHtcbiAgZnVuY3Rpb24gdG9BbGlhcyhwa2c6IFBhY2thZ2VNZXRhZGF0YSwgZW50cnk6IE1vZHVsZUV4cG9ydEVudHJ5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbmQ6IGVudHJ5Lm5hbWUsXG4gICAgICByZXBsYWNlbWVudDogcGtnLnJlc29sdmUoJ3NyYycsIGVudHJ5LnNvdXJjZUZpbGVOYW1lKSxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIFtcbiAgICAuLi5wYWNrYWdlc01hbmFnZXJcbiAgICAgIC5nZXRQdWJsaWNQYWNrYWdlcygpXG4gICAgICAuZmxhdE1hcCgocGtnKSA9PlxuICAgICAgICBwa2cuZ2V0RXhwb3J0ZWROcG1Nb2R1bGVFbnRyaWVzKCkubWFwKHRvQWxpYXMuYmluZChudWxsLCBwa2cpKSxcbiAgICAgICksXG4gICAgLi4uWydzaGFyZWQnXVxuICAgICAgLm1hcCgobmFtZSkgPT4gcGFja2FnZXNNYW5hZ2VyLmdldFBhY2thZ2VCeURpcmVjdG9yeU5hbWUobmFtZSkpXG4gICAgICAuZmxhdE1hcCgocGtnKSA9PlxuICAgICAgICBwa2cuZ2V0UHJpdmF0ZU1vZHVsZUVudHJpZXMoKS5tYXAodG9BbGlhcy5iaW5kKG51bGwsIHBrZykpLFxuICAgICAgKSxcbiAgXTtcbn07XG5cbmNvbnN0IGRpc3RNb2R1bGVSZXNvbHV0aW9uID0gKGVudmlyb25tZW50OiAnZGV2ZWxvcG1lbnQnIHwgJ3Byb2R1Y3Rpb24nKSA9PiB7XG4gIHJldHVybiBbXG4gICAgLi4ucGFja2FnZXNNYW5hZ2VyLmdldFB1YmxpY1BhY2thZ2VzKCkuZmxhdE1hcCgocGtnKSA9PlxuICAgICAgcGtnXG4gICAgICAgIC5nZXROb3JtYWxpemVkTnBtTW9kdWxlRXhwb3J0RW50cmllcygpXG4gICAgICAgIC5tYXAoKGVudHJ5OiBOcG1Nb2R1bGVFeHBvcnRFbnRyeSkgPT4ge1xuICAgICAgICAgIGNvbnN0IFtuYW1lLCBtb2R1bGVFeHBvcnRzXSA9IGVudHJ5O1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IChbZW52aXJvbm1lbnQsICdkZWZhdWx0J10gYXMgY29uc3QpLm1hcChcbiAgICAgICAgICAgIChjb25kaXRpb24pID0+IHBrZy5yZXNvbHZlKCdkaXN0JywgbW9kdWxlRXhwb3J0cy5pbXBvcnRbY29uZGl0aW9uXSksXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHJlcGxhY2VtZW50cy5maW5kKGZzLmV4aXN0c1N5bmMuYmluZChmcykpO1xuICAgICAgICAgIGlmICghcmVwbGFjZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYEVSUk9SOiBNaXNzaW5nIC4vJHtwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICcuLi8uLicsXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzWzFdLFxuICAgICAgICAgICAgICApfS4gRGlkIHlvdSBydW4gXFxgbnBtIHJ1biBidWlsZFxcYCBpbiB0aGUgbW9ub3JlcG8gZmlyc3Q/YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaW5kOiBuYW1lLFxuICAgICAgICAgICAgcmVwbGFjZW1lbnQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgKSxcbiAgICAuLi5bcGFja2FnZXNNYW5hZ2VyLmdldFBhY2thZ2VCeURpcmVjdG9yeU5hbWUoJ3NoYXJlZCcpXS5mbGF0TWFwKFxuICAgICAgKHBrZzogUGFja2FnZU1ldGFkYXRhKSA9PlxuICAgICAgICBwa2cuZ2V0UHJpdmF0ZU1vZHVsZUVudHJpZXMoKS5tYXAoKGVudHJ5OiBNb2R1bGVFeHBvcnRFbnRyeSkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaW5kOiBlbnRyeS5uYW1lLFxuICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IHBrZy5yZXNvbHZlKCdzcmMnLCBlbnRyeS5zb3VyY2VGaWxlTmFtZSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgKSxcbiAgXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vZHVsZVJlc29sdXRpb24oXG4gIGVudmlyb25tZW50OiAnc291cmNlJyB8ICdkZXZlbG9wbWVudCcgfCAncHJvZHVjdGlvbicsXG4pIHtcbiAgcmV0dXJuIGVudmlyb25tZW50ID09PSAnc291cmNlJ1xuICAgID8gc291cmNlTW9kdWxlUmVzb2x1dGlvbigpXG4gICAgOiBkaXN0TW9kdWxlUmVzb2x1dGlvbihlbnZpcm9ubWVudCk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9yb3J5L1Byb2plY3RzL2hvaC1sZXhpY2FsL3BhY2thZ2VzL2xleGljYWwtcGxheWdyb3VuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3JvcnkvUHJvamVjdHMvaG9oLWxleGljYWwvcGFja2FnZXMvbGV4aWNhbC1wbGF5Z3JvdW5kL3ZpdGVDb3B5RXNtLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9yb3J5L1Byb2plY3RzL2hvaC1sZXhpY2FsL3BhY2thZ2VzL2xleGljYWwtcGxheWdyb3VuZC92aXRlQ29weUVzbS50c1wiOy8qKlxuICogQ29weXJpZ2h0IChjKSBNZXRhIFBsYXRmb3JtcywgSW5jLiBhbmQgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqXG4gKi9cbmltcG9ydCAqIGFzIGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IGNvcHkgZnJvbSAncm9sbHVwLXBsdWdpbi1jb3B5JztcblxuZnVuY3Rpb24gcGFyc2VJbXBvcnRNYXBJbXBvcnRFbnRyaWVzKCkge1xuICBjb25zdCBtID0gLzxzY3JpcHQgdHlwZT1cImltcG9ydG1hcFwiPihbXFxzXFxTXSs/KTxcXC9zY3JpcHQ+L2cuZXhlYyhcbiAgICBmcy5yZWFkRmlsZVN5bmMoJy4vZXNtL2luZGV4Lmh0bWwnLCAndXRmOCcpLFxuICApO1xuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBwYXJzZSBpbXBvcnRtYXAgZnJvbSBlc20vaW5kZXguaHRtbCcpO1xuICB9XG4gIHJldHVybiBPYmplY3QuZW50cmllczxzdHJpbmc+KEpTT04ucGFyc2UobVsxXSkuaW1wb3J0cyk7XG59XG5cbi8vIEZvcmsgbW9kdWxlcyBhcmUgb25seSBwcm9kdWNlZCBieSB0aGUgYnVpbGQgc2NyaXB0XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2aXRlQ29weUVzbSgpIHtcbiAgcmV0dXJuIGNvcHkoe1xuICAgIGhvb2s6ICd3cml0ZUJ1bmRsZScsXG4gICAgdGFyZ2V0czogW1xuICAgICAge2Rlc3Q6ICcuL2J1aWxkL2VzbS8nLCBzcmM6ICcuL2VzbS8qJ30sXG4gICAgICB7ZGVzdDogJy4vYnVpbGQvJywgc3JjOiBbJy4vKi5wbmcnLCAnLi8qLmljbyddfSxcbiAgICAgIC4uLnBhcnNlSW1wb3J0TWFwSW1wb3J0RW50cmllcygpLm1hcCgoW21vZCwgZm5dKSA9PiAoe1xuICAgICAgICBkZXN0OiAnLi9idWlsZC9lc20vZGlzdC8nLFxuICAgICAgICBzcmM6IHBhdGguam9pbihcbiAgICAgICAgICBgLi4vJHttb2QucmVwbGFjZSgvXkAvLCAnJykucmVwbGFjZSgvXFwvL2csICctJyl9YCxcbiAgICAgICAgICAvLyBGb3JrIG1vZHVsZXMgYXJlIG9ubHkgcHJvZHVjZWQgYnkgYnVpbGQtcmVsZWFzZSwgd2hpY2ggaXMgbm90IHJ1blxuICAgICAgICAgIC8vIGluIENJLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IGNob29zaW5nIGRldiBvciBwcm9kXG4gICAgICAgICAgZm4sXG4gICAgICAgICksXG4gICAgICB9KSksXG4gICAgXSxcbiAgICB2ZXJib3NlOiB0cnVlLFxuICB9KTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFRQSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sV0FBVztBQUNsQixTQUFTLGlCQUFBQSxzQkFBcUI7QUFDOUIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyx5QkFBeUI7OztBQ0NsQyxZQUFZLFFBQVE7QUFDcEIsU0FBUSxxQkFBb0I7QUFDNUIsWUFBWSxVQUFVO0FBaEIyTCxJQUFNLDJDQUEyQztBQWtCbFEsSUFBTUMsV0FBVSxjQUFjLHdDQUFlO0FBQzdDLElBQU0sRUFBQyxnQkFBZSxJQUNwQkEsU0FBUSxzQ0FBc0M7QUFFaEQsSUFBTSx5QkFBeUIsTUFBTTtBQUNuQyxXQUFTLFFBQVEsS0FBc0IsT0FBMEI7QUFDL0QsV0FBTztBQUFBLE1BQ0wsTUFBTSxNQUFNO0FBQUEsTUFDWixhQUFhLElBQUksUUFBUSxPQUFPLE1BQU0sY0FBYztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFBQSxJQUNMLEdBQUcsZ0JBQ0Esa0JBQWtCLEVBQ2xCO0FBQUEsTUFBUSxDQUFDLFFBQ1IsSUFBSSw0QkFBNEIsRUFBRSxJQUFJLFFBQVEsS0FBSyxNQUFNLEdBQUcsQ0FBQztBQUFBLElBQy9EO0FBQUEsSUFDRixHQUFHLENBQUMsUUFBUSxFQUNULElBQUksQ0FBQyxTQUFTLGdCQUFnQiwwQkFBMEIsSUFBSSxDQUFDLEVBQzdEO0FBQUEsTUFBUSxDQUFDLFFBQ1IsSUFBSSx3QkFBd0IsRUFBRSxJQUFJLFFBQVEsS0FBSyxNQUFNLEdBQUcsQ0FBQztBQUFBLElBQzNEO0FBQUEsRUFDSjtBQUNGO0FBRUEsSUFBTSx1QkFBdUIsQ0FBQyxnQkFBOEM7QUFDMUUsU0FBTztBQUFBLElBQ0wsR0FBRyxnQkFBZ0Isa0JBQWtCLEVBQUU7QUFBQSxNQUFRLENBQUMsUUFDOUMsSUFDRyxvQ0FBb0MsRUFDcEMsSUFBSSxDQUFDLFVBQWdDO0FBQ3BDLGNBQU0sQ0FBQyxNQUFNLGFBQWEsSUFBSTtBQUM5QixjQUFNLGVBQWdCLENBQUMsYUFBYSxTQUFTLEVBQVk7QUFBQSxVQUN2RCxDQUFDLGNBQWMsSUFBSSxRQUFRLFFBQVEsY0FBYyxPQUFPLFNBQVMsQ0FBQztBQUFBLFFBQ3BFO0FBQ0EsY0FBTSxjQUFjLGFBQWEsS0FBUSxjQUFXLEtBQUssRUFBRSxDQUFDO0FBQzVELFlBQUksQ0FBQyxhQUFhO0FBQ2hCLGdCQUFNLElBQUk7QUFBQSxZQUNSLG9CQUF5QjtBQUFBLGNBQ3ZCO0FBQUEsY0FDQSxhQUFhLENBQUM7QUFBQSxZQUNoQixDQUFDO0FBQUEsVUFDSDtBQUFBLFFBQ0Y7QUFDQSxlQUFPO0FBQUEsVUFDTCxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNMO0FBQUEsSUFDQSxHQUFHLENBQUMsZ0JBQWdCLDBCQUEwQixRQUFRLENBQUMsRUFBRTtBQUFBLE1BQ3ZELENBQUMsUUFDQyxJQUFJLHdCQUF3QixFQUFFLElBQUksQ0FBQyxVQUE2QjtBQUM5RCxlQUFPO0FBQUEsVUFDTCxNQUFNLE1BQU07QUFBQSxVQUNaLGFBQWEsSUFBSSxRQUFRLE9BQU8sTUFBTSxjQUFjO0FBQUEsUUFDdEQ7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUNGO0FBRWUsU0FBUixpQkFDTCxhQUNBO0FBQ0EsU0FBTyxnQkFBZ0IsV0FDbkIsdUJBQXVCLElBQ3ZCLHFCQUFxQixXQUFXO0FBQ3RDOzs7QUNoRkEsWUFBWUMsU0FBUTtBQUNwQixZQUFZQyxXQUFVO0FBQ3RCLE9BQU8sVUFBVTtBQUVqQixTQUFTLDhCQUE4QjtBQUNyQyxRQUFNLElBQUksaURBQWlEO0FBQUEsSUFDdEQsaUJBQWEsb0JBQW9CLE1BQU07QUFBQSxFQUM1QztBQUNBLE1BQUksQ0FBQyxHQUFHO0FBQ04sVUFBTSxJQUFJLE1BQU0sK0NBQStDO0FBQUEsRUFDakU7QUFDQSxTQUFPLE9BQU8sUUFBZ0IsS0FBSyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTztBQUN4RDtBQUdlLFNBQVIsY0FBK0I7QUFDcEMsU0FBTyxLQUFLO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxFQUFDLE1BQU0sZ0JBQWdCLEtBQUssVUFBUztBQUFBLE1BQ3JDLEVBQUMsTUFBTSxZQUFZLEtBQUssQ0FBQyxXQUFXLFNBQVMsRUFBQztBQUFBLE1BQzlDLEdBQUcsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU87QUFBQSxRQUNuRCxNQUFNO0FBQUEsUUFDTixLQUFVO0FBQUEsVUFDUixNQUFNLElBQUksUUFBUSxNQUFNLEVBQUUsRUFBRSxRQUFRLE9BQU8sR0FBRyxDQUFDO0FBQUE7QUFBQTtBQUFBLFVBRy9DO0FBQUEsUUFDRjtBQUFBLE1BQ0YsRUFBRTtBQUFBLElBQ0o7QUFBQSxJQUNBLFNBQVM7QUFBQSxFQUNYLENBQUM7QUFDSDs7O0FGeENnTyxJQUFNQyw0Q0FBMkM7QUFrQmpSLElBQU1DLFdBQVVDLGVBQWNGLHlDQUFlO0FBRTdDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBQzNDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMLE1BQU0sSUFBSSxJQUFJLGdCQUFnQkEseUNBQWUsRUFBRTtBQUFBLFVBQy9DLE9BQU8sSUFBSSxJQUFJLHNCQUFzQkEseUNBQWUsRUFBRTtBQUFBLFFBQ3hEO0FBQUEsUUFDQSxPQUFPLFNBQVMsTUFBTTtBQUNwQixjQUNFLFFBQVEsU0FBUyxVQUNqQixRQUFRLE1BQ1IscURBQXFEO0FBQUEsWUFDbkQsUUFBUTtBQUFBLFVBQ1YsR0FDQTtBQUNBO0FBQUEsVUFDRjtBQUNBLGVBQUssT0FBTztBQUFBLFFBQ2Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04seUJBQXlCLFFBQVEsSUFBSTtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxrQkFBa0I7QUFBQSxRQUNoQixjQUFjO0FBQUEsVUFDWjtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sSUFBSTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixJQUFJLEtBQUssVUFBVSxHQUFHLFFBQVEsSUFBSSxtQkFBbUIsTUFBTTtBQUFBLFVBQzdEO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsTUFBTTtBQUFBLFFBQ0osY0FBYztBQUFBLFFBQ2QsU0FBUztBQUFBLFFBQ1QsWUFBWTtBQUFBLFFBQ1osU0FBUztBQUFBLFFBQ1QsWUFBWSxDQUFDLE9BQU8sTUFBTSxNQUFNLE9BQU8sS0FBSztBQUFBLFFBQzVDLFNBQVM7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFlBQ0VDLFNBQVEsb0RBQW9EO0FBQUEsWUFDNUQ7QUFBQSxjQUNFLFVBQVU7QUFBQSxZQUNaO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFNBQVMsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLFNBQVMsWUFBWSxDQUFDLENBQUM7QUFBQSxNQUM3RCxDQUFDO0FBQUEsTUFDRCxNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixTQUFTO0FBQUE7QUFBQTtBQUFBLFFBR1AsZ0JBQWdCLENBQUMsOENBQThDO0FBQUEsTUFDakUsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU8saUJBQWlCLFlBQVksVUFBVSxXQUFXLGFBQWE7QUFBQSxJQUN4RTtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJjcmVhdGVSZXF1aXJlIiwgInJlcXVpcmUiLCAiZnMiLCAicGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgInJlcXVpcmUiLCAiY3JlYXRlUmVxdWlyZSJdCn0K
