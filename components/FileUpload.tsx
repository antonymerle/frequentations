import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onabort = () => console.log("File reading was aborted");
      reader.onerror = () => console.log("File reading has failed");
      reader.onload = () => {
        const content = reader.result as string;
        onFileUpload(content);
      };

      reader.readAsText(file);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Déposez le fichier CSV d'affluences ici...</p>
      ) : (
        <p>
          Glissez-déposez le fichier CSV d'affluences ici ou cliquez pour le
          sélectionner depuis votre ordinateur
        </p>
      )}
    </div>
  );
}
