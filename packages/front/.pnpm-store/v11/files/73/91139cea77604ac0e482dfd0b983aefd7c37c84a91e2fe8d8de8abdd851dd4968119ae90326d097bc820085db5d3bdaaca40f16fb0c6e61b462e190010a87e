# supports-terminal-graphics

> Detect which terminal graphics protocols are supported ([Kitty](https://sw.kovidgoyal.net/kitty/graphics-protocol/), [iTerm2](https://iterm2.com/documentation-images.html), [Sixel](https://en.wikipedia.org/wiki/Sixel))

Detects support for terminal graphics protocols using environment variables. This allows apps to choose the best available protocol for displaying images in the terminal.

## Protocols

| Protocol | Quality | Description |
|----------|---------|-------------|
| **Kitty** | Best | Truecolor RGBA, transparency, animation support |
| **iTerm2** | Good | Full color, native macOS rendering |
| **Sixel** | Basic | Palette-based, widely supported legacy protocol |

## Install

```sh
npm install supports-terminal-graphics
```

## Usage

```js
import supportsTerminalGraphics from 'supports-terminal-graphics';

if (supportsTerminalGraphics.stdout.kitty) {
	// Use Kitty graphics protocol (best quality)
} else if (supportsTerminalGraphics.stdout.iterm2) {
	// Use iTerm2 inline images protocol
} else if (supportsTerminalGraphics.stdout.sixel) {
	// Use Sixel protocol
} else {
	// Fall back to ANSI block characters
}
```

You can also check `stderr`:

```js
if (supportsTerminalGraphics.stderr.kitty) {
	// Use Kitty graphics protocol on stderr
}
```

## API

### supportsTerminalGraphics

Returns an object with `stdout` and `stderr` properties, each containing:

- `kitty` - `boolean` - Whether Kitty graphics protocol is supported
- `iterm2` - `boolean` - Whether iTerm2 inline images protocol is supported
- `sixel` - `boolean` - Whether Sixel protocol is supported

### createSupportsTerminalGraphics(stream?)

Create a custom check for a specific stream.

```js
import {createSupportsTerminalGraphics} from 'supports-terminal-graphics';

const support = createSupportsTerminalGraphics(process.stdout);

console.log(support.kitty);  // true or false
console.log(support.iterm2); // true or false
console.log(support.sixel);  // true or false
```

## Terminal Support

| Terminal | Kitty | iTerm2 | Sixel |
|----------|-------|--------|-------|
| Kitty | ✓ | | |
| Ghostty | ✓ | | |
| WezTerm | ✓ | ✓ | ✓ |
| iTerm2 (v3.6+) | ✓ | ✓ | |
| iTerm2 (v2.9.20150512+) | | ✓ | |
| Konsole (22.04+) | ✓ | ✓ | ✓ |
| VS Code (v1.80+) | | ✓ | ✓ |
| Rio | ✓ | ✓ | ✓ |
| Warp | ✓ | | |
| mintty | | ✓ | ✓ |
| mlterm | | | ✓ |

## Related

- [supports-color](https://github.com/chalk/supports-color) - Detect whether a terminal supports color
- [supports-hyperlinks](https://github.com/chalk/supports-hyperlinks) - Detect whether a terminal supports hyperlinks
- [terminal-image](https://github.com/sindresorhus/terminal-image) - Display images in the terminal
