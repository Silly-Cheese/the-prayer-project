import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",
  authDomain:"prayer-projec.firebaseapp.com",
  projectId:"prayer-projec",
  storageBucket:"prayer-projec.firebasestorage.app",
  messagingSenderId:"47966669764",
  appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const verseText = document.getElementById("dailyVerseText");
const verseReference = document.getElementById("dailyVerseReference");
const announcementBar = document.getElementById("announcementBar");
const announcementText = document.getElementById("announcementText");

const fallbackVerses = [
  {
    text: "Come to Me, all who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28"
  },
  {
    text: "Cast all your anxiety on Him because He cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    text: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
    reference: "Psalm 34:18"
  },
  {
    text: "Be strong and courageous. Do not be frightened, for the Lord your God is with you wherever you go.",
    reference: "Joshua 1:9"
  }
];

async function loadDailyContent(){
  try {
    const settingsDoc = await getDoc(doc(db,"settings","site"));

    if(settingsDoc.exists()){
      const data = settingsDoc.data();

      if(data.dailyVerse && verseText){
        verseText.textContent = data.dailyVerse;
      }

      if(data.dailyVerseReference && verseReference){
        verseReference.textContent = data.dailyVerseReference;
      }

      if(data.homepageAnnouncement && announcementBar){
        announcementBar.style.display = "block";
        announcementText.textContent = data.homepageAnnouncement;
      }

      return;
    }
  } catch(error){
    console.error(error);
  }

  const dayIndex = new Date().getDate() % fallbackVerses.length;
  const verse = fallbackVerses[dayIndex];

  if(verseText) verseText.textContent = verse.text;
  if(verseReference) verseReference.textContent = verse.reference;
}

loadDailyContent();