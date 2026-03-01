import React, { useState } from 'react';

const ResourceViewer = ({ resource, onClose }) => {
    const isImage = resource.type === 'image';
    const isPdf = resource.type === 'pdf';
    const isPptx = resource.type === 'pptx';

    const handlePrint = () => {
        if (isImage || isPdf) {
            const printWindow = window.open(resource.src, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } else {
            alert('Printing is only supported for Images and PDFs directly from the browser. Please download the file to print.');
        }
    };

    const handleDownload = (type = 'default') => {
        const link = document.createElement('a');
        if (type === 'pptx' && resource.pptxSrc) {
            link.href = resource.pptxSrc;
            link.download = `${resource.title}_Presentation` || 'download';
        } else {
            link.href = resource.src;
            link.download = `${resource.title}_Guide` || 'download';
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
            {/* Glassmorphic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-7xl h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-200">

                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            {isImage && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            {isPdf && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                            {isPptx && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{resource.title}</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{resource.type}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors font-medium shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                        {isPdf && resource.pptxSrc ? (
                            <div className="flex bg-indigo-600 rounded-xl shadow-sm text-white font-medium divide-x divide-indigo-500 overflow-hidden">
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    PDF
                                </button>
                                <button
                                    onClick={() => handleDownload('pptx')}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    PPTX
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleDownload('default')}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                            </button>
                        )}
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-slate-100/50 relative flex items-center justify-center p-6">
                    {isImage && (
                        <img
                            src={resource.src}
                            alt={resource.title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-slate-200 bg-white"
                        />
                    )}

                    {isPdf && (
                        <iframe
                            src={`${resource.src}#page=1&toolbar=0`}
                            className="w-full h-full rounded-lg shadow-md border border-slate-200 bg-white"
                            title={resource.title}
                        />
                    )}

                    {isPptx && (
                        <div className="text-center space-y-6 bg-white p-12 rounded-3xl shadow-sm border border-slate-200 max-w-md">
                            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-slate-800 mb-2">PowerPoint Presentation</h4>
                                <p className="text-slate-500">
                                    Direct browser viewing is not supported for this file type. Please download the file to view its contents.
                                </p>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Presentation
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceViewer;
