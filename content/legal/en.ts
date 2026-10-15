import type { LegalDocument } from "./types";

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  updated: "15 October 2026",
  intro:
    "KINEZIS LIVE (\"the app\") is a wellness platform with a trainer feed, video library, courses, community posts and a private health diary. This policy explains what data the app stores, why, and what you can do about it. It is written in plain language on purpose.",
  sections: [
    {
      title: "Who is responsible",
      paragraphs: [
        "The app is operated by the KINEZIS team. The legal entity and its registered address will be stated here before the app is published in the App Store and Google Play. Until then, questions go to the contact address at the end of this page.",
      ],
    },
    {
      title: "What we store and why",
      paragraphs: ["We store only what the features you use require:"],
      bullets: [
        "Account: email address, password (stored as a hash by our authentication provider), display name. Needed to sign in and to keep your data across devices.",
        "Profile: photo, banner, short bio, interests, goal. Shown to others only if you keep \"Profile visible\" switched on.",
        "Health diary: height, date of birth, weight and waist measurements, activity level, training experience. Visible only to you. Never shown to other members, never shared, never used for advertising.",
        "Activity: sessions you marked as done, watch progress, completed lessons, saved items. Used for your statistics and to resume videos.",
        "Social: your posts, photos and videos, comments, likes and private messages with the trainer. Visible according to the feature: posts and comments publicly inside the app, messages only to you and the trainer.",
        "Preferences: interface language, notification and reminder choices, privacy switches.",
        "Technical: session cookies to keep you signed in, a cookie with your interface language, and standard server logs (IP address, time, requested page) kept by our hosting provider for security.",
      ],
    },
    {
      title: "What we do not do",
      paragraphs: [],
      bullets: [
        "We do not sell or rent your data.",
        "We do not show advertising and do not use advertising trackers.",
        "We do not read data from Apple Health, Google Fit or any device sensor. If such a feature is added later, it will ask for your explicit permission per data type and will be described here first.",
        "We do not make medical diagnoses. Figures such as BMI are shown as an orientation only.",
      ],
    },
    {
      title: "Where data is processed",
      paragraphs: [
        "Data is stored with Supabase (database, authentication, file storage) in the European Union (Frankfurt region) and served through Vercel (hosting). Both act as processors on our behalf under their standard data processing terms. Uploaded videos and photos are stored in the same region.",
      ],
    },
    {
      title: "Legal basis",
      paragraphs: [
        "We process account, profile, activity and social data to provide the service you signed up for (performance of a contract). Health diary entries are processed only with your explicit consent, which you give by entering them and can withdraw by deleting them or your account. Technical logs are kept on the basis of our legitimate interest in security.",
      ],
    },
    {
      title: "How long we keep data",
      paragraphs: [
        "As long as your account exists. When you delete your account in Settings, your profile, saved items, progress, measurements, activity, posts, comments, likes and messages are deleted immediately and permanently. Uploaded files are removed with the account. Server logs are rotated by the hosting provider within 30 days.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: ["You can at any time:"],
      bullets: [
        "See and change your data in Profile, My health and Settings.",
        "Delete single measurements, activity entries, posts and comments.",
        "Delete your whole account in Settings → Account. This cannot be undone.",
        "Ask for a copy of your data or for correction by writing to the contact address below. We answer within 30 days.",
        "Complain to your local data protection authority if you believe your rights were violated.",
      ],
    },
    {
      title: "Children",
      paragraphs: ["The app is intended for people aged 16 and older. We do not knowingly create accounts for younger users; if you believe a child has registered, contact us and we will remove the account."],
    },
    {
      title: "Changes",
      paragraphs: ["If this policy changes in a way that matters to you, we will show a notice in the app and update the date at the top."],
    },
    {
      title: "Contact",
      paragraphs: ["Questions about privacy: use the contact address shown below this document."],
    },
  ],
};

export const termsEn: LegalDocument = {
  title: "Terms of Use",
  updated: "15 October 2026",
  intro: "These terms describe how KINEZIS LIVE may be used. By creating an account you agree to them.",
  sections: [
    {
      title: "What the app is",
      paragraphs: [
        "KINEZIS LIVE offers movement sessions, face fitness courses, skincare information, nutrition examples and a community around the KINEZIS trainers. The content supports prevention and recovery through movement. It is not medical care.",
      ],
    },
    {
      title: "Not medical advice",
      paragraphs: [
        "The trainers are not doctors or dietitians. Nothing in the app diagnoses, treats or guarantees results. Consult a qualified specialist before exercising if you are pregnant, injured, ill or unsure, and stop any exercise that causes pain. You use the content at your own responsibility.",
      ],
    },
    {
      title: "Your account",
      paragraphs: ["You need to be at least 16 years old. Keep your password private; you are responsible for activity under your account. One person, one account."],
    },
    {
      title: "Your content",
      paragraphs: [
        "You keep all rights to the photos, videos, posts, comments and messages you add. You grant KINEZIS LIVE a non-exclusive licence to store and display them inside the app so the features work. You may delete your content at any time.",
        "Post only what you created or have the right to share. No one else's photos or videos, no copyrighted music, no content showing other people without their consent.",
      ],
    },
    {
      title: "Community rules",
      paragraphs: ["The community is a kind, supportive place. Not allowed:"],
      bullets: [
        "Harassment, insults, discrimination or threats.",
        "Medical claims, diet prescriptions or advice presented as professional.",
        "Advertising, spam, links to other services.",
        "Nudity or sexual content, violence, illegal content.",
      ],
    },
    {
      title: "Moderation",
      paragraphs: ["The trainer and administrators may hide or delete content and suspend accounts that break these rules, without prior notice if needed."],
    },
    {
      title: "Trainer content",
      paragraphs: ["Videos, courses and texts by the trainers belong to KINEZIS. You may watch them in the app for personal use. Downloading, re-uploading, recording or redistributing them is not allowed."],
    },
    {
      title: "Subscriptions",
      paragraphs: [
        "Some content may be marked Premium. At the moment no payments are taken in the app. When paid plans launch, prices, renewal and cancellation terms will be shown before any purchase and added to these terms. Purchases made through the App Store or Google Play follow the store's refund rules.",
      ],
    },
    {
      title: "Availability and changes",
      paragraphs: ["We may change, pause or discontinue features. We try to keep the app available but cannot guarantee uninterrupted service. We may update these terms; the date at the top shows the current version."],
    },
    {
      title: "Liability",
      paragraphs: ["To the extent permitted by law, KINEZIS LIVE is not liable for injuries or losses resulting from exercising with the app's content or from community content posted by other members."],
    },
    {
      title: "Contact",
      paragraphs: ["Questions about these terms: use the contact address shown below this document."],
    },
  ],
};
