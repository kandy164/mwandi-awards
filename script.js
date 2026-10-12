import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBFIURYxuIuVa6pxieFNI7loavV9r0zW-I',
  authDomain: 'mwandi-media-awards.firebaseapp.com',
  projectId: 'mwandi-media-awards',
  storageBucket: 'mwandi-media-awards.firebasestorage.app',
  messagingSenderId: '189848807909',
  appId: '1:189848807909:web:17de1ee742be475786670c'
};

// Voter session (anonymous). The creator login uses a second, separate app instance
// so signing in as the creator never replaces the voter's identity.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const adminApp = initializeApp(firebaseConfig, 'admin');
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

const nominees = [
  { id: 'nominee-01', name: 'let it be light', category: 'Content Creator', initials: '01', photo: 'nominee-01.jpg' },
  { id: 'nominee-02', name: 'kandy jr', category: 'Content Creator', initials: '02', photo: 'nominee-02.jpg' },
  { id: 'nominee-03', name: 'bakaziba cwani', category: 'Content Creator', initials: '03', photo: 'nominee-03.jpg' },
  { id: 'nominee-04', name: 'we dont force influence', category: 'Content Creator', initials: '04', photo: 'nominee-04.jpg' },
  { id: 'nominee-05', name: 'kima issues comedy', category: 'Content Creator', initials: '05', photo: 'nominee-05.jpg' },
  { id: 'nominee-06', name: 'mabumbu 1', category: 'Content Creator', initials: '06', photo: 'nominee-06.jpg' },
  { id: 'nominee-07', name: 'call me k', category: 'Content Creator', initials: '07', photo: 'nominee-07.jpg' },
];

const grid = document.querySelector('#nominee-grid');
const voteModal = document.querySelector('#vote-modal');
const creatorModal = document.querySelector('#creator-modal');
const selectedName = document.querySelector('#selected-name');
const voteStatus = document.querySelector('#vote-status');
const voteMessage = document.querySelector('#vote-message');
const confirmVote = document.querySelector('#confirm-vote');
const creatorForm = document.querySelector('#creator-form');
const creatorMessage = document.querySelector('#creator-message');
const resultsPanel = document.querySelector('#results-panel');
const resultsList = document.querySelector('#results-list');

let selectedNominee = null;
let myVote = null;      // nominee id this browser voted for, or null
let ready = false;      // true once we know whether this browser has voted

function renderNominees() {
  grid.innerHTML = nominees.map((nominee, index) => {
    const mine = myVote === nominee.id;
    const locked = !ready || myVote !== null;
    return `
    <article class="nominee-card reveal">
      <div class="nominee-photo">
        ${nominee.photo ? '' : '<span class="slot-label">Photo slot · add yours</span>'}<span class="nominee-number">0${index + 1}</span>
        ${nominee.photo ? `<img class="nominee-image" src="${nominee.photo}" alt="${nominee.name} nominee photo" />` : `<div class="photo-placeholder" aria-label="Placeholder for ${nominee.name}">${nominee.initials}</div>`}
      </div>
      <div class="nominee-body">
        <p class="nominee-category">${nominee.category}</p><h3>${nominee.name}</h3>
        <button class="button button-electric vote-button${mine ? ' voted' : ''}" data-id="${nominee.id}" ${locked ? 'disabled' : ''}>${mine ? 'Your vote ✓' : 'Vote for this creator ↗'}</button>
      </div>
    </article>`;
  }).join('');

  grid.querySelectorAll('.vote-button').forEach((button) => button.addEventListener('click', () => openVoteModal(button.dataset.id)));
  grid.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

  voteStatus.textContent = !ready ? 'Connecting…' : myVote ? 'Your vote has been recorded' : 'You have not voted yet';
}

function openModal(modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeModal(modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
function openVoteModal(id) {
  selectedNominee = nominees.find((nominee) => nominee.id === id);
  selectedName.textContent = selectedNominee.name;
  voteMessage.textContent = '';
  openModal(voteModal);
}

// Sign in anonymously, then check whether this browser already voted.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    try { await signInAnonymously(auth); } catch (error) { voteStatus.textContent = 'Could not connect. Please refresh.'; console.error(error); }
    return;
  }
  try {
    const snap = await getDoc(doc(db, 'votes', user.uid));
    myVote = snap.exists() ? snap.data().nominee : null;
    ready = true;
  } catch (error) {
    voteStatus.textContent = 'Could not connect. Please refresh.';
    console.error(error);
    return;
  }
  renderNominees();
});

confirmVote.addEventListener('click', async () => {
  if (!selectedNominee || myVote || !auth.currentUser) return;
  confirmVote.disabled = true;
  voteMessage.textContent = 'Saving your vote…';
  try {
    await setDoc(doc(db, 'votes', auth.currentUser.uid), { nominee: selectedNominee.id, at: serverTimestamp() });
    myVote = selectedNominee.id;
    closeModal(voteModal);
    renderNominees();
  } catch (error) {
    console.error(error);
    voteMessage.textContent = 'Could not save your vote. You may have already voted from this browser.';
  } finally {
    confirmVote.disabled = false;
  }
});

document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => { closeModal(voteModal); closeModal(creatorModal); }));
[voteModal, creatorModal].forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));

// Creator dashboard: email + password, results read straight from Firestore.
document.querySelectorAll('#creator-login-open, #creator-login-open-footer').forEach((button) => button.addEventListener('click', () => {
  creatorForm.reset(); creatorMessage.textContent = ''; resultsPanel.hidden = true; openModal(creatorModal);
}));

creatorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  creatorMessage.textContent = 'Signing in…';
  try {
    await signInWithEmailAndPassword(adminAuth, document.querySelector('#creator-email').value.trim(), document.querySelector('#creator-password').value);
    const snapshot = await getDocs(collection(adminDb, 'votes'));
    const totals = {};
    snapshot.forEach((d) => { const id = d.data().nominee; totals[id] = (totals[id] || 0) + 1; });
    const total = snapshot.size;
    resultsList.innerHTML = nominees
      .map((nominee) => ({ nominee, count: totals[nominee.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .map(({ nominee, count }) => `<div class="result-row"><span>${nominee.name}</span><strong>${count}</strong></div>`).join('')
      + `<div class="result-row"><span>Total votes</span><strong>${total}</strong></div>`;
    creatorMessage.textContent = 'Dashboard unlocked.';
    resultsPanel.hidden = false;
  } catch (error) {
    console.error(error);
    creatorMessage.textContent = 'Could not sign in or read the results. Check your email, password and rules.';
    resultsPanel.hidden = true;
  } finally {
    signOut(adminAuth);
  }
});

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => { const isOpen = siteNav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); });
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => { siteNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .1 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
renderNominees();
