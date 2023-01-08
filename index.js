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

async function getBlobForZip(url) {
  return await fetch(url, {
    method: 'get',
    mode: 'no-cors',
    referrerPolicy: 'no-referrer',
  }).then((res) => {
    return res.blob();
  });
}

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

const string = '020065100026; 033674001103; 033674003206; 666';
const split = string.split(';');
console.log(split);

const resultsDiv = document.querySelector('#resultsDiv');

for (let index in split) {
  // try {
  let upc = split[index].trim();
  // console.log(upc);

  // create Canvas AFTER Barcode is attempted
  const newDiv = document.createElement('div');
  newDiv.id = `div-${upc}`
  const canvas = document.createElement('canvas');
  canvas.id = `upc-${upc}`;
  canvas.classList.add('generated');

  newDiv.appendChild(canvas);
  resultsDiv.appendChild(newDiv);

  try {
    let result = JsBarcode(`#upc-${upc}`, upc, {
      format: 'UPC',
      width: 3,
      margin: 24,
    });
  } catch (error) {
    // skip the bad UPC's, log them, and continue
    console.log(split[index], ` is bad`);
    document.querySelector(`#div-${upc}`).remove()
    const messageDiv = document.querySelector(`#message`);
    messageDiv.textContent = `Bad UPC: ${upc}`
    messageDiv.classList.add('error');

  }

  // isOkay = true;
  // } catch (error) {

  // }
}
