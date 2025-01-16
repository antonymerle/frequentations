"use client";

import { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { Dashboard } from "../components/Dashboard";
import { processCSV } from "../utils/processData";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { DataSource } from "@/lib/types";

export default function Home() {
  const [statistics, setStatistics] = useState<ReturnType<
    typeof processCSV
  > | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>("bayonne");

  const handleDataSourceSelect = async (
    source: "upload" | "bayonne" | "pau"
  ) => {
    setDataSource(source);
    if (source !== "upload") {
      try {
        const response = await fetch(`/api/getData?dataset=${source}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const csvContent = await response.text();
        const processedData = processCSV(csvContent);
        setStatistics(processedData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("An error occurred while loading the data. Please try again.");
      }
    }
  };

  const handleFileUpload = (content: string) => {
    try {
      const processedData = processCSV(content);
      setStatistics(processedData);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert(
        "Une erreur s'est produite lors du traitement du fichier CSV. Veuillez vérifier le format du fichier et réessayer."
      );
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Tableau de bord des fréquentations des BU de l'UPPA
      </h1>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Cette application permet de visualiser les données de fréquentation
        générées par Affluences.
      </h2>

      <div className="py-12">
        {/* {!statistics && <FileUpload onFileUpload={handleFileUpload} />} */}
        {!statistics && (
          <>
            <DataSourceSelector onSelectSource={handleDataSourceSelect} />
            {dataSource === "upload" && (
              <FileUpload onFileUpload={handleFileUpload} />
            )}
          </>
        )}
        {statistics && <Dashboard statistics={statistics} site={dataSource} />}
      </div>
    </main>
  );
}
