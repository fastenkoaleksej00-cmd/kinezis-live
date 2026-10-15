import type { LegalDocument } from "./types";

export const privacyDe: LegalDocument = {
  title: "Datenschutzerklärung",
  updated: "15. Oktober 2026",
  intro:
    "KINEZIS LIVE („die App“) ist eine Wellness-Plattform mit Trainerinnen-Feed, Videobibliothek, Kursen, Community-Beiträgen und einem privaten Gesundheitstagebuch. Diese Erklärung beschreibt in einfacher Sprache, welche Daten die App speichert, warum, und was du damit tun kannst.",
  sections: [
    { title: "Wer verantwortlich ist", paragraphs: ["Die App wird vom KINEZIS-Team betrieben. Die juristische Person und ihre Anschrift werden hier vor der Veröffentlichung im App Store und bei Google Play genannt. Bis dahin gehen Fragen an die Kontaktadresse am Ende dieser Seite."] },
    {
      title: "Was wir speichern und warum",
      paragraphs: ["Nur, was die von dir genutzten Funktionen brauchen:"],
      bullets: [
        "Konto: E-Mail-Adresse, Passwort (als Hash bei unserem Authentifizierungsanbieter), Anzeigename. Nötig zum Anmelden und um deine Daten geräteübergreifend zu behalten.",
        "Profil: Foto, Banner, Kurzbeschreibung, Interessen, Ziel. Für andere nur sichtbar, wenn „Profil sichtbar“ eingeschaltet bleibt.",
        "Gesundheitstagebuch: Größe, Geburtsdatum, Gewichts- und Taillenmessungen, Aktivitätsniveau, Trainingserfahrung. Nur für dich sichtbar. Nie anderen Mitgliedern gezeigt, nie weitergegeben, nie für Werbung genutzt.",
        "Aktivität: als erledigt markierte Einheiten, Wiedergabefortschritt, abgeschlossene Lektionen, Gespeichertes. Für deine Statistik und zum Fortsetzen von Videos.",
        "Soziales: deine Beiträge, Fotos und Videos, Kommentare, Likes und private Nachrichten mit der Trainerin. Beiträge und Kommentare sind in der App sichtbar, Nachrichten nur für dich und die Trainerin.",
        "Einstellungen: Sprache, Benachrichtigungs- und Erinnerungswahl, Privatsphäre-Schalter.",
        "Technisches: Sitzungs-Cookies für die Anmeldung, ein Cookie mit der Sprache und Standard-Serverprotokolle (IP-Adresse, Zeit, aufgerufene Seite), die unser Hosting-Anbieter aus Sicherheitsgründen führt.",
      ],
    },
    { title: "Was wir nicht tun", paragraphs: [], bullets: ["Wir verkaufen oder vermieten deine Daten nicht.", "Wir zeigen keine Werbung und nutzen keine Werbe-Tracker.", "Wir lesen keine Daten aus Apple Health, Google Fit oder Gerätesensoren. Käme eine solche Funktion hinzu, fragt sie pro Datentyp ausdrücklich um Erlaubnis und wird vorher hier beschrieben.", "Wir stellen keine medizinischen Diagnosen. Werte wie der BMI sind nur eine Orientierung."] },
    { title: "Wo Daten verarbeitet werden", paragraphs: ["Daten liegen bei Supabase (Datenbank, Authentifizierung, Dateispeicher) in der Europäischen Union (Region Frankfurt) und werden über Vercel (Hosting) ausgeliefert. Beide handeln als Auftragsverarbeiter nach ihren Standard-Datenverarbeitungsbedingungen. Hochgeladene Videos und Fotos liegen in derselben Region."] },
    { title: "Rechtsgrundlage", paragraphs: ["Konto-, Profil-, Aktivitäts- und Sozialdaten verarbeiten wir zur Erbringung des Dienstes, für den du dich angemeldet hast (Vertragserfüllung). Einträge im Gesundheitstagebuch verarbeiten wir nur mit deiner ausdrücklichen Einwilligung, die du durch die Eingabe gibst und durch Löschen der Einträge oder des Kontos widerrufen kannst. Technische Protokolle beruhen auf unserem berechtigten Interesse an Sicherheit."] },
    { title: "Wie lange wir Daten behalten", paragraphs: ["Solange dein Konto besteht. Löschst du dein Konto in den Einstellungen, werden Profil, Gespeichertes, Fortschritt, Messungen, Aktivität, Beiträge, Kommentare, Likes und Nachrichten sofort und dauerhaft gelöscht. Hochgeladene Dateien werden mit dem Konto entfernt. Serverprotokolle rotiert der Hosting-Anbieter innerhalb von 30 Tagen."] },
    { title: "Deine Rechte", paragraphs: ["Du kannst jederzeit:"], bullets: ["Deine Daten in Profil, Meine Gesundheit und Einstellungen einsehen und ändern.", "Einzelne Messungen, Aktivitätseinträge, Beiträge und Kommentare löschen.", "Dein ganzes Konto unter Einstellungen → Konto löschen. Das ist endgültig.", "Eine Kopie deiner Daten oder eine Berichtigung über die Kontaktadresse unten anfordern. Wir antworten innerhalb von 30 Tagen.", "Dich bei deiner Datenschutzbehörde beschweren, wenn du deine Rechte verletzt siehst."] },
    { title: "Kinder", paragraphs: ["Die App richtet sich an Personen ab 16 Jahren. Wir legen wissentlich keine Konten für jüngere Nutzer an; glaubst du, ein Kind hat sich registriert, kontaktiere uns, und wir entfernen das Konto."] },
    { title: "Änderungen", paragraphs: ["Ändert sich diese Erklärung wesentlich, zeigen wir einen Hinweis in der App und aktualisieren das Datum oben."] },
    { title: "Kontakt", paragraphs: ["Fragen zum Datenschutz: über die Kontaktadresse unter diesem Dokument."] },
  ],
};

export const termsDe: LegalDocument = {
  title: "Nutzungsbedingungen",
  updated: "15. Oktober 2026",
  intro: "Diese Bedingungen beschreiben, wie KINEZIS LIVE genutzt werden darf. Mit dem Erstellen eines Kontos stimmst du ihnen zu.",
  sections: [
    { title: "Was die App ist", paragraphs: ["KINEZIS LIVE bietet Bewegungseinheiten, Face-Fitness-Kurse, Informationen zur Hautpflege, Ernährungsbeispiele und eine Community rund um die KINEZIS-Trainerinnen. Die Inhalte unterstützen Prävention und Regeneration durch Bewegung. Sie sind keine medizinische Versorgung."] },
    { title: "Kein medizinischer Rat", paragraphs: ["Die Trainerinnen sind keine Ärztinnen oder Ernährungsberaterinnen. Nichts in der App diagnostiziert, behandelt oder garantiert Ergebnisse. Sprich vor dem Training mit einer Fachperson, wenn du schwanger, verletzt, krank oder unsicher bist, und brich jede Übung ab, die Schmerzen verursacht. Du nutzt die Inhalte auf eigene Verantwortung."] },
    { title: "Dein Konto", paragraphs: ["Du musst mindestens 16 Jahre alt sein. Halte dein Passwort geheim; du bist für Aktivitäten unter deinem Konto verantwortlich. Eine Person, ein Konto."] },
    { title: "Deine Inhalte", paragraphs: ["Alle Rechte an deinen Fotos, Videos, Beiträgen, Kommentaren und Nachrichten bleiben bei dir. Du räumst KINEZIS LIVE eine nicht-exklusive Lizenz ein, sie in der App zu speichern und anzuzeigen, damit die Funktionen arbeiten. Du kannst deine Inhalte jederzeit löschen.", "Veröffentliche nur, was du selbst erstellt hast oder teilen darfst. Keine fremden Fotos oder Videos, keine urheberrechtlich geschützte Musik, keine Personen ohne ihre Zustimmung."] },
    { title: "Community-Regeln", paragraphs: ["Die Community ist ein freundlicher, unterstützender Ort. Nicht erlaubt:"], bullets: ["Belästigung, Beleidigungen, Diskriminierung oder Drohungen.", "Medizinische Behauptungen, Diätvorschriften oder als professionell dargestellte Ratschläge.", "Werbung, Spam, Links zu anderen Diensten.", "Nacktheit oder sexuelle Inhalte, Gewalt, illegale Inhalte."] },
    { title: "Moderation", paragraphs: ["Trainerin und Administratoren dürfen Inhalte ausblenden oder löschen und Konten sperren, die gegen diese Regeln verstoßen, bei Bedarf ohne Vorankündigung."] },
    { title: "Inhalte der Trainerinnen", paragraphs: ["Videos, Kurse und Texte der Trainerinnen gehören KINEZIS. Du darfst sie in der App privat ansehen. Herunterladen, erneut hochladen, aufzeichnen oder weiterverbreiten ist nicht erlaubt."] },
    { title: "Abonnements", paragraphs: ["Manche Inhalte können als Premium gekennzeichnet sein. Derzeit werden in der App keine Zahlungen abgewickelt. Mit dem Start bezahlter Pläne werden Preise, Verlängerung und Kündigung vor jedem Kauf angezeigt und in diese Bedingungen aufgenommen. Käufe über App Store oder Google Play unterliegen den Erstattungsregeln des Stores."] },
    { title: "Verfügbarkeit und Änderungen", paragraphs: ["Wir können Funktionen ändern, pausieren oder einstellen. Wir bemühen uns um Verfügbarkeit, können aber keinen unterbrechungsfreien Betrieb garantieren. Diese Bedingungen können aktualisiert werden; das Datum oben zeigt die aktuelle Fassung."] },
    { title: "Haftung", paragraphs: ["Soweit gesetzlich zulässig haftet KINEZIS LIVE nicht für Verletzungen oder Verluste durch das Training mit Inhalten der App oder durch Community-Inhalte anderer Mitglieder."] },
    { title: "Kontakt", paragraphs: ["Fragen zu diesen Bedingungen: über die Kontaktadresse unter diesem Dokument."] },
  ],
};
