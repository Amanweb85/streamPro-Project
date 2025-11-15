const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const watchMode = process.argv.includes("--watch");

// --- Reusable JS build options ---
const createJsBuildOptions = (entryPoint, outfile, globalName) => ({
  // ENTRY points now read from 'src'
  entryPoints: [path.resolve(__dirname, `src/${entryPoint}`)],
  bundle: true,
  // OUTFILE paths now write to 'public/dist'
  outfile: path.resolve(__dirname, `public/dist/${outfile}`),
  format: "iife",
  platform: "browser",
  globalName,
  minify: !watchMode,
  sourcemap: true,
});

// --- Reusable CSS build options ---
const createCssBuildOptions = (entryPoint, outfile) => ({
  // ENTRY points now read from 'src'
  entryPoints: [path.resolve(__dirname, `src/${entryPoint}`)],
  bundle: true,
  // OUTFILE paths now write to 'public/dist'
  outfile: path.resolve(__dirname, `public/dist/${outfile}`),
  minify: !watchMode,
  sourcemap: true,
  loader: { ".css": "css", ".jpg": "file", ".png": "file", ".svg": "file" },
});

// --- Helper function (no changes needed) ---
function addBuildTask(tasks, options) {
  const entryPointPath = options.entryPoints[0];
  if (fs.existsSync(entryPointPath)) {
    tasks.push(options);
  } else {
    console.warn(
      `⚠️  Warning: Entry point not found, skipping build: ${entryPointPath}`
    );
  }
}

async function build() {
  try {
    const allBuildOptions = [];

    // --- Define all potential build tasks with UPDATED paths ---

    addBuildTask(
      allBuildOptions,
      createJsBuildOptions("js/common.js", "common.js", "CommonUtils")
    );
    addBuildTask(
      allBuildOptions,
      createJsBuildOptions("js/player.js", "player.js", "PlayerUtils")
    );
    addBuildTask(
      allBuildOptions,
      createJsBuildOptions("js/autowriting.js", "autowriting.js")
    );

    addBuildTask(
      allBuildOptions,
      createJsBuildOptions("js/search/index.js", "search.js", "SearchUtils")
      // No 'external' needed when using globalName
    );

    addBuildTask(
      allBuildOptions,
      createJsBuildOptions("js/watch/index.js", "watch.js", "WatchUtils")
      // No 'external' needed when using globalName
    );

    addBuildTask(
      allBuildOptions,
      createCssBuildOptions("css/layout.css", "layout.css")
    );

    addBuildTask(
      allBuildOptions,
      createCssBuildOptions("css/search.css", "search.css")
    );

    addBuildTask(
      allBuildOptions,
      createCssBuildOptions("css/watch.css", "watch.css")
    );

    addBuildTask(
      allBuildOptions,
      createJsBuildOptions("js/auth.js", "auth.js", "AuthModule")
    );

    addBuildTask(
      allBuildOptions,
      createCssBuildOptions("css/auth.css", "auth.css")
    );

    // --- Build/watch logic (no changes needed) ---
    if (watchMode) {
      console.log("Setting up watch mode...");
      const contexts = await Promise.all(
        allBuildOptions.map((options) => esbuild.context(options))
      );
      await Promise.all(contexts.map((context) => context.watch()));
      console.log("Initial build complete. Watching for changes...");
    } else {
      await Promise.all(
        allBuildOptions.map((options) => esbuild.build(options))
      );
      console.log("Production build complete!");
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
