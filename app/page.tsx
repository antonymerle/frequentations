"use client";

import { useState } from "react";
import Image from "next/image";
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
        "Une erreur s'est produite lors du traitement du fichier CSV. Veuillez vérifier le format du fichier et réessayer."
      );
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Tableau de bord des fréquentations générées par affluences
      </h1>
      <p className="mb-4 text-gray-600">
        Mode d'emploi pour obtenir la visualisation de données depuis le{" "}
        <a
          className="text-blue-600 hover:underline"
          href="https://admin.affluences.com/"
          target="_blank"
        >
          portail d'administration d'Affluences
        </a>
      </p>
      <ul className="pl-4 text-gray-700">
        <li>Aller dans Statistiques/Historique</li>
        <li className="flex space-x-4">
          <p>Vérifiez que la granularité temporelle est sur demi-heure</p>
          <Image
            alt="granularité temporelle"
            src="temporel.jpg"
            width={568}
            height={98}
            className="max-w-40"
          />
        </li>
        <li className="flex space-x-4">
          <p>
            Dans "Fréquentation" vérifier que le type de données cochées soient
            uniquement "Entrées" et "Sorties"
          </p>
          <Image
            alt="type de données"
            src="donnees.jpg"
            width={490}
            height={228}
            className="max-w-40"
          />
        </li>
        <li className="flex space-x-4">
          <p>
            Choisir la période voulue (il est possible de sélectionner plusieurs
            années)
          </p>
          <Image
            alt="période"
            src="periode.jpg"
            width={524}
            height={138}
            className="max-w-40"
          />
        </li>
      </ul>
      <div className="py-12">
        {!statistics && <FileUpload onFileUpload={handleFileUpload} />}
        {statistics && <Dashboard statistics={statistics} />}
      </div>
    </main>
  );
}
