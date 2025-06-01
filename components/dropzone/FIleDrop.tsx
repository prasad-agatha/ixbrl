import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  outline: "none",
  transition: "border .24s ease-in-out",
  background: "var(--bg-dropzone)",
  border: "1px dashed var(--border)",
  borderRadius: "10px",
  color: "var(--color)",
};

const acceptStyle = {
  borderColor: "var(--primary)",
};

const rejectStyle = {
  borderColor: "var(--danger)",
};

const FileDrop = ({ setErrors, onFileSelect }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      // Handle rejected files if needed
      setErrors((pE) => {
        return { ...pE, url: "File Rejected" };
      });
    } else {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileSelect(file);
      setErrors((pE) => {
        return { ...pE, url: "" };
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      "text/html": [".html", ".htm"],
      // "application/zip": [".zip"],
    },
    maxFiles: 1,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragAccept || isDragActive ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <div className="">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <div
          className="flex-center text-center bg-layout px-3 py-4 cr-p"
          style={{ border: "1px dashed #dee2e6", borderRadius: 10, height: 150 }}
        >
          <h6 className="">
            <img src="/icons/upload.svg" alt="-" className="me-3" />
            Drag and drop your file here or <span className="clr-primary fw-600">browse</span>
          </h6>
        </div>
      </div>
      {uploadedFile && (
        <div className="flex-between py-2">
          <div className="f-ellipsis">{uploadedFile.name}</div>
          <img
            src="/icons/delete.svg"
            alt="-"
            className="cr-p mx-2"
            onClick={() => {
              setUploadedFile(null);
              onFileSelect(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileDrop;
