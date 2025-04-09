import { random } from "lodash-es";
import numeral from "numeral";
import moment from "moment";
import streamSaver from "streamsaver";
declare var ZIP: any;
export function toNumber(a: any) {
  return numeral(a).value();
}
export function isNumber(value: any) {
  if (value != null) {
    if (!isNaN(parseFloat(value))) {
      return true;
    } else {
      //Numeral.validate returns false for negative values
      return numeral.validate(value.toString(), numeral.locale());
    }
  } else {
    return false;
  }
}
export function importQueryStrings<T>(url, queryString: T) {
  let newUrl = new URL(url);
  Object.keys(queryString).forEach((x) => {
    newUrl.searchParams.set(x, queryString[x]);
  });
  return newUrl.toString();
}

export function capitalize(text: string) {
  return text
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatNumber(val: number | string, format = "0,0.00") {
  return numeral(val).format(format);
}
export function downloadUrlsAsZip(
  items: {
    name: string;
    url: string;
  }[],
  zipName: string
) {
  const fileStream = streamSaver.createWriteStream(zipName);
  const readableZipStream = new ZIP({
    start(ctrl) {},
    async pull(ctrl) {
      const added: string[] = [];
      for (const item of items) {
        const res = await fetch(item.url, {});
        const stream = () => res.body;
        let name = `${item.name}`;
        if (added.includes(name)) {
          name = `${random(0, 999999)}-${name}`;
        } else {
          added.push(name);
        }
        ctrl.enqueue({
          name,
          stream,
        });
      }

      ctrl.close();
    },
  });

  if (window.WritableStream && readableZipStream.pipeTo) {
    return readableZipStream
      .pipeTo(fileStream)
      .then(() => console.log("done writing"));
  }

  // less optimized
  const writer = fileStream.getWriter();
  const reader = readableZipStream.getReader();
  const pump = () =>
    reader
      .read()
      .then((res) =>
        res.done ? writer.close() : writer.write(res.value).then(pump)
      );

  pump();
}

export function randomString(
  length: number,
  chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) {
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
export function stringToArray(input: string, chunkSize: number = 20): string[] {
  let chunks: string[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    const chunk = input.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}

export function getNumberOfDays(startDate: string, endDate: string): number {
  return Math.ceil(
    Math.abs(
      moment(endDate, "YYYY-MM-DD")
        .endOf("day")
        .diff(moment(startDate, "YYYY-MM-DD").startOf("day"), "days", true)
    )
  );
}

export function calculateRelativePercentage(
  relative: number = 0,
  processed: number
) {
  return relative === 0 ? 0 : ((processed - relative) / relative) * 100;
}

export function base64toBlob(
  b64Data: string,
  contentType = "",
  sliceSize = 512
): Blob {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function filePreviewUrl(file: File) {
  const promise = new Promise<{
    preview_url: string;
    type: string;
  }>((resolve) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      resolve({
        preview_url: e.target.result,
        type: file.type,
      });
    };

    reader.readAsDataURL(file);
  });
  return promise;
}

export function imageUrl(img: any) {
  if (img.images && img.images.length > 0) {
    return img.images[0].path;
  } else {
    return img;
  }
}

export interface Geometry {
  lat: string;
  lng: string;
}

export interface Geometry {
  type: string;
  coordinates: [number, number];
}
export interface Feature {
  placeName: string;
  type: string;
  text: string;
  bbox: number[];
  center: [number, number];
  coodinates: [number, number];
}
