window.addEventListener('load', (e) => {
  try {
    const parsedUrl = new URL(location.href);
    // console.log(`parsedUrl: ${parsedUrl}`);

    const upc = parsedUrl.searchParams.get('upc');
    console.log(`upc: `, upc);

    const title = parsedUrl.searchParams.get('title');
    console.log(`title: `, title);

    JsBarcode('#barcode', upc, {
      format: 'UPC',
      width: 3,
      margin: 24,
      // font: "fantasy"
    });
  } catch (error) {
    // console.log(error);
    const messageDiv = document.querySelector('#message');
    messageDiv.classList.add('error')
    messageDiv.append(`Error: ${error}`);
  }
});
