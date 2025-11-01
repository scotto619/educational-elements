const baseMultiCopyHtml = (concept, words, copies) => `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${concept} Multi-Copy List</title><style>@page { size: A4; margin: 15mm; } body { font-family: 'Inter', Arial, sans-serif; color: #0f172a; background: #f1f5f9; } h1 { text-transform: uppercase; letter-spacing: 2px; font-size: 18px; margin-bottom: 16px; text-align: center; } .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; } .card { border: 1px solid #cbd5f5; border-radius: 12px; padding: 14px 18px; background: #fff; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); } .card h2 { font-size: 14px; margin: 0 0 8px; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; } ul { list-style: none; padding: 0; margin: 0; } li { padding: 4px 0; border-bottom: 1px dotted #94a3b8; font-size: 13px; display: flex; justify-content: space-between; } li:last-child { border-bottom: none; }</style></head><body><h1>${concept} – Classroom Copies</h1><div class="grid">${Array.from({ length: copies }).map((_, idx) => `<div class="card"><h2>Copy ${idx + 1}</h2><ul>${words.map((word, index) => `<li><span>${index + 1}.</span><span>${word}</span></li>`).join('')}</ul></div>`).join('')}</div></body></html>`;

export function createDownloadLink(filename, content, mime = 'text/plain') {
  return {
    filename,
    url: `data:${mime};charset=utf-8,${encodeURIComponent(content)}`
  };
}

export function createMultiCopySheet(words, concept, copies = 4) {
  const safeName = concept.replace(/\s+/g, '-').toLowerCase();
  const textHeader = `Focus: ${concept}`;
  const textBody = Array.from({ length: copies })
    .map((_, index) => `Copy ${index + 1}\n${words.join('\n')}`)
    .join('\n\n');
  return {
    textVersion: createDownloadLink(`${safeName}-multi-copy.txt`, `${textHeader}\n\n${textBody}`),
    printableHtml: createDownloadLink(`${safeName}-multi-copy.html`, baseMultiCopyHtml(concept, words, copies), 'text/html')
  };
}

export function createA4DocumentHtml({ title, subtitle, sections, footer }) {
  const sectionHtml = sections
    .map(
      (section) =>
        `<section class="block"><h2>${section.heading}</h2><p>${section.text}</p>${
          section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''
        }</section>`
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${title}</title><style>@page { size: A4; margin: 18mm; } body { font-family: 'Inter', Arial, sans-serif; color: #0f172a; background: #f8fafc; } header { text-align: center; margin-bottom: 18px; } h1 { text-transform: uppercase; letter-spacing: 3px; font-size: 20px; margin: 0 0 6px; } h2 { font-size: 15px; margin: 18px 0 8px; color: #334155; text-transform: uppercase; letter-spacing: 1px; } p { font-size: 13px; line-height: 1.6; margin: 0 0 10px; } ul { margin: 0 0 12px 18px; font-size: 13px; line-height: 1.6; } section { background: #fff; border: 1px solid #cbd5f5; border-radius: 14px; padding: 14px 18px; box-shadow: 0 4px 14px rgba(148, 163, 184, 0.18); } section + section { margin-top: 14px; } footer { text-align: right; font-size: 12px; margin-top: 24px; color: #64748b; }</style></head><body><header><h1>${title}</h1><p>${subtitle}</p></header>${sectionHtml}${
    footer ? `<footer>${footer}</footer>` : ''
  }</body></html>`;
}

export function createCardKitDownload({ id, title, concept, cards, columns = 3 }) {
  const cardHtml = cards
    .map(
      (card) =>
        `<article class="card"><h2>${card.title}</h2>${
          card.subtitle ? `<p class="subtitle">${card.subtitle}</p>` : ''
        }${card.footer ? `<p class="footer">${card.footer}</p>` : ''}</article>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${title}</title><style>@page { size: A4; margin: 15mm; } body { font-family: 'Inter', Arial, sans-serif; background: #f1f5f9; color: #0f172a; } header { text-align: center; margin-bottom: 12px; } h1 { text-transform: uppercase; letter-spacing: 2px; font-size: 19px; margin: 0 0 4px; } h2 { font-size: 16px; margin: 0; color: #1d4ed8; } .subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 6px 0 0; } .footer { font-size: 11px; margin-top: 8px; color: #334155; } .grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 12px; } .card { background: #fff; border-radius: 14px; border: 1px solid #cbd5f5; padding: 14px; box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12); display: flex; flex-direction: column; justify-content: space-between; min-height: 120px; } footer { margin-top: 18px; text-align: right; font-size: 11px; color: #64748b; }</style></head><body><header><h1>${title}</h1><p>${concept}</p></header><div class="grid">${cardHtml}</div><footer>Print on A4, cut along the borders, and laminate for durability.</footer></body></html>`;

  return createDownloadLink(`${id}.html`, html, 'text/html');
}

export function createListDownloads(id, title, concept, words) {
  const printable = [`${title}`, `Focus: ${concept}`, '', ...words].join('\n');
  return {
    download: createDownloadLink(`${id}.txt`, printable),
    multiCopyDownloads: createMultiCopySheet(words, concept)
  };
}

export function createWorksheetDownload({ id, title, concept, directions, tasks }) {
  const html = createA4DocumentHtml({
    title,
    subtitle: concept,
    sections: [
      {
        heading: 'Teacher Directions',
        text: directions
      },
      {
        heading: 'Student Tasks',
        text: 'Work through each task carefully. Use neat handwriting and provide evidence of the spelling focus.',
        list: tasks
      }
    ],
    footer: 'Designed for Level 5 spelling workshops'
  });
  return createDownloadLink(`${id}.html`, html, 'text/html');
}

export function createPassageDownload({ id, title, concept, difficulty, text, focusWords }) {
  const html = createA4DocumentHtml({
    title: `${title} (${difficulty})`,
    subtitle: concept,
    sections: [
      {
        heading: 'Reading Passage',
        text,
        list: focusWords ? [`Focus words: ${focusWords.join(', ')}`] : undefined
      },
      {
        heading: 'Reflection Prompt',
        text: 'Highlight the focus words, discuss how the spelling pattern helps you read accurately, and annotate any unfamiliar vocabulary.'
      }
    ],
    footer: 'Level 5 printable passage'
  });
  return createDownloadLink(`${id}.html`, html, 'text/html');
}
