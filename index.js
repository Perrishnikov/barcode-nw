// https://plainenglish.io/blog/how-to-download-a-file-using-javascript-fec4685c0a22

function downloadFile(url, fileName) {
  fetch(url, {
    method: 'get',
    mode: 'no-cors',
    referrerPolicy: 'no-referrer',
  })
    .then((res) => res.blob())
    .then((res) => {
      const aElement = document.createElement('a');
      aElement.setAttribute('download', fileName);
      const href = URL.createObjectURL(res);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
    });
}

window.addEventListener('load', (e) => {
  try {
    const parsedUrl = new URL(location.href);
    // console.log(`parsedUrl: ${parsedUrl}`);

    const upc = parsedUrl.searchParams.get('upc');
    console.log(`upc: `, upc);

    if (upc) {
      const singleDiv = document.querySelector('#singleDiv');
      singleDiv.classList.remove('hidden');

      const title = parsedUrl.searchParams.get('title');
      console.log(`title: `, title);

      if (title) {
        const titleDiv = document.querySelector('#titleText');
        titleDiv.append(title);
      }

      JsBarcode('#barcode', upc, {
        format: 'UPC',
        width: 3,
        margin: 24,
      });

      const canvas = document.querySelector('#barcode');
      const dataURL = canvas.toDataURL();
      // console.log(dataURL);

      document.querySelector('#singleDownloadButton').onclick = (e) => {
        downloadFile(dataURL, upc);
      };
    }
  } catch (error) {
    // console.log(error);
    const messageDiv = document.querySelector('#message');
    messageDiv.classList.add('error');
    messageDiv.append(`Error: ${error}`);
  }
});
