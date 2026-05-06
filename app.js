import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

/*
========================================
FIREBASE CONFIGURATION
========================================
*/

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

/*
========================================
APPS SCRIPT EMAIL ENDPOINT
========================================
*/

const EMAIL_ENDPOINT = "https://script.google.com/macros/s/AKfycbybp0fuEfyalVu-PHDWeJW6Z2Zbqyqi7huKbCiRjIDRWg5IFBOSU7ciB9b7_4QJ3dLuBg/exec";

/*
========================================
ELEMENTS
========================================
*/

const prayerForm = document.getElementById("prayerForm");
const prayerGrid = document.getElementById("prayerGrid");
const formNotice = document.getElementById("formNotice");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const totalRequestsElement = document.getElementById("totalRequests");
const totalPrayersElement = document.getElementById("totalPrayers");
const urgentRequestsElement = document.getElementById("urgentRequests");

let allRequests = [];

/*
========================================
SUBMIT PRAYER REQUEST
========================================
*/

prayerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Prayer Request...";

    const prayerRequest = {
      title: document.getElementById("title").value.trim(),
      category: document.getElementById("category").value,
      message: document.getElementById("message").value.trim(),
      email: document.getElementById("email").value.trim(),
      urgent: document.getElementById("urgent").value === "true",
      prayerCount: 0,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "prayer_requests"), prayerRequest);

    showNotice(
      "Your prayer request has been posted. People can now pray for you.",
      "success"
    );

    prayerForm.reset();

    await loadPrayerRequests();

  } catch (error) {

    console.error(error);

    showNotice(
      "Something went wrong while submitting your prayer request.",
      "error"
    );

  } finally {

    submitBtn.disabled = false;
    submitBtn.textContent = "Post Prayer Request";
  }
});

/*
========================================
LOAD PRAYER REQUESTS
========================================
*/

async function loadPrayerRequests() {

  try {

    const prayerQuery = query(
      collection(db, "prayer_requests"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(prayerQuery);

    allRequests = [];

    snapshot.forEach((documentSnapshot) => {
      allRequests.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });

    renderPrayerRequests(allRequests);
    updateStatistics();

  } catch (error) {

    console.error(error);

    prayerGrid.innerHTML = `
      <div class="empty">
        Failed to load prayer requests.
      </div>
    `;
  }
}

/*
========================================
RENDER PRAYER REQUESTS
========================================
*/

function renderPrayerRequests(requests) {

  if (!requests.length) {
    prayerGrid.innerHTML = `
      <div class="empty">
        No prayer requests have been submitted yet.
      </div>
    `;
    return;
  }

  prayerGrid.innerHTML = requests.map((request) => {

    const createdDate = request.createdAt?.toDate
      ? request.createdAt.toDate().toLocaleDateString()
      : "Recently";

    return `
      <article class="prayer-card">

        <div class="tag-row">
          <div class="tag">🙏 ${escapeHtml(request.category)}</div>
          ${request.urgent ? '<div class="tag urgent">Urgent</div>' : ''}
        </div>

        <h3>${escapeHtml(request.title)}</h3>

        <p>${escapeHtml(request.message)}</p>

        <div class="card-footer">
          <div class="meta">
            <span>${createdDate}</span>
            <span>❤️ ${request.prayerCount || 0} prayed</span>
          </div>

          <button
            class="btn btn-primary btn-block pray-button"
            data-id="${request.id}"
          >
            Pray For This Request
          </button>
        </div>

      </article>
    `;
  }).join("");

  attachPrayButtons();
}

/*
========================================
PRAY BUTTON LOGIC
========================================
*/

function attachPrayButtons() {

  const prayButtons = document.querySelectorAll(".pray-button");

  prayButtons.forEach((button) => {

    button.addEventListener("click", async () => {

      const requestId = button.dataset.id;

      const prayerRequest = allRequests.find(
        request => request.id === requestId
      );

      if (!prayerRequest) return;

      try {

        button.disabled = true;
        button.textContent = "Sending Prayer...";

        await updateDoc(doc(db, "prayer_requests", requestId), {
          prayerCount: increment(1)
        });

        await fetch(EMAIL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: prayerRequest.email,
            requestTitle: prayerRequest.title,
            requestMessage: prayerRequest.message,
            prayerCount: (prayerRequest.prayerCount || 0) + 1
          })
        });

        button.textContent = "✓ Prayer Sent";

        setTimeout(() => {
          button.textContent = "Pray For This Request";
          button.disabled = false;
        }, 2600);

        await loadPrayerRequests();

      } catch (error) {

        console.error(error);

        button.textContent = "Failed";

        setTimeout(() => {
          button.textContent = "Pray For This Request";
          button.disabled = false;
        }, 2400);
      }
    });
  });
}

/*
========================================
SEARCH + FILTER
========================================
*/

searchInput.addEventListener("input", filterRequests);
categoryFilter.addEventListener("change", filterRequests);

function filterRequests() {

  const searchValue = searchInput.value.toLowerCase().trim();
  const categoryValue = categoryFilter.value;

  const filteredRequests = allRequests.filter((request) => {

    const matchesSearch =
      request.title.toLowerCase().includes(searchValue) ||
      request.message.toLowerCase().includes(searchValue);

    const matchesCategory =
      categoryValue === "all" ||
      request.category === categoryValue;

    return matchesSearch && matchesCategory;
  });

  renderPrayerRequests(filteredRequests);
}

/*
========================================
STATISTICS
========================================
*/

function updateStatistics() {

  totalRequestsElement.textContent = allRequests.length;

  const totalPrayers = allRequests.reduce((sum, request) => {
    return sum + (request.prayerCount || 0);
  }, 0);

  totalPrayersElement.textContent = totalPrayers;

  const urgentCount = allRequests.filter(
    request => request.urgent
  ).length;

  urgentRequestsElement.textContent = urgentCount;
}

/*
========================================
NOTICE SYSTEM
========================================
*/

function showNotice(message, type = "success") {

  formNotice.textContent = message;
  formNotice.className = `notice show ${type}`;

  setTimeout(() => {
    formNotice.className = "notice";
  }, 6000);
}

/*
========================================
UTILITIES
========================================
*/

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
========================================
INITIALIZE
========================================
*/

loadPrayerRequests();