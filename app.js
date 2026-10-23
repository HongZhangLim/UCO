'use strict';

// -------------------------------------------------------------
// UCO — Universiti Malaya Used Cooking Oil Recycling Tracker
// Built with Ponytail Minimalism & Apple Design Language
// -------------------------------------------------------------

const TARGET_KG = 300.0;
const STORAGE_KEY = 'uco.records.v2';
const ENDPOINT_KEY = 'uco.cloud_endpoint';

// 100% Verified UM Campus Coordinates (OpenStreetMap)
const UM_LOCATIONS = [
  // 13 Residential Colleges (KK1 - KK13)
  { id: 'kk1', name: 'KK1 (Kolej Pertama - ASTAR)', code: 'KK1', type: 'residential', coords: [3.1174, 101.6594] },
  { id: 'kk2', name: 'KK2 (Tuanku Bahiyah)', code: 'KK2', type: 'residential', coords: [3.1176, 101.6572] },
  { id: 'kk3', name: 'KK3 (Tuanku Kurshiah)', code: 'KK3', type: 'residential', coords: [3.1241, 101.6505] },
  { id: 'kk4', name: 'KK4 (Bestari)', code: 'KK4', type: 'residential', coords: [3.1250, 101.6494] },
  { id: 'kk5', name: 'KK5 (Dayasari)', code: 'KK5', type: 'residential', coords: [3.1275, 101.6585] },
  { id: 'kk6', name: 'KK6 (Ibnu Sina)', code: 'KK6', type: 'residential', coords: [3.1150, 101.6550] },
  { id: 'kk7', name: 'KK7 (Za\'ba)', code: 'KK7', type: 'residential', coords: [3.1262, 101.6506] },
  { id: 'kk8', name: 'KK8 (Kinabalu)', code: 'KK8', type: 'residential', coords: [3.1299, 101.6493] },
  { id: 'kk9', name: 'KK9 (Tun Syed Zahiruddin)', code: 'KK9', type: 'residential', coords: [3.1212, 101.6454] },
  { id: 'kk10', name: 'KK10 (Tun Ahmad Zaidi)', code: 'KK10', type: 'residential', coords: [3.1311, 101.6504] },
  { id: 'kk11', name: 'KK11 (Raja Ungku Aziz)', code: 'KK11', type: 'residential', coords: [3.1295, 101.6609] },
  { id: 'kk12', name: 'KK12 (Raja Dr. Nazrin Shah)', code: 'KK12', type: 'residential', coords: [3.1254, 101.6607] },
  { id: 'kk13', name: 'KK13 (Kolej Ke-13 / PJ Seksyen 17)', code: 'KK13', type: 'residential', coords: [3.1203, 101.6403] },

  // Key Faculty Cafeterias
  { id: 'edufac', name: 'Kafeteria Fakulti Pendidikan', code: 'Edu Fac', type: 'faculty', coords: [3.1205, 101.6524] },
  { id: 'fcsit', name: 'FSKTM (Sains Komputer)', code: 'FCSIT', type: 'faculty', coords: [3.1286, 101.6505] },
  { id: 'fk', name: 'Kantin Fakulti Kejuruteraan', code: 'FK', type: 'faculty', coords: [3.1182, 101.6564] },
  { id: 'fsss', name: 'Fakulti Sastera & Sains Sosial', code: 'FSSS', type: 'faculty', coords: [3.1211, 101.6519] },
  { id: 'fpe', name: 'Fakulti Perniagaan & Ekonomi', code: 'FPE', type: 'faculty', coords: [3.1186, 101.6528] },
  { id: 'fs', name: 'Fakulti Sains', code: 'FS', type: 'faculty', coords: [3.1241, 101.6538] },
  { id: 'fab', name: 'Fakulti Alam Bina', code: 'FAB', type: 'faculty', coords: [3.1163, 101.6552] },
  { id: 'law', name: 'Fakulti Undang-Undang', code: 'Law', type: 'faculty', coords: [3.1180, 101.6612] },
  { id: 'med', name: 'Fakulti Perubatan', code: 'Med', type: 'faculty', coords: [3.1152, 101.6529] }
];

const LOCATIONS_MAP = Object.fromEntries(UM_LOCATIONS.map(l => [l.id, l]));

const TEAM_MEMBERS = [
  'Jitesh',
  'Chee Keat',
  'Mingdao',
  'Norman',
  'Zayn',
  'Yong Jiang',
  'Zhi Heng',
  'Zhuo Lin',
  'Ariq'
];

const TAGS = ['Free Donation', 'Replaced Container', 'Cash Paid', 'Follow-up Needed'];

// Default Initial Seed
const DEFAULT_RECORDS = [
  {
    id: 'seed-1',
    locationId: 'kk11',
    kg: 18.5,
    collector: 'Mingdao',
    tag: 'Free Donation',
    notes: 'Nasi Campur & Shawarma stall donation',
    photo: '',
    timestamp: Date.now() - (2 * 864e5)
  }
];

// Pure CS Calculations
const calcImpact = kg => ({
  co2: Math.round(kg * 2.85 * 10) / 10,
  bio: Math.round(kg * 0.92 * 10) / 10,
  waterKl: Math.round((kg * 1000000) / 1000)
});

// State
let records = [];
let map = null;
let markers = {};
let selectedCollector = TEAM_MEMBERS[2]; // Mingdao by default
let selectedTag = TAGS[0];
let currentCompressedPhoto = '';
let cloudEndpoint = '';

// DOM Elements
const $ = s => document.querySelector(s);
const totalKgEl = $('#totalKg');
const progressFillEl = $('#progressFill');
const percentBadgeEl = $('#percentBadge');
const remainingTextEl = $('#remainingText');
const paceTextEl = $('#paceText');

const co2ValEl = $('#co2Val');
const bioValEl = $('#bioVal');
const waterValEl = $('#waterVal');
const leaderboardListEl = $('#leaderboardList');
const activityListEl = $('#activityList');

const sheetBackdrop = $('#sheetBackdrop');
const logSheet = $('#logSheet');
const pickupForm = $('#pickupForm');
const locationSelect = $('#locationSelect');
const weightInput = $('#weightInput');
const notesInput = $('#notesInput');
const photoInput = $('#photoInput');
const photoPrompt = $('#photoPrompt');
const photoPreviewBox = $('#photoPreviewBox');
const photoPreviewImg = $('#photoPreviewImg');
const removePhotoBtn = $('#removePhotoBtn');

const photoLightbox = $('#photoLightbox');
const lightboxImg = $('#lightboxImg');
const lightboxCaption = $('#lightboxCaption');
const lightboxScrim = $('#lightboxScrim');
const closeLightboxBtn = $('#closeLightboxBtn');

const syncDot = $('.sync-dot');
const syncLabel = $('#syncLabel');
const syncStatusBadge = $('#syncStatusBadge');
const cloudEndpointInput = $('#cloudEndpointInput');
const saveEndpointBtn = $('#saveEndpointBtn');
const toastEl = $('#toastMessage');

// Toast Feedback
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('active');
  setTimeout(() => toastEl.classList.remove('active'), 2500);
}

// Storage & Sync Engine
function initStorage() {
  // Auto-connect to /api/records when hosted on Vercel or live web
  const autoEndpoint = (window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost'))
    ? window.location.origin + '/api/records'
    : '';

  cloudEndpoint = localStorage.getItem(ENDPOINT_KEY) || autoEndpoint;
  if (cloudEndpointInput) cloudEndpointInput.value = cloudEndpoint;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    records = raw ? JSON.parse(raw) : DEFAULT_RECORDS;
  } catch (e) {
    records = DEFAULT_RECORDS;
  }
}

function saveStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Storage warning:', e);
  }
}

// Background Cloud Sync (Unified DB for all 9 teammates)
async function syncWithCloud() {
  if (!cloudEndpoint) {
    if (syncStatusBadge) syncStatusBadge.textContent = 'Local Cache';
    return;
  }

  try {
    const res = await fetch(cloudEndpoint, { method: 'GET' });
    if (!res.ok) throw new Error('Cloud unreachable');
    const remoteRecords = await res.json();
    if (Array.isArray(remoteRecords)) {
      // Merge by ID
      const recordMap = new Map();
      records.forEach(r => recordMap.set(r.id, r));
      remoteRecords.forEach(r => recordMap.set(r.id, r));
      records = Array.from(recordMap.values()).sort((a, b) => a.timestamp - b.timestamp);
      saveStorage();
      updateUI();
      if (syncDot) syncDot.classList.remove('offline');
      if (syncLabel) syncLabel.textContent = 'Live';
      if (syncStatusBadge) syncStatusBadge.textContent = 'Connected';
    }
  } catch (err) {
    if (syncDot) syncDot.classList.add('offline');
    if (syncLabel) syncLabel.textContent = 'Offline';
    if (syncStatusBadge) syncStatusBadge.textContent = 'Offline (Cached)';
  }
}

async function pushRecordToCloud(record) {
  if (!cloudEndpoint) return;
  try {
    await fetch(cloudEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (syncDot) syncDot.classList.remove('offline');
    if (syncLabel) syncLabel.textContent = 'Live';
  } catch (err) {
    if (syncDot) syncDot.classList.add('offline');
    if (syncLabel) syncLabel.textContent = 'Saved Locally';
  }
}

// Client-Side Canvas Image Compression
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.7 JPEG: ~50-80KB
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Lightbox Quick Look
function openLightbox(imgSrc, caption) {
  lightboxImg.src = imgSrc;
  lightboxCaption.textContent = caption;
  photoLightbox.classList.add('open');
}

function closeLightbox() {
  photoLightbox.classList.remove('open');
  lightboxImg.src = '';
}

// UI Update
function updateUI() {
  const total = records.reduce((sum, r) => sum + Number(r.kg), 0);
  const roundedTotal = Math.round(total * 10) / 10;
  const pct = Math.min(100, Math.round((roundedTotal / TARGET_KG) * 1000) / 10);
  const remaining = Math.max(0, Math.round((TARGET_KG - roundedTotal) * 10) / 10);

  // Island
  totalKgEl.textContent = roundedTotal.toFixed(1);
  progressFillEl.style.width = `${pct}%`;
  percentBadgeEl.textContent = `${pct.toFixed(1)}%`;
  remainingTextEl.textContent = `${remaining.toFixed(1)} kg left`;
  paceTextEl.textContent = roundedTotal > 0 ? `Target: Week 8` : `Ready`;

  // CS Metrics
  const imp = calcImpact(roundedTotal);
  co2ValEl.textContent = imp.co2.toFixed(1);
  bioValEl.textContent = imp.bio.toFixed(1);
  waterValEl.textContent = imp.waterKl.toLocaleString();

  // Location Totals
  const locationTotals = {};
  UM_LOCATIONS.forEach(loc => { locationTotals[loc.id] = 0; });
  records.forEach(r => {
    locationTotals[r.locationId] = (locationTotals[r.locationId] || 0) + Number(r.kg);
  });

  // Leaderboard
  const sortedLocations = [...UM_LOCATIONS]
    .map(loc => ({ ...loc, total: Math.round((locationTotals[loc.id] || 0) * 10) / 10 }))
    .sort((a, b) => b.total - a.total);

  leaderboardListEl.innerHTML = sortedLocations
    .filter(l => l.total > 0 || l.type === 'residential')
    .slice(0, 13)
    .map((l, idx) => `
      <li class="board-item">
        <div class="board-left">
          <span class="rank-badge">${idx + 1}</span>
          <span class="board-name">${l.code}</span>
        </div>
        <span class="board-kg">${l.total.toFixed(1)} kg</span>
      </li>
    `).join('');

  // Activity List with Photo Proof Thumbnails
  activityListEl.innerHTML = [...records].reverse().slice(0, 15).map(r => {
    const loc = LOCATIONS_MAP[r.locationId] || { code: r.locationId };
    const dateStr = new Date(r.timestamp).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
    const hasPhoto = !!r.photo;

    return `
      <li class="activity-item">
        ${hasPhoto ? `
          <img src="${r.photo}" class="activity-thumb" alt="Proof" data-photo-id="${r.id}" title="Tap to expand proof">
        ` : `
          <div class="activity-thumb" style="display:grid;place-items:center;color:#8E8E93;font-size:10px;font-weight:600;">NO PIC</div>
        `}
        <div class="activity-detail">
          <span class="activity-title">${loc.code} · ${r.kg.toFixed(1)} kg</span>
          <span class="activity-meta">${r.collector} · ${dateStr} ${r.notes ? '· ' + r.notes : ''}</span>
        </div>
        <span class="activity-kg">+${r.kg.toFixed(1)}</span>
      </li>
    `;
  }).join('');

  // Attach Lightbox click handlers
  activityListEl.querySelectorAll('.activity-thumb[data-photo-id]').forEach(img => {
    img.addEventListener('click', e => {
      const recId = e.target.dataset.photoId;
      const rec = records.find(r => r.id === recId);
      if (rec && rec.photo) {
        const loc = LOCATIONS_MAP[rec.locationId] || { code: rec.locationId };
        openLightbox(rec.photo, `${loc.code} — ${rec.kg} kg by ${rec.collector}`);
      }
    });
  });

  // Map Markers Update
  UM_LOCATIONS.forEach(loc => {
    const total = locationTotals[loc.id] || 0;
    const marker = markers[loc.id];
    if (marker) {
      const el = marker.getElement();
      if (el) {
        const dot = el.querySelector('.marker-dot');
        const lbl = el.querySelector('.marker-label');
        if (total > 0) {
          dot.classList.add('active');
          lbl.textContent = `${loc.code} · ${total.toFixed(1)}kg`;
        } else {
          dot.classList.remove('active');
          lbl.textContent = loc.code;
        }
      }
    }
  });
}

// Leaflet Map Init
function initMap() {
  const center = [3.1245, 101.6535]; // Central Universiti Malaya
  map = L.map('map', {
    zoomControl: false,
    attributionControl: true
  }).setView(center, 15);

  // Keyless, 100% Free OSM Humanitarian Pastel Tiles (No API key, No Watermark)
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Add markers for all UM Locations
  UM_LOCATIONS.forEach(loc => {
    const icon = L.divIcon({
      className: 'map-marker-pin',
      html: `
        <div class="marker-dot"></div>
        <div class="marker-label">${loc.code}</div>
      `,
      iconSize: [60, 36],
      iconAnchor: [30, 8]
    });

    const marker = L.marker(loc.coords, { icon }).addTo(map);
    marker.on('click', () => {
      openSheetWithLocation(loc.id);
    });
    markers[loc.id] = marker;
  });
}

// Bottom Sheet Open/Close
function openSheetWithLocation(locationId) {
  if (locationId) locationSelect.value = locationId;
  clearPhotoInput();
  sheetBackdrop.classList.add('visible');
  logSheet.classList.add('open');
}

function closeSheet() {
  sheetBackdrop.classList.remove('visible');
  logSheet.classList.remove('open');
  clearPhotoInput();
}

function clearPhotoInput() {
  currentCompressedPhoto = '';
  photoInput.value = '';
  photoPreviewBox.hidden = true;
  photoPrompt.hidden = false;
  photoPreviewImg.src = '';
}

// Setup Form, Listeners & Cloud Sync
function setupForm() {
  // Populate Location Dropdown
  const resGroup = document.createElement('optgroup');
  resGroup.label = 'Residential Colleges (KK1 - KK13)';
  const facGroup = document.createElement('optgroup');
  facGroup.label = 'Faculty Cafeterias';

  UM_LOCATIONS.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.id;
    opt.textContent = `${loc.code} — ${loc.name}`;
    if (loc.type === 'residential') resGroup.appendChild(opt);
    else facGroup.appendChild(opt);
  });
  locationSelect.appendChild(resGroup);
  locationSelect.appendChild(facGroup);

  // Populate Collector Chips
  const collectorBox = $('#collectorChips');
  collectorBox.innerHTML = TEAM_MEMBERS.map(name => `
    <button type="button" class="chip ${name === selectedCollector ? 'selected' : ''}" data-collector="${name}">
      ${name}
    </button>
  `).join('');

  collectorBox.addEventListener('click', e => {
    const btn = e.target.closest('[data-collector]');
    if (!btn) return;
    selectedCollector = btn.dataset.collector;
    collectorBox.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
  });

  // Populate Tag Chips
  const tagBox = $('#tagChips');
  tagBox.innerHTML = TAGS.map(tag => `
    <button type="button" class="chip ${tag === selectedTag ? 'selected' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');

  tagBox.addEventListener('click', e => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;
    selectedTag = btn.dataset.tag;
    tagBox.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
  });

  // Steppers
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseFloat(btn.dataset.step);
      const cur = parseFloat(weightInput.value) || 0;
      const next = Math.max(0.1, Math.round((cur + step) * 10) / 10);
      weightInput.value = next.toFixed(1);
    });
  });

  // Photo Input Handling
  photoInput.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Processing photo...');
      currentCompressedPhoto = await compressPhoto(file);
      photoPreviewImg.src = currentCompressedPhoto;
      photoPrompt.hidden = true;
      photoPreviewBox.hidden = false;
      showToast('Photo proof attached');
    } catch (err) {
      showToast('Error attaching photo');
      console.error(err);
    }
  });

  removePhotoBtn.addEventListener('click', e => {
    e.stopPropagation();
    clearPhotoInput();
  });

  // Lightbox close
  closeLightboxBtn.addEventListener('click', closeLightbox);
  lightboxScrim.addEventListener('click', closeLightbox);

  // Form Submit
  pickupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const kg = parseFloat(weightInput.value);
    if (!kg || kg <= 0) return;

    const newRecord = {
      id: 'rec-' + Date.now(),
      locationId: locationSelect.value,
      kg: Math.round(kg * 10) / 10,
      collector: selectedCollector,
      tag: selectedTag,
      notes: notesInput.value.trim(),
      photo: currentCompressedPhoto,
      timestamp: Date.now()
    };

    records.push(newRecord);
    saveStorage();
    updateUI();
    closeSheet();
    notesInput.value = '';
    showToast(`Saved ${newRecord.kg} kg at ${LOCATIONS_MAP[newRecord.locationId].code}`);

    // Push to unified cloud
    pushRecordToCloud(newRecord);
  });

  // Sheet Controls
  $('#openLogBtn').addEventListener('click', () => openSheetWithLocation(locationSelect.value || 'kk11'));
  $('#closeSheetBtn').addEventListener('click', closeSheet);
  sheetBackdrop.addEventListener('click', closeSheet);

  // Dock Tabs
  document.querySelectorAll('.dock-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetTab = $('#' + btn.dataset.tab);
      if (targetTab) targetTab.classList.add('active');
      if (btn.dataset.tab === 'tab-map' && map) {
        setTimeout(() => map.invalidateSize(), 100);
      }
    });
  });

  // Save Cloud Endpoint URL
  if (saveEndpointBtn) {
    saveEndpointBtn.addEventListener('click', () => {
      const url = cloudEndpointInput.value.trim();
      cloudEndpoint = url;
      localStorage.setItem(ENDPOINT_KEY, url);
      showToast(url ? 'Sync URL saved' : 'Sync URL cleared');
      syncWithCloud();
    });
  }

  // GPS Locate Button
  $('#locateBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const userCoord = [pos.coords.latitude, pos.coords.longitude];
        map.setView(userCoord, 16);
        L.circleMarker(userCoord, {
          radius: 7,
          color: '#FFFFFF',
          weight: 2,
          fillColor: '#007AFF',
          fillOpacity: 1
        }).addTo(map).bindPopup('Your Location').openPopup();
      },
      () => showToast('Could not fetch location')
    );
  });
}

// Start Application & Polling
window.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initMap();
  setupForm();
  updateUI();
  syncWithCloud();

  // Background sync every 25 seconds across teammates
  setInterval(syncWithCloud, 25000);
});
