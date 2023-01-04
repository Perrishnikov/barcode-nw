const parsedUrl = new URL(location.href);
console.log(parsedUrl.searchParams.get("upc"));

JsBarcode("#barcode", "033674156858", {
  format: 'UPC',
  width: 3,
  margin: 24,
  // font: "fantasy"
});