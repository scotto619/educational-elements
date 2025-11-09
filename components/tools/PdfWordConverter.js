import React, { useEffect, useRef, useState } from 'react';
import {
  createDocxBlob,
  createPdfBlob,
  extractParagraphsFromDocx,
  extractParagraphsFromPdf,
  normaliseParagraphs
} from '../../utils/pdfWordConversion';

/**
 * Offline PDF ↔ Word converter that runs entirely in the browser.
 * The converter focuses on text content so complex layouts may require touch-ups.
 */
const PdfWordConverter = ({ showToast }) => {
  const [conversionType, setConversionType] = useState('pdf-to-word');
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const downloadUrlRef = useRef('');

  useEffect(() => () => {
    if (downloadUrlRef.current) {
      window.URL.revokeObjectURL(downloadUrlRef.current);
    }
  }, []);

  const resetState = () => {
    if (downloadUrlRef.current) {
      window.URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = '';
    }
    setStatusMessage('');
    setDownloadUrl('');
    setDownloadName('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    resetState();
    if (file) {
      showToast(`Loaded ${file.name}`, 'info');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      showToast('Choose a file to convert first.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Processing file…');
      setDownloadUrl('');
      setDownloadName('');

      const baseName = selectedFile.name
        ? selectedFile.name.replace(/\.[^/.]+$/, '')
        : 'converted-document';
      const arrayBuffer = await selectedFile.arrayBuffer();

      if (conversionType === 'pdf-to-word') {
        setStatusMessage('Extracting text from the PDF…');
        const paragraphs = normaliseParagraphs(extractParagraphsFromPdf(arrayBuffer));

        if (!paragraphs.length) {
          throw new Error('No readable text was found in this PDF.');
        }

        setStatusMessage('Building Word document…');
        const blob = createDocxBlob(paragraphs);
        const url = window.URL.createObjectURL(blob);
        downloadUrlRef.current = url;
        setDownloadUrl(url);
        setDownloadName(`${baseName || 'converted-document'}.docx`);
      } else {
        setStatusMessage('Reading Word document…');
        const paragraphs = normaliseParagraphs(await extractParagraphsFromDocx(arrayBuffer));

        if (!paragraphs.length) {
          throw new Error('No readable text was found in this Word document.');
        }

        setStatusMessage('Generating PDF file…');
        const blob = createPdfBlob(paragraphs);
        const url = window.URL.createObjectURL(blob);
        downloadUrlRef.current = url;
        setDownloadUrl(url);
        setDownloadName(`${baseName || 'converted-document'}.pdf`);
      }

      setStatusMessage('Conversion complete! Use the download button below.');
      showToast('Conversion complete! Download your file below.', 'success');
    } catch (error) {
      console.error('Offline conversion error', error);
      const message = error.message || 'Conversion failed. Please try again.';
      setStatusMessage(message);
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      setIsProcessing(true);
      setStatusMessage('Preparing download…');

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadName || 'converted-file';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatusMessage('Downloaded! Check your device for the converted file.');
      showToast('Converted file downloaded successfully.', 'success');
    } catch (error) {
      console.error('Download error', error);
      const message = error.message || 'Download failed.';
      setStatusMessage(message);
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptedFormats = conversionType === 'pdf-to-word'
    ? '.pdf'
    : '.docx';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">🔄</span>
          PDF ↔ Word Converter
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Convert classroom documents between PDF and Word formats without sending
          files to any external services. The converter focuses on text content, so
          heavily formatted layouts may need a quick manual tidy-up afterwards.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">1. Choose conversion</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-indigo-800">
              <input
                type="radio"
                name="conversion-type"
                value="pdf-to-word"
                checked={conversionType === 'pdf-to-word'}
                onChange={(event) => {
                  setConversionType(event.target.value);
                  resetState();
                }}
              />
              <span>PDF to Word (.docx)</span>
            </label>
            <label className="flex items-center gap-2 text-indigo-800">
              <input
                type="radio"
                name="conversion-type"
                value="word-to-pdf"
                checked={conversionType === 'word-to-pdf'}
                onChange={(event) => {
                  setConversionType(event.target.value);
                  resetState();
                }}
              />
              <span>Word (.docx) to PDF</span>
            </label>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">2. Upload document</h2>
          <p className="text-indigo-700 text-sm leading-relaxed">
            {conversionType === 'pdf-to-word'
              ? 'Select a PDF to pull text into a Word document.'
              : 'Select a Word (.docx) document to convert it to a PDF.'}
          </p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-xl px-4 py-10 cursor-pointer bg-white hover:border-indigo-500 transition">
            <span className="text-indigo-600 font-semibold">Click to choose a file</span>
            <span className="text-indigo-400 text-xs mt-1">{conversionType === 'pdf-to-word' ? 'PDF files only' : 'Word (.docx) files only'}</span>
            <input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {selectedFile && (
            <p className="text-xs text-indigo-700 break-all">
              Selected: <span className="font-semibold">{selectedFile.name}</span>
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleConvert}
          disabled={isProcessing || !selectedFile}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isProcessing || !selectedFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isProcessing ? 'Processing…' : 'Convert'}
        </button>
        <button
          onClick={handleDownload}
          disabled={!downloadUrl || isProcessing}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            !downloadUrl || isProcessing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          Download converted file
        </button>
        {selectedFile && (
          <button
            onClick={() => {
              setSelectedFile(null);
              resetState();
            }}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isProcessing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Clear file
          </button>
        )}
      </div>

      {statusMessage && (
        <section className="bg-white border border-indigo-100 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Status
          </h2>
          <p className="text-indigo-800 text-sm leading-relaxed">{statusMessage}</p>
          {downloadUrl && (
            <footer className="mt-3 text-xs text-indigo-600">
              <p className="font-semibold">Saved as: {downloadName}</p>
            </footer>
          )}
        </section>
      )}

      <section className="bg-indigo-900 text-indigo-50 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">Privacy &amp; tips</h2>
        <ul className="text-sm space-y-2 list-disc list-inside opacity-90">
          <li>All conversions run locally in your browser — nothing is uploaded to third-party services.</li>
          <li>The converter keeps text and line breaks but may simplify complex formatting, tables, or images.</li>
          <li>For the cleanest results, start with text-heavy documents. You can always edit the output file afterwards.</li>
        </ul>
      </section>
    </div>
  );
};

export default PdfWordConverter;
