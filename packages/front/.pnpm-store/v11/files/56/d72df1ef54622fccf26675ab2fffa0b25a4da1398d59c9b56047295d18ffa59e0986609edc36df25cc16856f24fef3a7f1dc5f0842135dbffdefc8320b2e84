import { Plugin } from 'vite';
import { AxiosProxyConfig } from 'axios';

interface Options {
	/**
	 * Inject critical CSS as a <style> tag.
	 * default: `true`
	 */
	injectAsStyleTag?: boolean;

	/**
	 * Minify CSS code during the build process.
	 * default: value of `build.minify`
	 */
	minifyCss?: boolean;

	/**
	 * Embed base64-encoded fonts into CSS.
	 * May increase file size if CSS contains multiple references to the same font file.
	 * default: `false`
	 */
	embedFonts?: boolean;

	/**
	 * Load stylesheet asynchronously using `media="print"`.
	 * Only applies when `injectAsStyleTag` is `false`.
	 * default: `true`
	 */
	async?: boolean;

	/**
	 * Persistently store downloaded CSS and font files in a local file cache.
	 * If set to `false`, the existing cache will be deleted.
	 * default: `true`
	 */
	cache?: boolean;

	/**
	 * Proxy configuration for network requests (uses axios).
	 * default: `false`
	 */
	proxy?: false | AxiosProxyConfig;

	/**
	 * Move downloaded font files to a separate subfolder within the assets directory.
	 * default: `''`
	 */
	assetsSubfolder?: string;

	/**
	 * Throw an error and stop the build if any font download or processing fails.
	 * If `false`, errors are logged as warnings and the build continues.
	 * default: `false`
	 */
	throwError?: boolean;

	/**
	 * Restrict downloaded fonts to the specified Unicode subsets (e.g., `['latin', 'latin-ext']`).
	 * Only font files matching these subsets will be included. Leave empty to allow all subsets.
	 * default: `[]`
	 */
	subsetsAllowed?: string[];
}

/**
 * A, Build:
 *    1. [hook] configResolved
 *       ↳ setBase()
 *       ↳ setAssetsDir()
 *       ↳ setMinifyCss()
 *       ↳ setResolvedLogger()
 *
 *    2. [hook] transformIndexHtml
 *       ↳ htmlFiles collect
 *
 *    3. [hook] generateBundle
 *       ↳ setEmitFileFunction()
 *       ↳ setGetFilenameFunction()
 *       ↳ clearWebfontUrlsHtml()
 *       ↳ collectWebfontsFromHtml()
 *       ↳ collectWebfontsFromBundleCss()
 *       ↳ downloadWebfontCss()
 *       ↳ parseFontDefinitions()
 *       ↳ downloadFonts()
 *       ↳ replaceFontUrls()
 *       ↳ formatCss()
 *       ↳ saveCss()
 *       ↳ removeTagsFromHtml()
 *       ↳ injectToHtml()
 *
 *
 * B, Dev server:
 *    1. [hook] configResolved
 *       ↳ setBase()
 *       ↳ setAssetsDir()
 *       ↳ setMinifyCss()
 *       ↳ setResolvedLogger()
 *
 *    2. [hook] configureServer
 *       ↳ setIsDevServer(true)
 *       ↳ setAssetsDir('@webfonts')
 *       ↳ getDevServerMiddlewareCss()
 *       ↳ getDevServerMiddlewareGeneral()
 *
 *    3. [hook] transformIndexHtml
 *       ↳ clearWebfontUrlsHtml()
 *       ↳ collectWebfontsFromHtml()
 *       ↳ removeTagsFromHtml()
 *       ↳ injectToHtml()
 *
 *    4. [middleware] css (@webfonts/webfonts.css)
 *       ↳ loadDevServerFonts()
 *         ↳ downloadWebfontCss()
 *         ↳ parseFontDefinitions()
 *         ↳ replaceFontUrls()
 *         ↳ formatCss()
 *         ↳ fontUrlsDevMap fill
 *       ↳ response: css (text)
 *
 *    5. [middleware] font (assets/xyz.woff2)
 *       ↳ check fontUrlsDevMap
 *       ↳ downloadFont()
 *       ↳ response: font (binary)
 */
declare function viteWebfontDownload(webfontUrls?: string | string[], options?: Options): Plugin;

export { viteWebfontDownload as ViteWebfontDownload, viteWebfontDownload as default, viteWebfontDownload as viteWebfontDl, viteWebfontDownload, viteWebfontDownload as webfontDl, viteWebfontDownload as webfontDownload };
