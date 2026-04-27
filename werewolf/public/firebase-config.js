// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
// Replace these values with your own Firebase project credentials.
// 1. Go to https://console.firebase.google.com/
// 2. Create or open a project
// 3. Add a web app  →  copy the firebaseConfig object here
// 4. Enable Realtime Database (Build → Realtime Database → Create database)
// 5. Set database rules to allow read/write (for testing):
//    { "rules": { ".read": true, ".write": true } }

window.FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
