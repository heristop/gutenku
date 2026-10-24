# Installation
> `npm install --save @types/webfontloader`

# Summary
This package contains type definitions for webfontloader (https://github.com/typekit/webfontloader).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/webfontloader.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/webfontloader/index.d.ts)
````ts
export = WebFont;
export as namespace WebFont;

declare namespace WebFont {
    export function load(config: WebFont.Config): void;
    export interface Config {
        /** Setting this to false will disable html classes (defaults to true) */
        classes?: boolean | undefined;
        /** Settings this to false will disable callbacks/events (defaults to true) */
        events?: boolean | undefined;
        /** Time (in ms) until the fontinactive callback will be triggered (defaults to 5000) */
        timeout?: number | undefined;
        /** This event is triggered when all fonts have been requested. */
        loading?(): void;
        /** This event is triggered when the fonts have rendered. */
        active?(): void;
        /** This event is triggered when the browser does not support linked fonts or if none of the fonts could be loaded. */
        inactive?(): void;
        /** This event is triggered once for each font that's loaded. */
        fontloading?(familyName: string, fvd: string): void;
        /** This event is triggered once for each font that renders. */
        fontactive?(familyName: string, fvd: string): void;
        /** This event is triggered if the font can't be loaded. */
        fontinactive?(familyName: string, fvd: string): void;

        /** Child window or iframe to manage fonts for */
        context?: Window | undefined;

        custom?: Custom | undefined;
        google?: Google | undefined;
        typekit?: Typekit | undefined;
        fontdeck?: Fontdeck | undefined;
        monotype?: Monotype | undefined;
    }
    export interface Google {
        api?: string | undefined;
        families: string[];
        text?: string | undefined;
    }
    export interface Typekit {
        id?: string | undefined;
    }
    export interface Custom {
        families?: string[] | undefined;
        urls?: string[] | undefined;
        testStrings?: { [fontFamily: string]: string } | undefined;
    }
    export interface Fontdeck {
        id?: string | undefined;
    }
    export interface Monotype {
        projectId?: string | undefined;
        version?: number | undefined;
        loadAllFonts?: boolean | undefined;
    }
}

````

### Additional Details
 * Last updated: Mon, 20 Nov 2023 23:36:24 GMT
 * Dependencies: none

# Credits
These definitions were written by [SECT](https://github.com/sectsect).
