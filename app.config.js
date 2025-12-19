export default {
  expo: {
    name: "student-savings",
    slug: "student-savings",
    android: {
      package: "com.kisetaqa.studentsavings", 
    },
    extra: {
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
      eas: {
        projectId: "391044be-573c-4a01-bce8-3bfdbe7d3f31",
      },
    },
  },
};
