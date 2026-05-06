import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = { apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0", authDomain:"prayer-projec.firebaseapp.com", projectId:"prayer-projec", storageBucket:"prayer-projec.firebasestorage.app", messagingSenderId:"47966669764", appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const notice = document.getElementById("notice");

loginBtn?.addEventListener("click", async ()=>{
 try {
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing In...";
  await signInWithEmailAndPassword(auth,email.value.trim(),password.value);
  window.location.href = "admin.html";
 } catch(error){
  console.error(error);
  notice.textContent = "Invalid credentials or unauthorized account.";
 } finally {
  loginBtn.disabled = false;
  loginBtn.textContent = "Sign In";
 }
});