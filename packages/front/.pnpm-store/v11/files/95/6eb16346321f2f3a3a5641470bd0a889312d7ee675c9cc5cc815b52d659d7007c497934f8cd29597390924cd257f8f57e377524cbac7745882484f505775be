/**
Terminal graphics protocol support for a stream.
*/
export type TerminalGraphicsSupport = {
	/**
	Whether the Kitty graphics protocol is supported.

	Supported by: Kitty, Ghostty, WezTerm, Konsole (v22.04+), iTerm2 (v3.6+), Rio, Warp.
	*/
	kitty: boolean;

	/**
	Whether the iTerm2 inline images protocol is supported.

	Supported by: iTerm2 (v2.9.20150512+), WezTerm (20220319+), VS Code (v1.80+), Konsole (v22.04+), mintty, Rio (v0.1.13+).
	*/
	iterm2: boolean;

	/**
	Whether the Sixel graphics protocol is supported.

	Supported by: WezTerm (20200620+), VS Code (v1.80+), Konsole (v22.04+), mintty, Rio (v0.1.12+), mlterm.

	Note: Many terminals support Sixel (xterm, foot, etc.) but don't set identifiable environment variables, so detection is limited.
	*/
	sixel: boolean;
};

/**
Check which terminal graphics protocols are supported for a given stream.

@param stream - Optional stream to check for terminal graphics support.
@returns Object with protocol support status.

@example
```
import {createSupportsTerminalGraphics} from 'supports-terminal-graphics';

const support = createSupportsTerminalGraphics(process.stdout);

if (support.kitty) {
	// Use Kitty graphics protocol
} else if (support.iterm2) {
	// Use iTerm2 inline images protocol
} else if (support.sixel) {
	// Use Sixel protocol
} else {
	// Fall back to ANSI block characters
}
```
*/
export function createSupportsTerminalGraphics(stream?: {isTTY?: boolean}): TerminalGraphicsSupport;

/**
Object containing terminal graphics protocol support status for stdout and stderr.
*/
type SupportsTerminalGraphics = {
	/**
	Terminal graphics protocol support for stdout.
	*/
	stdout: TerminalGraphicsSupport;

	/**
	Terminal graphics protocol support for stderr.
	*/
	stderr: TerminalGraphicsSupport;
};

declare const supportsTerminalGraphics: SupportsTerminalGraphics;

export default supportsTerminalGraphics;
