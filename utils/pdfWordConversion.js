const textDecoderLatin1 = new TextDecoder('latin1');
const textDecoderUtf8 = new TextDecoder('utf-8', { fatal: false });
const textEncoder = new TextEncoder();

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(uint8Array) {
  let crc = 0 ^ -1;
  for (let i = 0; i < uint8Array.length; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ uint8Array[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapePdfText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function sanitiseForPdf(value) {
  return value
    .replace(/\r/g, '')
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 32 && code <= 126) {
        return char;
      }
      if (char === '\n') {
        return '\n';
      }
      return '?';
    })
    .join('');
}

function wrapTextForPdf(line, maxChars) {
  const words = line.split(/\s+/);
  const wrapped = [];
  let current = '';

  words.forEach((word) => {
    if (!word) return;
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length <= maxChars) {
      current = tentative;
    } else {
      if (current) {
        wrapped.push(current);
      }
      current = word;
    }
  });

  if (current) {
    wrapped.push(current);
  }

  if (!wrapped.length) {
    wrapped.push('');
  }

  return wrapped;
}

function decodePdfString(rawContent) {
  const bytes = [];
  for (let i = 0; i < rawContent.length; i += 1) {
    const char = rawContent[i];
    if (char === '\\') {
      i += 1;
      const next = rawContent[i];
      if (next === undefined) break;
      switch (next) {
        case 'n':
          bytes.push(10);
          break;
        case 'r':
          bytes.push(13);
          break;
        case 't':
          bytes.push(9);
          break;
        case 'b':
          bytes.push(8);
          break;
        case 'f':
          bytes.push(12);
          break;
        case '\\':
        case '(':
        case ')':
          bytes.push(next.charCodeAt(0));
          break;
        case '\n':
          break;
        case '\r':
          if (rawContent[i + 1] === '\n') {
            i += 1;
          }
          break;
        default: {
          if (/[0-7]/.test(next)) {
            let octal = next;
            for (let j = 0; j < 2; j += 1) {
              const digit = rawContent[i + 1];
              if (digit && /[0-7]/.test(digit)) {
                octal += digit;
                i += 1;
              } else {
                break;
              }
            }
            bytes.push(parseInt(octal, 8));
          } else {
            bytes.push(next.charCodeAt(0));
          }
        }
      }
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }

  if (bytes.length >= 2) {
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return new TextDecoder('utf-16be').decode(new Uint8Array(bytes.slice(2)));
    }
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      return new TextDecoder('utf-16le').decode(new Uint8Array(bytes.slice(2)));
    }
  }

  try {
    return textDecoderUtf8.decode(new Uint8Array(bytes));
  } catch (error) {
    return textDecoderLatin1.decode(new Uint8Array(bytes));
  }
}

function decodeHexString(hexContent) {
  const cleaned = hexContent.replace(/[^0-9A-Fa-f]/g, '');
  const bytes = new Uint8Array(Math.ceil(cleaned.length / 2));
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = cleaned.substr(i, 2);
    bytes[i / 2] = parseInt(byte.padEnd(2, '0'), 16);
  }

  if (bytes.length >= 2) {
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return new TextDecoder('utf-16be').decode(bytes.slice(2));
    }
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      return new TextDecoder('utf-16le').decode(bytes.slice(2));
    }
  }

  try {
    return textDecoderUtf8.decode(bytes);
  } catch (error) {
    return textDecoderLatin1.decode(bytes);
  }
}

export function extractParagraphsFromPdf(arrayBuffer) {
  const pdfContent = textDecoderLatin1.decode(new Uint8Array(arrayBuffer));
  const segments = [];

  const simpleRegex = /\((?:\\.|[^\\)])*\)\s*T[jJ']\b/g;
  let match;
  while ((match = simpleRegex.exec(pdfContent)) !== null) {
    const textMatch = match[0].match(/\((?:\\.|[^\\)])*\)/);
    if (textMatch) {
      segments.push(decodePdfString(textMatch[0].slice(1, -1)));
    }
  }

  const arrayRegex = /\[(.*?)\]\s*TJ/gs;
  while ((match = arrayRegex.exec(pdfContent)) !== null) {
    const arrayContent = match[1];
    const itemRegex = /\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f]+)>/g;
    let itemMatch;
    let combined = '';
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      if (itemMatch[0].startsWith('(')) {
        combined += decodePdfString(itemMatch[0].slice(1, -1));
      } else if (itemMatch[1]) {
        combined += decodeHexString(itemMatch[1]);
      }
    }
    if (combined) {
      segments.push(combined);
    }
  }

  const cleaned = segments
    .join('\n')
    .replace(/\r/g, '')
    .replace(/[\u0000-\u001f]/g, (char) => (char === '\n' ? '\n' : ' '))
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return paragraphs;
}

function buildDocxXml(paragraphs) {
  const bodyContent = paragraphs.length
    ? paragraphs
        .map((paragraph) => {
          if (!paragraph) {
            return '<w:p/>';
          }
          const safe = escapeXml(paragraph)
            .replace(/\r/g, '')
            .replace(/\n/g, '</w:t><w:br/><w:t xml:space="preserve">');
          return `<w:p><w:r><w:t xml:space="preserve">${safe}</w:t></w:r></w:p>`;
        })
        .join('')
    : '<w:p><w:r><w:t>No textual content could be extracted from the PDF.</w:t></w:r></w:p>';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyContent}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function createZipFile(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  });

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const centralOffset = offset;

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, files.length, true);
  eocdView.setUint16(10, files.length, true);
  eocdView.setUint32(12, centralSize, true);
  eocdView.setUint32(16, centralOffset, true);
  eocdView.setUint16(20, 0, true);

  const totalSize = offset + centralSize + eocd.length;
  const output = new Uint8Array(totalSize);
  let cursor = 0;
  localParts.forEach((part) => {
    output.set(part, cursor);
    cursor += part.length;
  });
  centralParts.forEach((part) => {
    output.set(part, cursor);
    cursor += part.length;
  });
  output.set(eocd, cursor);

  return output;
}

export function createDocxBlob(paragraphs) {
  const documentXml = buildDocxXml(paragraphs);
  const files = [
    {
      name: '[Content_Types].xml',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    },
    {
      name: '_rels/.rels',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    },
    {
      name: 'word/document.xml',
      data: documentXml
    }
  ];

  const zipContent = createZipFile(files);
  return new Blob([zipContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

function findEndOfCentralDirectory(view) {
  for (let offset = view.byteLength - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }
  return -1;
}

async function unzip(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const eocdOffset = findEndOfCentralDirectory(view);
  if (eocdOffset < 0) {
    throw new Error('The Word document could not be read (missing ZIP structure).');
  }

  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const centralDirectorySize = view.getUint32(eocdOffset + 12, true);
  const decoder = new TextDecoder();
  const files = {};
  let cursor = centralDirectoryOffset;

  while (cursor < centralDirectoryOffset + centralDirectorySize) {
    const signature = view.getUint32(cursor, true);
    if (signature !== 0x02014b50) {
      break;
    }

    const compression = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);

    const nameBytes = new Uint8Array(arrayBuffer, cursor + 46, nameLength);
    const name = decoder.decode(nameBytes);

    cursor += 46 + nameLength + extraLength + commentLength;

    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedData = new Uint8Array(arrayBuffer, dataOffset, compressedSize);

    let data;
    if (compression === 0) {
      data = new Uint8Array(compressedData);
    } else if (compression === 8) {
      if (typeof DecompressionStream === 'undefined') {
        throw new Error('This browser does not support decompressing Word files offline.');
      }
      const stream = new Response(compressedData).body.pipeThrough(new DecompressionStream('deflate-raw'));
      const responseBuffer = await new Response(stream).arrayBuffer();
      data = new Uint8Array(responseBuffer.slice(0, uncompressedSize || undefined));
    } else {
      throw new Error('Unsupported compression method in Word document.');
    }

    files[name] = data;
  }

  return files;
}

export async function extractParagraphsFromDocx(arrayBuffer) {
  const files = await unzip(arrayBuffer);
  const documentXml = files['word/document.xml'];
  if (!documentXml) {
    throw new Error('The Word document is missing its main content file.');
  }

  const xmlString = textDecoderUtf8.decode(documentXml);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const namespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const paragraphs = Array.from(doc.getElementsByTagNameNS(namespace, 'p'));
  const ELEMENT_NODE = typeof Node === 'undefined' ? 1 : Node.ELEMENT_NODE;

  const lines = paragraphs
    .map((paragraph) => {
      const texts = [];
      paragraph.childNodes.forEach((node) => {
        if (node.nodeType === ELEMENT_NODE) {
          if (node.localName === 'r') {
            node.childNodes.forEach((child) => {
              if (child.nodeType === ELEMENT_NODE) {
                if (child.localName === 't') {
                  texts.push(child.textContent || '');
                } else if (child.localName === 'br') {
                  texts.push('\n');
                }
              }
            });
          } else if (node.localName === 'br') {
            texts.push('\n');
          }
        }
      });

      const combined = texts.join('');
      return combined.replace(/\r/g, '').replace(/\n{2,}/g, '\n').trim();
    })
    .filter(Boolean);

  return lines;
}

export function createPdfBlob(paragraphs) {
  const pageWidth = 612;
  const pageHeight = 792;
  const leftMargin = 72;
  const topMargin = pageHeight - 72;
  const lineHeight = 16;
  const maxChars = 90;

  const contentLines = [];
  paragraphs.forEach((paragraph, index) => {
    const lines = wrapTextForPdf(sanitiseForPdf(paragraph), maxChars);
    lines.forEach((line, lineIndex) => {
      const escaped = escapePdfText(line);
      if (contentLines.length === 0) {
        contentLines.push(`(${escaped}) Tj`);
      } else {
        contentLines.push('T*');
        contentLines.push(`(${escaped}) Tj`);
      }
      if (lineIndex === lines.length - 1 && index !== paragraphs.length - 1) {
        contentLines.push('T*');
      }
    });
  });

  if (!contentLines.length) {
    contentLines.push('(Converted document contained no readable text.) Tj');
  }

  const contentStream = ['BT', '/F1 12 Tf', `${lineHeight} TL`, `1 0 0 1 ${leftMargin} ${topMargin} Tm`, ...contentLines, 'ET'].join('\n');
  const contentBytes = textEncoder.encode(contentStream);

  const objects = [];

  const pushObject = (id, body) => {
    objects.push(`${id} 0 obj\n${body}\nendobj\n`);
  };

  const header = '%PDF-1.4\n';

  pushObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  pushObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  pushObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  pushObject(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`);
  pushObject(5, `<< /Length ${contentBytes.length} >>\nstream\n${contentStream}\nendstream`);

  const body = objects.join('');
  const xref = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f '];
  let offset = header.length;

  objects.forEach((object) => {
    const paddedOffset = offset.toString().padStart(10, '0');
    xref.push(`${paddedOffset} 00000 n `);
    offset += object.length;
  });

  const xrefContent = `${xref.join('\n')}\n`;
  const startXref = header.length + body.length;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  const pdfString = `${header}${body}${xrefContent}${trailer}`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

export function normaliseParagraphs(paragraphs) {
  const seen = new Set();
  return paragraphs
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter((paragraph) => {
      if (!paragraph) return false;
      const key = paragraph.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

