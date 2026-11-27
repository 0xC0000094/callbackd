// Example only. This file names one tool (ESLint). Copy it only if your project uses ESLint.
// Each rule bans a pattern and shows a message that names the fix (agent/templates/check-message.md).
// Replace the paths and the replacement APIs with your own.
export default [
  {
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "react",
          importNames: ["useEffect"],
          message: "no-use-effect: useEffect is not allowed in product code. Use <your data hook> instead. Do not disable this check. Exceptions need a reason, an expiry date, and human approval."
        }],
        patterns: [{
          group: ["**/<server-or-main-dir>/**"],
          message: "no-cross-boundary: <client-dir>/ cannot import <server-or-main-dir>/, not even types. Move the shared type to <shared-dir>/ and import it from there."
        }]
      }],
      "no-restricted-globals": ["error", {
        name: "setTimeout",
        message: "no-timer-fix: a timer hides an ordering problem. Fix the update order, or use <your scheduler>."
      }]
    }
  }
];
