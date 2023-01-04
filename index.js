const parsedUrl = new URL(location.href);
console.log(parsedUrl.searchParams.get("partcode")); // "123"

JsBarcode("#barcode", "12345");