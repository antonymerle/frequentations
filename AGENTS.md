# Frequentations

Tableau de bord de fréquentation des bibliothèques de l'UPPA.

## Objectif

Analyser et visualiser les données de fréquentation (entrées/sorties) de deux
bibliothèques universitaires : **Bayonne** et **Pau**, issues de la plateforme
Affluences (admin.affluences.com).

## Stack

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 14.2.16 |
| Langage | TypeScript 5 (strict) |
| UI | React 18 |
| Styles | Tailwind CSS 3 + variables CSS + dark mode via next-themes |
| Composants | shadcn/ui (Radix UI primitives, lucide icons) |
| Graphiques | Recharts |
| Parsing CSV | PapaParse |
| Dates | date-fns (locale fr) |
| Formulaires | React Hook Form + Zod |
| Drag & Drop | react-dropzone |

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Dev server sur localhost:3000 |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |

## Architecture

```
app/
├── api/getData/route.ts      API route → sert le CSV depuis public/
├── page.tsx                  Page racine : sélection source → dashboard
├── layout.tsx                Layout global + métadonnées
└── globals.css               Tailwind + variables CSS light/dark

components/
├── Dashboard.tsx             KPI cards + orchestration des graphiques
├── EntriesChart.tsx          Bar chart : entrées par mois (total/samedi/soirée)
├── EveningTimeSlotsChart.tsx Moyenne des sorties par plage horaire 18h-22h
├── SaturdayComparisonChart.tsx Comparatif matin vs après-midi le samedi (Pau uniquement)
├── DataSourceSelector.tsx    Sélection Bayonne / Pau / Upload + tutoriel
└── FileUpload.tsx            Dropzone drag & drop pour import CSV

utils/
└── processData.ts            Parser CSV → statistiques annuelles agrégées

lib/
├── types.ts                  DataSource = "bayonne" | "pau" | "upload" | null
└── utils.ts                  cn() helper (clsx + tailwind-merge)
```

## Data

| Aspect | Détail |
|--------|--------|
| Source | Plateforme Affluences (admin.affluences.com) |
| Fichiers CSV | `public/bayonne-2020-2025.csv`, `public/pau-2020-2025.csv` |
| Colonnes | `"Date","Jour","Entrees","Sorties"` (séparateur : virgule) |
| Format date | `DD/MM/YYYY HH:MM` (ex: `"01/01/2020 00:00"`) |
| Intervalles | 30 minutes (00:00 à 23:30) |
| Période | 2020 à 2025 |
| Lignes par fichier | ~105 217 |
| Taille | ~3,5 Mo |
| Jours actifs | Lundi à vendredi + certains samedis (dimanches : zéro) |
| Bibliothèque fermée | Lignes avec `0,0` ignorées |

### Statistiques calculées

| Metric | Règle |
|--------|-------|
| Entrées totales par mois | Somme de toutes les entrées |
| Entrées le samedi par mois | Filtrage sur jour = "samedi" |
| Entrées en soirée par mois | Plage 18:00 à 22:00 |
| Samedi matin vs après-midi | Matin 9:30–13:00 vs Après-midi 13:00–16:30 |
| Nombre de samedis ouverts | Jours avec >5 entrées |
| Moyenne des sorties par plage horaire | 18:00–21:30, hors week-ends (vendredi+samedi exclus pour Bayonne) |

## Conventions

### Code

- TypeScript strict, zéro `any`
- Alias de chemins `@/*` → racine du projet
- PascalCase pour les composants, camelCase pour les fonctions
- Interface pour les structures de données, `type` pour les unions/littéraux
- `useMemo`/`useState` exclusivement dans les composants React, pas d'effets secondaires dans le render
- Props typées, pas de props non-typées

### UI / Graphiques

- Composants shadcn/ui dans `components/ui/`
- Charts Recharts utilisent `ChartContainer`/`ChartTooltip` de shadcn/ui
- Variables CSS `--chart-1`, `--chart-2` pour les couleurs de graphs
- Chiffres formatés avec `toLocaleString()`
- Date-fns avec `locale: fr` pour le formatage

### Règles métier

- Première ligne `"sep=,"` à strip avant parsing
- Dimanches : systématiquement zéro
- Seuil samedi ouvert : >5 entrées
- Plage soirée : 18:00 à 22:00 inclus
- Bayonne exclut vendredis et samedis du calcul de moyenne en soirée ; Pau inclut tous les jours ouvrés
