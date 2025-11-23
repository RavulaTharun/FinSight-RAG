import PDFUpload from '../PDFUpload';

export default function PDFUploadExample() {
  return (
    <PDFUpload 
      onFileSelect={(file) => console.log('File selected:', file.name)}
      isProcessing={false}
    />
  );
}
