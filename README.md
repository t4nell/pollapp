# Pollapp

Pollapp ist eine moderne Angular-Anwendung für die Erstellung und Teilnahme an Umfragen. Die App verbindet ein einfaches Frontend mit einer Supabase-Datenbank und ermöglicht das Verwalten von Umfragen, Fragen und Antworten.

## Funktionen

- Übersicht aller verfügbaren Umfragen
- Detailansicht einzelner Umfragen
- Erstellen neuer Umfragen mit mehreren Fragen und Antwortoptionen
- Speichern von Antworten über eine Datenbankverbindung
- Anzeige von Umfragen, die bald enden

## Technologien

- Angular 21
- TypeScript
- SCSS
- Supabase
- RxJS

## Projekt starten

1. Abhängigkeiten installieren:

```bash
npm install
```

2. Entwicklungsserver starten:

```bash
npm start
```

3. Die Anwendung öffnet anschließend unter:

```text
http://localhost:4200/
```

## Build

Für einen Produktionsbuild:

```bash
npm run build
```

## Konfiguration

Die Supabase-Konfiguration befindet sich in:

```text
src/environments/environment.ts
```

Dort werden die URL und der Schlüssel für die Datenbank hinterlegt.
