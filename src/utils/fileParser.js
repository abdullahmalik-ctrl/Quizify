import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source to local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const parseFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    try {
        if (extension === 'txt' || extension === 'md') {
            return await readTextFile(file);
        } else if (extension === 'pdf') {
            return await readPdfFile(file);
        } else if (extension === 'docx') {
            return await readDocxFile(file);
        } else {
            throw new Error(`Unsupported file type: .${extension}`);
        }
    } catch (error) {
        console.error("File parsing error:", error);
        throw new Error(`Failed to read file: ${error.message}`);
    }
};

const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

const readPdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText;
};

const readDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};
