import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",
  authDomain: "prayer-projec.firebaseapp.com",
  projectId: "prayer-projec",
  storageBucket: "prayer-projec.firebasestorage.app",
  messagingSenderId: "47966669764",
  appId: "1:47966669764:web:b875d2ea5bf75e3b7b3291"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminRequests = document.getElementById("adminRequests");

const requestCount = document.getElementById("requestCount");
const prayerCount = document.getElementById("prayerCount");
const urgentCount = document.getElementById("urgentCount");
const emailCount = document.getElementById("emailCount");

let requests = [];

async function loadRequests() {

  try {

    const prayerQuery = query(
      collection(db, "prayer_requests"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(prayerQuery);

    requests = [];

    snapshot.forEach((documentSnapshot) => {
      requests.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });

    renderRequests();
    updateStatistics();

  } catch (error) {

    console.error(error);

    adminRequests.innerHTML = `
      <div class="empty">
        Failed to load prayer requests.
      </div>
    `;
  }
}

function renderRequests() {

  if (!requests.length) {
    adminRequests.innerHTML = `
      <div class="empty">
        No prayer requests found.
      </div>
    `;
    return;
  }

  adminRequests.innerHTML = requests.map((request) => {

    const createdDate = request.createdAt?.toDate
      ? request.createdAt.toDate().toLocaleString()
      : "Recently";

    return `
      <article class="request">
        <h3>${escapeHtml(request.title)}</h3>

        <p>${escapeHtml(request.message)}</p>

        <div class="meta">
          <span>Category: ${escapeHtml(request.category)}</span>
          <span>Prayers: ${request.prayerCount || 0}</span>
          <span>Email: ${escapeHtml(request.email)}</span>
          <span>${createdDate}</span>
          ${request.urgent ? '<span>Urgent Request</span>' : ''}
        </div>

        <div class="toolbar">
          <button class="btn warn">Monitor</button>
          <button class="btn approve">Approved</button>
          <button class="btn delete" data-id="${request.id}">
            Delete Request
          </button>
        </div>
      </article>
    `;
  }).join("");

  attachDeleteButtons();
}

function attachDeleteButtons() {

  const deleteButtons = document.querySelectorAll(".delete");

  deleteButtons.forEach((button) => {

    button.addEventListener("click", async () => {

      const requestId = button.dataset.id;

      const confirmed = confirm(
        "Are you sure you want to delete this prayer request?"
      );

      if (!confirmed) return;

      try {

        await deleteDoc(doc(db, "prayer_requests", requestId));

        requests = requests.filter(
          request => request.id !== requestId
        );

        renderRequests();
        updateStatistics();

      } catch (error) {

        console.error(error);

        alert("Failed to delete prayer request.");
      }
    });
  });
}

function updateStatistics() {

  requestCount.textContent = requests.length;

  const totalPrayers = requests.reduce((sum, request) => {
    return sum + (request.prayerCount || 0);
  }, 0);

  prayerCount.textContent = totalPrayers;

  const urgentRequests = requests.filter(
    request => request.urgent
  ).length;

  urgentCount.textContent = urgentRequests;

  emailCount.textContent = totalPrayers;
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadRequests();