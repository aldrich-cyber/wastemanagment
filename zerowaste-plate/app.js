// We are using Firebase v9+ modular SDK via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7JaYrSlw_yU7y-n_-M-UhOOe-1CgeJkw",
  authDomain: "waste-7f4bf.firebaseapp.com",
  projectId: "waste-7f4bf",
  storageBucket: "waste-7f4bf.firebasestorage.app",
  messagingSenderId: "250953495224",
  appId: "1:250953495224:web:ddafd546dce90486ef7a4d",
  measurementId: "G-580L9DZDRH"
};

let app, auth, db, analytics;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Error initializing Firebase", error);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    window.scrollToDonate = function() {
        document.querySelector('#donate').scrollIntoView({ behavior: 'smooth' });
    }

    // --- Get Involved UI Interactivity ---
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all
            optionCards.forEach(c => {
                c.classList.remove('active');
                const icon = c.querySelector('.icon-wrapper');
                icon.classList.remove('green-bg');
                icon.classList.add('light-bg');
            });
            // Add active class to clicked
            card.classList.add('active');
            const icon = card.querySelector('.icon-wrapper');
            icon.classList.remove('light-bg');
            icon.classList.add('green-bg');
        });
    });

    // --- Volunteer Sign-Up Form ---
    const signupForm = document.getElementById('signup-form');
    const signupMessage = document.getElementById('signup-message');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const role = document.querySelector('input[name="role"]:checked').value;
            
            const submitBtn = document.getElementById('submit-signup');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Signing up...';
            submitBtn.disabled = true;

            try {
                if (auth && db) {
                    // Create user in Firebase Auth
                    const userCredential = await createUserWithEmailAndPassword(auth, email, "TempPass123!");
                    const user = userCredential.user;
                    
                    // Save additional data to Firestore
                    await addDoc(collection(db, "volunteers"), {
                        uid: user.uid,
                        name: fullname,
                        email: email,
                        role: role,
                        createdAt: new Date()
                    });
                } else {
                    // Mock delay for prototype
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log(`Mock sign up: ${fullname}, ${email}, ${role}`);
                }

                signupMessage.textContent = `Welcome aboard, ${fullname}! We'll contact you soon.`;
                signupMessage.className = 'message success';
                signupForm.reset();
            } catch (error) {
                console.error("Sign up error:", error);
                signupMessage.textContent = error.message || "An error occurred. Please try again.";
                signupMessage.className = 'message error';
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // --- Donate Form UI Interactivity ---
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    const donateBtn = document.getElementById('donate-btn');

    let currentAmount = 25;

    const updateDonateButton = (amount) => {
        donateBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Donate $${amount}`;
    };

    amountBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active state
            amountBtns.forEach(b => b.classList.remove('active'));
            // Add active state
            e.target.classList.add('active');
            
            currentAmount = e.target.getAttribute('data-amount');
            customAmountInput.value = ''; // clear custom amount
            updateDonateButton(currentAmount);
        });
    });

    customAmountInput.addEventListener('input', (e) => {
        if (e.target.value) {
            amountBtns.forEach(b => b.classList.remove('active'));
            currentAmount = e.target.value;
            updateDonateButton(currentAmount);
        } else {
            // If empty, revert to default
            document.querySelector('.amount-btn[data-amount="25"]').classList.add('active');
            currentAmount = 25;
            updateDonateButton(currentAmount);
        }
    });

    donateBtn.addEventListener('click', () => {
        if(currentAmount > 0) {
            alert(`Thank you for choosing to donate $${currentAmount}! (This is a prototype, no real payment was processed)`);
        }
    });
});
