// seo/metadata-builder.js
export class MetadataBuilder {
  /**
   * Compiles strict schema blocks to turn flat landing structures into explicit botanical records
   */
  static buildSchemaJsonLd(blueprint) {
    const schemaObject = {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      "name": `Native ${blueprint.garden_type} Garden Plan for ZIP ${blueprint.location.zip_code}`,
      "description": blueprint.seo_metadata.meta_description,
      "spatialCoverage": {
        "@type": "Place",
        "geo": {
          "@type": "GeoCoordinates",
          "postalCode": blueprint.location.zip_code,
          "addressCountry": "US"
        }
      },
      "mainEntity": {
        "@type": "CreativeWork",
        "genre": "Landscape Architecture Design Blueprint",
        "keywords": blueprint.seo_metadata.keywords.join(', '),
        "about": blueprint.plant_list.map(plant => ({
          "@type": "Taxon",
          "name": plant.scientific_name,
          "commonName": plant.common_name,
          "taxonRank": "Species"
        }))
      }
    };

    return `<script type="application/ld+json">${JSON.stringify(schemaObject)}</script>`;
  }
}
