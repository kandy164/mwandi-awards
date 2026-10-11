const CREATOR_PIN = '6602'; // Change this before publishing.
const nominees = [
  { id: 'nominee-01', name: 'let it be light', category: 'Content Creator', initials: '01', photo: 'images/nominee-01.jpg' },
  { id: 'nominee-02', name: 'kandy jr', category: 'Content Creator', initials: '02', photo: 'images/nominee-02.jpg' },
  { id: 'nominee-03', name: 'bakaziba cwani', category: 'Content Creator', initials: '03', photo: 'images/nominee-03.jpg' },
  { id: 'nominee-04', name: 'we dont force influence', category: 'Content Creator', initials: '04', photo: 'images/nominee-04.jpg' },
  { id: 'nominee-05', name: 'kima issues comedy', category: 'Content Creator', initials: '05',photo:'images/nominee-05.jpg' },
  { id: 'nominee-06', name: 'mabumbu 1', category: 'Content Creator', initials: '06',photo:'images/nominee-06.jpg' },
  { id: 'nominee-07', name: 'call me k', category: 'Content Creator', initials: '07',photo:'images/nominee-07.jpg' },
];

const grid = document.querySelector('#nominee-grid');
const voteModal = document.querySelector('#vote-modal');
const creatorModal = document.querySelector('#creator-modal');
const selectedName = document.querySelector('#selected-name');
const voteCount = document.querySelector('#vote-count');
const confirmVote = document.querySelector('#confirm-vote');
const creatorForm = document.querySelector('#creator-form');
const creatorMessage = document.querySelector('#creator-message');
const resultsPanel = document.querySelector('#results-panel');
const resultsList = document.querySelector('#results-list');
let selectedNominee = null;

const readVotes = () => JSON.parse(localStorage.getItem('mwandi-votes') || '{}');
const saveVotes = (votes) => localStorage.setItem('mwandi-votes', JSON.stringify(votes));
const hasVoted = () => localStorage.getItem('mwandi-voted') === 'true';

function renderNominees() {
  const votes = readVotes();
  grid.innerHTML = nominees.map((nominee, index) => `
    <article class="nominee-card reveal">
      <div class="nominee-photo">
        ${nominee.photo ? '' : '<span class="slot-label">Photo slot · add yours</span>'}<span class="nominee-number">0${index + 1}</span>
        ${nominee.photo ? `<img class="nominee-image" src="${nominee.photo}" alt="${nominee.name} nominee photo" />` : `<div class="photo-placeholder" aria-label="Placeholder for ${nominee.name}">${nominee.initials}</div>`}
      </div>
      <div class="nominee-body">
        <p class="nominee-category">${nominee.category}</p><h3>${nominee.name}</h3>
        <button class="button button-electric vote-button${hasVoted() && votes[nominee.id] ? ' voted' : ''}" data-id="${nominee.id}" ${hasVoted() ? 'disabled' : ''}>${hasVoted() && votes[nominee.id] ? 'Your vote ✓' : 'Vote for this creator ↗'}</button>
      </div>
    </article>`).join('');

  grid.querySelectorAll('.vote-button').forEach((button) => button.addEventListener('click', () => openVoteModal(button.dataset.id)));
  grid.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
  updateVoteCount(votes);
}

function updateVoteCount(votes = readVotes()) { voteCount.textContent = Object.values(votes).reduce((sum, count) => sum + count, 0); }
function openModal(modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeModal(modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
function openVoteModal(id) { selectedNominee = nominees.find((nominee) => nominee.id === id); selectedName.textContent = selectedNominee.name; openModal(voteModal); }

confirmVote.addEventListener('click', () => {
  if (!selectedNominee || hasVoted()) return;
  const votes = readVotes();
  votes[selectedNominee.id] = (votes[selectedNominee.id] || 0) + 1;
  saveVotes(votes); localStorage.setItem('mwandi-voted', 'true'); closeModal(voteModal); renderNominees();
});

document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => { closeModal(voteModal); closeModal(creatorModal); }));
[voteModal, creatorModal].forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));

document.querySelectorAll('#creator-login-open, #creator-login-open-footer').forEach((button) => button.addEventListener('click', () => { creatorForm.reset(); creatorMessage.textContent = ''; resultsPanel.hidden = true; openModal(creatorModal); }));
creatorForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (document.querySelector('#creator-pin').value !== CREATOR_PIN) { creatorMessage.textContent = 'That PIN does not match. Try again.'; return; }
  creatorMessage.textContent = 'Dashboard unlocked.'; resultsPanel.hidden = false;
  const votes = readVotes();
  resultsList.innerHTML = nominees.map((nominee) => `<div class="result-row"><span>${nominee.name}</span><strong>${votes[nominee.id] || 0}</strong></div>`).join('');
});

document.querySelector('#reset-votes').addEventListener('click', () => { localStorage.removeItem('mwandi-votes'); localStorage.removeItem('mwandi-voted'); renderNominees(); resultsPanel.hidden = true; creatorMessage.textContent = 'Demo votes reset.'; });

const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => { const isOpen = siteNav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); });
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => { siteNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .1 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
renderNominees();
