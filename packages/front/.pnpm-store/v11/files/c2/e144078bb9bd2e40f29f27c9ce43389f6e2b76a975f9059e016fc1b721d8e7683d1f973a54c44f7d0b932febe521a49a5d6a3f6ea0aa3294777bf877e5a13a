# @vitest/istanbul-lib-instrument

[![Build Status](https://img.shields.io/github/actions/workflow/status/vitest-dev/istanbuljs/ci.yml?label=CI&logo=GitHub)](https://github.com/vitest-dev/istanbuljs/actions/workflows/ci.yml)

Istanbul instrumenter library, implemented using `Babel`. The implementation is inspired
by prior art by @dtinth as demonstrated in the `__coverage__` babel plugin.

It provides 2 "modes" of instrumentation.

- An `Instrumenter` API that performs the instrumentation using babel as a library.

- A `programVisitor` function for the Babel AST that can be used by a Babel plugin
  to emit instrumentation for ES6 code directly without any source map
  processing. This is the preferred path for babel users. The Babel plugin is
  called `babel-plugin-istanbul`.
