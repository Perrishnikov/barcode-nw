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
    console.log(`single upc: `, upc);

    if (upc) {
      const singleDiv = document.querySelector('#singleDiv');
      singleDiv.classList.remove('hidden');

      const title = parsedUrl.searchParams.get('title');
      console.log(`single title: `, title);

      const titleDiv = document.querySelector('#titleText');

      if (title) {
        titleDiv.append(title);
      } else {
        titleDiv.textContent = '';
      }
      try {
        JsBarcode('#barcode', upc, {
          format: 'UPC',
          width: 3,
          margin: 24,
        });

        const canvas = document.querySelector('#barcode');
        const dataURL = canvas.toDataURL();
        // console.log(dataURL);
        const singleDownloadButton = document.querySelector(
          '#singleDownloadButton'
        );

        singleDownloadButton.disabled = false;
        singleDownloadButton.onclick = (e) => {
          downloadFile(dataURL, upc);
        };
        singleDownloadButton.classList.add('go');
      } catch (error) {
        // console.log(error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Bad UPC: "${upc}"`;
        errorDiv.classList.add('error');
        messageDiv.appendChild(errorDiv);
      }
    }
  } catch (error) {
    // console.log(error);
    const errorDiv = document.querySelector('#message');
    errorDiv.classList.add('error');
    errorDiv.append(`Error: ${error}`);
  }
});

async function getBlobForZip(url) {
  return await fetch(url, {
    method: 'get',
    mode: 'no-cors',
    referrerPolicy: 'no-referrer',
  }).then((res) => {
    return res.blob();
  });
}

/* DOWNLOAD button */
document.querySelector('#zipDownloadButton').onclick = async (e) => {
  const bulkBarcodes = document.querySelectorAll('.generated');

  const blobs = await Promise.all(
    [...bulkBarcodes].map(async (element) => {
      // console.log(element);

      const dataURL = element.toDataURL();
      // console.log(dataURL);
      const upc = element.id.substring(4);
      // console.log(`substring upc: `, upc);
      const blob = await getBlobForZip(dataURL);
      // console.log(`blob: `, blob);

      return { blob: blob, upc: upc };
    })
  );

  //Required JS Zip
  const zip = JSZip();

  for (const item of blobs) {
    // console.log(item);
    zip.file(`${item.upc}.png`, item.blob);
  }

  // Required Filesaver
  zip.generateAsync({ type: 'blob' }).then((zipFile) => {
    const fileName = `nw-barcodes.zip`;
    return saveAs(zipFile, fileName);
  });
};

/* GENERATE button */
document.querySelector('#generateButton').onclick = (e) => {
  // const demo = '020065100026; 033674001103; 033674003206; 666. 033674003206, hello, ';

  const textPartcodes = document.querySelector('#partcodeEntry');
  const string = textPartcodes.value;

  if (!string) {
    return;
  }

  const split = string.split(/;|,|\.|\r|\n/).map((item) => item.trim());
  // console.log(split);

  const resultsDiv = document.querySelector('#resultsDiv');

  // hold all the bad UPC's
  const errorUPCs = [];

  for (const index in split) {
    const upc = split[index].trim();
    // console.log(upc);

    const newDiv = document.createElement('div');
    newDiv.id = `div-${upc}`;
    const canvas = document.createElement('canvas');
    canvas.id = `upc-${upc}`;
    canvas.classList.add('generated');

    newDiv.appendChild(canvas);
    resultsDiv.appendChild(newDiv);

    try {
      JsBarcode(`#upc-${upc}`, upc, {
        format: 'UPC',
        width: 3,
        margin: 24,
      });
    } catch (error) {
      // console.log(error);
      // removed bad Canvas AFTER Barcode is attempted
      document.querySelector(`#div-${upc}`).remove();
      errorUPCs.push(upc);
    }
  }

  // enable Downlaod button
  const downloadButton = document.querySelector('#zipDownloadButton');
  downloadButton.classList.add('go');
  downloadButton.disabled = false;

  // disable Generate Button
  const generateButton = document.querySelector('#generateButton');
  generateButton.disabled = true;

  // hide single stuff
  const singleDiv = document.querySelector('#singleDiv');
  singleDiv.classList.add('hidden');

  // tally the errors, if any
  if (errorUPCs) {
    const messageDiv = document.querySelector(`#messageDiv`);

    errorUPCs.forEach((upc) => {
      const errorDiv = document.createElement('div');
      errorDiv.textContent = `Bad UPC: "${upc}"`;
      errorDiv.classList.add('error');
      messageDiv.appendChild(errorDiv);
    });
  }
};

/* CLEAR ZIP button */
document.querySelector('#clearZipButton').onclick = () => {
  const text = document.querySelector('#partcodeEntry');
  text.value = '';

  const downloadButton = document.querySelector('#zipDownloadButton');
  downloadButton.classList.remove('go');
  downloadButton.disabled = true;

  // disable Generate Button
  const generateButton = document.querySelector('#generateButton');
  generateButton.disabled = false;

  const messageDiv = document.querySelector(`#messageDiv`);
  messageDiv.innerHTML = '';

  const resultsDiv = document.querySelector('#resultsDiv');
  resultsDiv.innerHTML = '';
};

/* CLEAR Single Button */
document.querySelector('#clearSingleButton').onclick = () => {
  const url = new URL(location.href);
  url.searchParams.delete('upc');
  url.searchParams.delete('title');
  // console.log(url);

  window.location = url.toString();
};
