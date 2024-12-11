"use client";

import { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { Dashboard } from "../components/Dashboard";
import { processCSV } from "../utils/processData";

export default function Home() {
  const [statistics, setStatistics] = useState<ReturnType<
    typeof processCSV
  > | null>(null);

  const handleFileUpload = (content: string) => {
    try {
      const processedData = processCSV(content);
      setStatistics(processedData);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert(
        "An error occurred while processing the CSV file. Please check the file format and try again."
      );
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Tableau de bord des fréquentations générées par affluences
      </h1>
      {!statistics && <FileUpload onFileUpload={handleFileUpload} />}
      {statistics && <Dashboard statistics={statistics} />}
    </main>
  );
}
