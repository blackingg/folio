const path = require("path");
const fs = require("fs");

/**
 * Custom webpack loader for GLSL files that resolves #include directives.
 * Mimics vite-plugin-glsl's include resolution.
 * Returns a JS module that exports the shader string.
 */
module.exports = function glslLoader(source) {
  const basedir = path.dirname(this.resourcePath);

  const resolveIncludes = (code, dir) => {
    return code.replace(
      /^#include\s+(.+?)(?:;|\s*)$/gm,
      (match, includePath) => {
        const cleanPath = includePath.trim().replace(/;$/, "");
        const fullPath = path.resolve(dir, cleanPath);

        // Add the included file as a dependency for watch mode
        this.addDependency(fullPath);

        if (!fs.existsSync(fullPath)) {
          this.emitError(
            new Error(`GLSL include not found: ${cleanPath} (resolved to ${fullPath})`)
          );
          return `// ERROR: include not found: ${cleanPath}`;
        }

        const includeContent = fs.readFileSync(fullPath, "utf8");
        // Recursively resolve nested includes
        return resolveIncludes(includeContent, path.dirname(fullPath));
      }
    );
  };

  const resolved = resolveIncludes(source, basedir);
  return `export default ${JSON.stringify(resolved)};`;
};
