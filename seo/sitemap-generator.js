// seo/sitemap-generator.js
export class SitemapGenerator {
  /**
   * Dynamically compiles a valid structural standard XML tracking sitemap from structural zip arrays
   */
  static generateSitemapXml(zipCodesList) {
    const currentDateString = new Date().toISOString().split('T')[0];
    
    let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlOutput += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // System standard high-level routing allocations
    xmlOutput += `  <url>\n    <loc>https://nativeplanr.com/</loc>\n    <lastmod>${currentDateString}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Process collection records sequentially to map structural URL links
    zipCodesList.forEach(zip => {
      xmlOutput += `  <url>\n`;
      xmlOutput += `    <loc>https://nativeplanr.com/directory/zip/${zip}</loc>\n`;
      xmlOutput += `    <lastmod>${currentDateString}</lastmod>\n`;
      xmlOutput += `    <changefreq>monthly</changefreq>\n`;
      xmlOutput += `    <priority>0.8</priority>\n`;
      xmlOutput += `  </url>\n`;
    });

    xmlOutput += `</urlset>`;
    return xmlOutput;
  }
}
