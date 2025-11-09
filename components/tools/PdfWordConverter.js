import React, { useState } from 'react';

/**
 * Simple PDF ↔ Word converter powered by the ConvertAPI service.
 * Teachers can bring their own API secret key from https://www.convertapi.com/.
 * We avoid storing any credentials — keys are only used in the current session.
 */
const PdfWordConverter = ({ showToast }) => {
  const [conversionType, setConversionType] = useState('pdf-to-word');
  const [apiSecret, setApiSecret] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setStatusMessage('');
    setDownloadUrl('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    resetState();
    if (file) {
      showToast(`Loaded ${file.name}`, 'info');
    }
  };

  const getEndpoint = () => {
    const safeKey = encodeURIComponent(apiSecret.trim());
    if (!safeKey) return '';

    return conversionType === 'pdf-to-word'
      ? `https://v2.convertapi.com/pdf/to/docx?Secret=${safeKey}`
      : `https://v2.convertapi.com/docx/to/pdf?Secret=${safeKey}`;
  };

  const handleConvert = async () => {
    if (!apiSecret.trim()) {
      showToast('Please provide your ConvertAPI secret key.', 'error');
      return;
    }

    if (!selectedFile) {
      showToast('Choose a file to convert first.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Uploading file to ConvertAPI…');
      setDownloadUrl('');

      const endpoint = getEndpoint();
      const formData = new FormData();
      formData.append('File', selectedFile);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Conversion failed (${response.status}). ${errorText.slice(0, 140)}`);
      }

      const result = await response.json();
      const convertedFile = result?.Files?.[0]?.Url;

      if (!convertedFile) {
        throw new Error('Conversion succeeded but no download link was returned.');
      }

      setDownloadUrl(convertedFile);
      setStatusMessage('Conversion complete! Use the download button below.');
      showToast('Conversion complete! Download your file below.', 'success');
    } catch (error) {
      console.error('ConvertAPI error', error);
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
      setStatusMessage('Fetching converted file…');

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Unable to download the converted document.');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const extension = conversionType === 'pdf-to-word' ? 'docx' : 'pdf';
      const baseName = selectedFile
        ? selectedFile.name.replace(/\.[^/.]+$/, '')
        : 'converted-document';

      link.href = blobUrl;
      link.download = `${baseName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

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
    : '.doc,.docx,.rtf';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">🔄</span>
          PDF ↔ Word Converter
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Convert classroom documents between PDF and Word formats. We use the
          <a
            href="https://www.convertapi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-semibold ml-1"
          >
            ConvertAPI
          </a>
          service — bring your own API secret to keep full control of your data.
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
                onChange={() => {
                  setConversionType('pdf-to-word');
                  resetState();
                }}
              />
              PDF ➜ Word (.docx)
            </label>
            <label className="flex items-center gap-2 text-indigo-800">
              <input
                type="radio"
                name="conversion-type"
                value="word-to-pdf"
                checked={conversionType === 'word-to-pdf'}
                onChange={() => {
                  setConversionType('word-to-pdf');
                  resetState();
                }}
              />
              Word (.doc, .docx, .rtf) ➜ PDF
            </label>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold text-blue-900">2. Enter API secret</h2>
          <p className="text-sm text-blue-800">
            Create a free ConvertAPI account, copy your secret key, and paste it here.
            Your key is stored locally and never shared with our servers.
          </p>
          <input
            type="password"
            placeholder="sk_..."
            value={apiSecret}
            onChange={(event) => setApiSecret(event.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-blue-700">Tip: Use a dedicated key so you can revoke it anytime.</p>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">3. Upload your file</h2>
        <input
          type="file"
          accept={acceptedFormats}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700"
        />
        <p className="text-xs text-gray-500">
          Accepted formats: {conversionType === 'pdf-to-word' ? 'PDF' : 'DOC, DOCX, RTF'}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleConvert}
          disabled={isProcessing}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isProcessing
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
        <div className="bg-gray-900 text-white rounded-xl px-4 py-3 text-sm">
          {statusMessage}
        </div>
      )}

      <section className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold">Safety & privacy tips</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
          <li>Files are sent directly from your browser to ConvertAPI — nothing touches our servers.</li>
          <li>For sensitive documents, delete finished files from the ConvertAPI dashboard.</li>
          <li>Keep an eye on your ConvertAPI usage limits to avoid unexpected charges.</li>
        </ul>
      </section>
    </div>
  );
};

export default PdfWordConverter;
