// Node module hook: resolve every import of runtime.js to the test hook runtime.
const mock = new URL("./react-mock.js", import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith("/runtime.js")) return { url: mock, shortCircuit: true };
  return nextResolve(specifier, context);
}
