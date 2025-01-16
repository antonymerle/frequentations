import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DataSourceSelectorProps {
  onSelectSource: (source: "upload" | "bayonne" | "pau") => void;
}

export function DataSourceSelector({
  onSelectSource,
}: DataSourceSelectorProps) {
  const [selectedSource, setSelectedSource] = useState<
    "upload" | "bayonne" | "pau"
  >("bayonne");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectSource(selectedSource);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={selectedSource}
          onValueChange={(value: "upload" | "bayonne" | "pau") =>
            setSelectedSource(value)
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bayonne" id="bayonne" />
            <Label htmlFor="bayonne">
              Consulter les statistiques de Bayonne (2020-2024)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pau" id="pau" />
            <Label htmlFor="pau">
              Consulter les statistiques de Pau (2020-2024)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload">Télécharger un fichier csv</Label>
          </div>
        </RadioGroup>
        <Button type="submit">Valider</Button>
      </form>

      {selectedSource === "upload" && (
        <div className="my-12">
          <p className="mb-4">
            Mode d'emploi pour obtenir la visualisation de données depuis le{" "}
            <a
              className="text-blue-600 hover:underline"
              href="https://admin.affluences.com/"
              target="_blank"
            >
              portail d'administration d'Affluences
            </a>
          </p>
          <ul className="pl-4 ">
            <li className="py-4">Aller dans Statistiques/Historique</li>
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
            <li className="py-4 flex space-x-4">
              <p>
                Dans "Fréquentation" vérifier que le type de données cochées
                soient uniquement "Entrées" et "Sorties"
              </p>
              <Image
                alt="type de données"
                src="donnees.jpg"
                width={490}
                height={228}
                className="max-w-40"
              />
            </li>
            <li className="py-4 flex space-x-4">
              <p>
                Choisir la période voulue (il est possible de sélectionner
                plusieurs années)
              </p>
              <Image
                alt="période"
                src="periode.jpg"
                width={524}
                height={138}
                className="max-w-40"
              />
            </li>
            <li className="py-4 flex space-x-4">
              <p>Cliquer sur "Télécharger les statistiques au format .csv"</p>
              <Image
                alt="download csv"
                src="download.jpg"
                width={748}
                height={332}
                className="max-w-40"
              />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
