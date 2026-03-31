<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            max-width: 75rem;
            margin: 0 auto;
            padding: 2rem;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          p.description {
            color: #666;
            font-size: 0.875rem;
            margin-bottom: 2rem;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid #ddd;
            font-size: 0.875rem;
          }
          th {
            background: #f8f9fa;
            text-align: left;
            padding: 0.75rem;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
          }
          tr:hover td {
            background: #f8f9fa;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .images {
            font-size: 0.75rem;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p class="description">
          This XML sitemap is used by search engines to discover pages on this site.
          <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs found.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Images</th>
              <th>Last Modified</th>
              <th>Change Freq.</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                </td>
                <td class="images">
                  <xsl:value-of select="count(image:image)"/>
                </td>
                <td>
                  <xsl:value-of select="sitemap:lastmod"/>
                </td>
                <td>
                  <xsl:value-of select="sitemap:changefreq"/>
                </td>
                <td>
                  <xsl:value-of select="sitemap:priority"/>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
