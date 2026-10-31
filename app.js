'use strict';

// -------------------------------------------------------------
// UCO — Universiti Malaya Used Cooking Oil Recycling Tracker
// Built with Ponytail Minimalism & Apple Design Language
// Multi-Vendor Tracking & Campus Stalls Directory
// -------------------------------------------------------------

const TARGET_KG = 300.0;
const STORAGE_KEY = 'uco.records.v2';
const VENDORS_STORAGE_KEY = 'uco.vendors.v2';
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

// Verified Seed Data of Cafe Vendors across UM Colleges
const DEFAULT_VENDORS = [
  // KK2
  {
    id: 'v-kk2-1',
    locationId: 'kk2',
    name: 'Western Food',
    status: 'Paid',
    requirement: 'Offer ~RM 2.50/kg (normally sell RM 3.00/kg). Need to confirm with boss first',
    contact: '018-3557751',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk2-2',
    locationId: 'kk2',
    name: 'Nasi Campur',
    status: 'Free',
    requirement: 'Can collect this Friday',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK3
  {
    id: 'v-kk3-1',
    locationId: 'kk3',
    name: 'Cafe Vendor (Bulk Supplier)',
    status: 'Follow Up',
    requirement: 'Contact boss, he might sell us many kg',
    contact: '019-6769527',
    updatedAt: 1730300000000
  },

  // KK4
  {
    id: 'v-kk4-1',
    locationId: 'kk4',
    name: 'Ayam Gunting 4K',
    status: 'Paid',
    requirement: 'Purchase arrangement',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK5
  {
    id: 'v-kk5-1',
    locationId: 'kk5',
    name: 'Shawarma',
    status: 'Free',
    requirement: '',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK6
  {
    id: 'v-kk6-1',
    locationId: 'kk6',
    name: 'Nasi Ayam',
    status: 'Free',
    requirement: 'Needs container replacement. Collect anytime (told them Friday)',
    contact: '',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk6-2',
    locationId: 'kk6',
    name: 'Nasi Campur',
    status: 'Follow Up',
    requirement: 'Need to ask their boss',
    contact: '019-2234282',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk6-3',
    locationId: 'kk6',
    name: 'Ayam Gunting',
    status: 'Follow Up',
    requirement: 'Closed today — follow up next visit',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK7
  {
    id: 'v-kk7-1',
    locationId: 'kk7',
    name: 'Nasi Kukus',
    status: 'Paid',
    requirement: 'Needs container replacement — Purchase',
    contact: '',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk7-2',
    locationId: 'kk7',
    name: 'Ayam Gunting',
    status: 'Follow Up',
    requirement: 'Tak sure, need to ask boss at night',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK8
  {
    id: 'v-kk8-1',
    locationId: 'kk8',
    name: 'Right-side Nasi Campur',
    status: 'Paid',
    requirement: 'Come pick up at November',
    contact: '010-2292690 / 018-3819914',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk8-2',
    locationId: 'kk8',
    name: 'Chicken Cutlet',
    status: 'Paid',
    requirement: 'Pick up Friday',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK11
  {
    id: 'v-kk11-1',
    locationId: 'kk11',
    name: 'Nasi Campur',
    status: 'Free',
    requirement: 'Requires clean containers',
    contact: '',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk11-2',
    locationId: 'kk11',
    name: 'Shawarma',
    status: 'Free',
    requirement: 'Available next Friday',
    contact: '',
    updatedAt: 1730300000000
  },
  {
    id: 'v-kk11-3',
    locationId: 'kk11',
    name: 'Ayam Gunting Store',
    status: 'Free',
    requirement: 'Free collection (only if boss is absent)',
    contact: '',
    updatedAt: 1730300000000
  },

  // KK12
  {
    id: 'v-kk12-1',
    locationId: 'kk12',
    name: 'Nasi Kandar',
    status: 'Paid',
    requirement: 'End of the month — Purchase',
    contact: '',
    updatedAt: 1730300000000
  }
];

// Initial Seed Pickup Records (Including Week 3 collections)
const DEFAULT_RECORDS = [
  {
    id: 'rec-20261023-kk5',
    locationId: 'kk5',
    vendorId: 'v-kk5-1',
    vendorName: 'Shawarma',
    kg: 5.0,
    collector: 'Mingdao',
    tag: 'Free Donation',
    notes: 'Week 3 collection',
    photo: '',
    timestamp: 1792728000000
  },
  {
    id: 'rec-20261023-kk6',
    locationId: 'kk6',
    vendorId: 'v-kk6-3',
    vendorName: 'Ayam Gunting',
    kg: 5.0,
    collector: 'Mingdao',
    tag: 'Free Donation',
    notes: 'Week 3 collection',
    photo: '',
    timestamp: 1792731600000
  }
];

// Pure CS Environmental Impact Calculations
const calcImpact = kg => ({
  co2: Math.round(kg * 2.85 * 10) / 10,
  bio: Math.round(kg * 0.92 * 10) / 10,
  waterKl: Math.round((kg * 1000000) / 1000)
});

// App State
let records = [];
let vendors = [];
let currentVendorFilter = 'All';
let selectedVendorStatus = 'Free';
let map = null;
let markers = {};
let selectedCollector = TEAM_MEMBERS[2]; // Mingdao by default
let selectedTag = TAGS[0];
let currentCompressedPhoto = '';
let cloudEndpoint = '';

// DOM Helpers & Elements
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

// Pickup Sheet Elements
const sheetBackdrop = $('#sheetBackdrop');
const logSheet = $('#logSheet');
const pickupForm = $('#pickupForm');
const locationSelect = $('#locationSelect');
const vendorSelect = $('#vendorSelect');
const vendorRequirementHint = $('#vendorRequirementHint');
const weightInput = $('#weightInput');
const notesInput = $('#notesInput');
const photoInput = $('#photoInput');
const photoPrompt = $('#photoPrompt');
const photoPreviewBox = $('#photoPreviewBox');
const photoPreviewImg = $('#photoPreviewImg');
const removePhotoBtn = $('#removePhotoBtn');

// Vendor Directory Elements
const vendorsContainer = $('#vendorsContainer');
const statusFilterBar = $('#statusFilterBar');
const countAllEl = $('#countAll');
const countFreeEl = $('#countFree');
const countPaidEl = $('#countPaid');
const countFollowUpEl = $('#countFollowUp');
const countRejectEl = $('#countReject');
const addNewVendorBtn = $('#addNewVendorBtn');

// Vendor Sheet Elements
const vendorSheetBackdrop = $('#vendorSheetBackdrop');
const vendorSheet = $('#vendorSheet');
const vendorSheetHeading = $('#vendorSheetHeading');
const closeVendorSheetBtn = $('#closeVendorSheetBtn');
const vendorForm = $('#vendorForm');
const vendorEditId = $('#vendorEditId');
const vendorLocationSelect = $('#vendorLocationSelect');
const vendorNameInput = $('#vendorNameInput');
const vendorStatusChips = $('#vendorStatusChips');
const vendorRequirementInput = $('#vendorRequirementInput');
const vendorContactInput = $('#vendorContactInput');
const deleteVendorBtn = $('#deleteVendorBtn');

// Photo Lightbox Elements
const photoLightbox = $('#photoLightbox');
const lightboxImg = $('#lightboxImg');
const lightboxCaption = $('#lightboxCaption');
const lightboxScrim = $('#lightboxScrim');
const closeLightboxBtn = $('#closeLightboxBtn');

// Cloud & Toast Elements
const syncDot = $('.sync-dot');
const syncLabel = $('#syncLabel');
const syncStatusBadge = $('#syncStatusBadge');
const cloudEndpointInput = $('#cloudEndpointInput');
const saveEndpointBtn = $('#saveEndpointBtn');
const toastEl = $('#toastMessage');

// Toast Feedback Capsule
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('active');
  setTimeout(() => toastEl.classList.remove('active'), 2500);
}

// Phone Number Cleaner
function cleanPhone(raw) {
  if (!raw) return '';
  const match = raw.match(/[\d\+\-]+/);
  return match ? match[0].replace(/[^\d+]/g, '') : '';
}

// HTML Escaper for Safe Rendering
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Storage Engine
function initStorage() {
  const isVercelOrCustom = window.location.protocol.startsWith('http') &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('github.io');

  const autoEndpoint = isVercelOrCustom
    ? window.location.origin + '/api/records'
    : '';

  cloudEndpoint = localStorage.getItem(ENDPOINT_KEY) || autoEndpoint;
  if (cloudEndpointInput) cloudEndpointInput.value = cloudEndpoint;

  // Load Pickup Records
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    records = raw ? JSON.parse(raw) : DEFAULT_RECORDS;
    // Purge mock seed-1
    records = records.filter(r => r.id !== 'seed-1');
    // Merge any default records not yet in local storage
    DEFAULT_RECORDS.forEach(defRec => {
      if (!records.some(r => r.id === defRec.id)) {
        records.push(defRec);
      }
    });
    records.sort((a, b) => a.timestamp - b.timestamp);
    saveRecordsStorage();
  } catch (e) {
    records = DEFAULT_RECORDS;
  }

  // Load Cafe Vendors
  try {
    const rawVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
    vendors = rawVendors ? JSON.parse(rawVendors) : DEFAULT_VENDORS;
    DEFAULT_VENDORS.forEach(defV => {
      if (!vendors.some(v => v.id === defV.id)) {
        vendors.push(defV);
      }
    });
    saveVendorsStorage();
  } catch (e) {
    vendors = DEFAULT_VENDORS;
  }
}

function saveRecordsStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Storage quota warning, pruning older photos from local cache:', e);
    try {
      const pruned = records.map((r, idx) => {
        if (idx < records.length - 10 && r.photo) {
          return { ...r, photo: '' }; // Preserves photos in cloud, frees local 5MB cache
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    } catch (e2) {
      console.warn('Storage warning (records):', e2);
    }
  }
}

function saveVendorsStorage() {
  try {
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
  } catch (e) {
    console.warn('Storage warning (vendors):', e);
  }
}

// Cloud Synchronization
async function syncWithCloud() {
  if (!cloudEndpoint) {
    if (syncStatusBadge) syncStatusBadge.textContent = 'Local Cache';
    return;
  }

  try {
    // 1. Sync Records
    const resRecords = await fetch(cloudEndpoint, { method: 'GET' });
    if (resRecords.ok) {
      const remote = await resRecords.json();
      if (Array.isArray(remote)) {
        const recordMap = new Map();
        records.forEach(r => recordMap.set(r.id, r));
        remote.forEach(r => recordMap.set(r.id, r));
        records = Array.from(recordMap.values())
          .filter(r => r.id !== 'seed-1')
          .sort((a, b) => a.timestamp - b.timestamp);
        saveRecordsStorage();
      }
    }

    // 2. Sync Vendors (if /api/vendors exists on same host)
    const vendorsEndpoint = cloudEndpoint.replace(/\/api\/records\/?$/, '/api/vendors');
    if (vendorsEndpoint !== cloudEndpoint) {
      try {
        const resVendors = await fetch(vendorsEndpoint, { method: 'GET' });
        if (resVendors.ok) {
          const remoteVendors = await resVendors.json();
          if (Array.isArray(remoteVendors) && remoteVendors.length > 0) {
            const vMap = new Map();
            vendors.forEach(v => vMap.set(v.id, v));
            remoteVendors.forEach(v => vMap.set(v.id, v));
            vendors = Array.from(vMap.values());
            saveVendorsStorage();
            renderVendors();
            updateVendorSelectOptions(locationSelect.value);
          }
        }
      } catch (ve) {
        // Silent vendor sync fallback
      }
    }

    updateUI();
    if (syncDot) syncDot.classList.remove('offline');
    if (syncLabel) syncLabel.textContent = 'Live';
    if (syncStatusBadge) syncStatusBadge.textContent = 'Connected';
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

async function pushVendorToCloud(vendor) {
  if (!cloudEndpoint) return;
  const vendorsEndpoint = cloudEndpoint.replace(/\/api\/records\/?$/, '/api/vendors');
  try {
    await fetch(vendorsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor)
    });
  } catch (e) {
    // Local persistence will keep it safe
  }
}

// Client-Side Canvas Image Compression (~50-80KB JPEG)
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
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

// Vendor Directory Management
function renderVendors(filter = currentVendorFilter) {
  currentVendorFilter = filter;

  // 1. Update filter counts
  const total = vendors.length;
  const freeCount = vendors.filter(v => v.status === 'Free').length;
  const paidCount = vendors.filter(v => v.status === 'Paid').length;
  const followCount = vendors.filter(v => v.status === 'Follow Up').length;
  const rejectCount = vendors.filter(v => v.status === 'Reject').length;

  if (countAllEl) countAllEl.textContent = total;
  if (countFreeEl) countFreeEl.textContent = freeCount;
  if (countPaidEl) countPaidEl.textContent = paidCount;
  if (countFollowUpEl) countFollowUpEl.textContent = followCount;
  if (countRejectEl) countRejectEl.textContent = rejectCount;

  // 2. Filter vendors
  const filtered = filter === 'All'
    ? vendors
    : vendors.filter(v => v.status === filter);

  if (!vendorsContainer) return;

  if (filtered.length === 0) {
    vendorsContainer.innerHTML = `
      <div class="card" style="padding: 32px 20px; text-align: center;">
        <p style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">No Cafes Found</p>
        <p style="font-size: 13px; color: var(--text-secondary);">No cafe vendors marked with status "${escapeHtml(filter)}".</p>
      </div>
    `;
    return;
  }

  // 3. Group by Location
  const grouped = {};
  filtered.forEach(v => {
    if (!grouped[v.locationId]) grouped[v.locationId] = [];
    grouped[v.locationId].push(v);
  });

  // Sort locations by UM_LOCATIONS order
  const sortedLocIds = Object.keys(grouped).sort((a, b) => {
    const idxA = UM_LOCATIONS.findIndex(l => l.id === a);
    const idxB = UM_LOCATIONS.findIndex(l => l.id === b);
    return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
  });

  vendorsContainer.innerHTML = sortedLocIds.map(locId => {
    const loc = LOCATIONS_MAP[locId] || { code: locId.toUpperCase(), name: locId };
    const locVendors = grouped[locId];

    const vendorRows = locVendors.map(v => {
      const statusClass = (v.status || '').toLowerCase().replace(/\s+/g, '');
      const cleanTel = cleanPhone(v.contact);

      return `
        <li class="vendor-row" data-vendor-id="${v.id}">
          <div class="vendor-top">
            <span class="vendor-name">${escapeHtml(v.name)}</span>
            <span class="badge-status badge-${statusClass}">${escapeHtml(v.status)}</span>
          </div>

          ${v.requirement ? `
            <div class="vendor-req">
              <span>⚠️ ${escapeHtml(v.requirement)}</span>
            </div>
          ` : ''}

          ${v.contact ? `
            <div>
              <a href="tel:${cleanTel}" class="vendor-contact-link">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>${escapeHtml(v.contact)}</span>
              </a>
            </div>
          ` : ''}

          <div class="vendor-actions">
            <button type="button" class="btn-mini-log" data-loc-id="${locId}" data-vendor-id="${v.id}">Log Pickup</button>
            <button type="button" class="btn-mini-edit" data-vendor-id="${v.id}">Edit</button>
          </div>
        </li>
      `;
    }).join('');

    return `
      <div class="kk-group-card">
        <div class="kk-group-header">
          <div class="kk-title-wrap">
            <span class="kk-code">${loc.code}</span>
            <span class="kk-full-name">${loc.name}</span>
          </div>
          <button type="button" class="kk-add-btn" data-loc-id="${locId}">+ Add</button>
        </div>
        <ul class="vendor-list">
          ${vendorRows}
        </ul>
      </div>
    `;
  }).join('');

  // Attach dynamic row events
  vendorsContainer.querySelectorAll('.btn-mini-log').forEach(btn => {
    btn.addEventListener('click', () => {
      openSheetWithLocation(btn.dataset.locId, btn.dataset.vendorId);
    });
  });

  vendorsContainer.querySelectorAll('.btn-mini-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      openVendorSheet(btn.dataset.vendorId);
    });
  });

  vendorsContainer.querySelectorAll('.kk-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openVendorSheet(null, btn.dataset.locId);
    });
  });
}

// Vendor Selection in Log Pickup Sheet
function updateVendorSelectOptions(locationId, preselectedVendorId = '') {
  if (!vendorSelect) return;
  vendorSelect.innerHTML = '';

  // Default option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '— General / Unspecified Stall —';
  vendorSelect.appendChild(defaultOpt);

  const locVendors = vendors.filter(v => v.locationId === locationId);
  locVendors.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.name} (${v.status})`;
    vendorSelect.appendChild(opt);
  });

  if (preselectedVendorId && locVendors.some(v => v.id === preselectedVendorId)) {
    vendorSelect.value = preselectedVendorId;
  } else {
    vendorSelect.value = '';
  }

  updateVendorRequirementHint();
}

function updateVendorRequirementHint() {
  if (!vendorRequirementHint || !vendorSelect) return;
  const vendorId = vendorSelect.value;
  if (!vendorId) {
    vendorRequirementHint.hidden = true;
    vendorRequirementHint.innerHTML = '';
    return;
  }

  const v = vendors.find(item => item.id === vendorId);
  if (v) {
    vendorRequirementHint.hidden = false;
    vendorRequirementHint.innerHTML = `
      <strong>${escapeHtml(v.status)}</strong>: ${escapeHtml(v.requirement || 'No special requirements')}
      ${v.contact ? ` • 📞 ${escapeHtml(v.contact)}` : ''}
    `;
  } else {
    vendorRequirementHint.hidden = true;
    vendorRequirementHint.innerHTML = '';
  }
}

// Vendor Modal Open / Close
function openVendorSheet(vendorId = null, defaultLocationId = null) {
  if (vendorId) {
    const v = vendors.find(item => item.id === vendorId);
    if (!v) return;
    vendorSheetHeading.textContent = 'Edit Cafe Vendor';
    vendorEditId.value = v.id;
    vendorLocationSelect.value = v.locationId;
    vendorNameInput.value = v.name;
    vendorRequirementInput.value = v.requirement || '';
    vendorContactInput.value = v.contact || '';
    setVendorStatusChip(v.status || 'Free');
    deleteVendorBtn.hidden = false;
  } else {
    vendorSheetHeading.textContent = 'Add Cafe Vendor';
    vendorEditId.value = '';
    vendorLocationSelect.value = defaultLocationId || 'kk2';
    vendorNameInput.value = '';
    vendorRequirementInput.value = '';
    vendorContactInput.value = '';
    setVendorStatusChip('Free');
    deleteVendorBtn.hidden = true;
  }

  vendorSheetBackdrop.classList.add('visible');
  vendorSheet.classList.add('open');
}

function closeVendorSheet() {
  vendorSheetBackdrop.classList.remove('visible');
  vendorSheet.classList.remove('open');
}

function setVendorStatusChip(status) {
  selectedVendorStatus = status;
  if (!vendorStatusChips) return;
  vendorStatusChips.querySelectorAll('.status-chip').forEach(btn => {
    if (btn.dataset.status === status) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// UI Metrics & Feeds Update
function updateUI() {
  const total = records.reduce((sum, r) => sum + Number(r.kg), 0);
  const roundedTotal = Math.round(total * 10) / 10;
  const pct = Math.min(100, Math.round((roundedTotal / TARGET_KG) * 1000) / 10);
  const remaining = Math.max(0, Math.round((TARGET_KG - roundedTotal) * 10) / 10);

  // Dynamic Island
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

  // Activity List with Photo Proof Thumbnails & Vendor Attribution
  activityListEl.innerHTML = [...records].reverse().slice(0, 15).map(r => {
    const loc = LOCATIONS_MAP[r.locationId] || { code: r.locationId };
    const dateStr = new Date(r.timestamp).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
    const hasPhoto = !!r.photo;
    const vendorLabel = r.vendorName ? ` · ${r.vendorName}` : '';

    return `
      <li class="activity-item">
        ${hasPhoto ? `
          <img src="${r.photo}" class="activity-thumb" alt="Proof" data-photo-id="${r.id}" title="Tap to expand proof">
        ` : `
          <div class="activity-thumb" style="display:grid;place-items:center;color:#8E8E93;font-size:10px;font-weight:600;">NO PIC</div>
        `}
        <div class="activity-detail">
          <span class="activity-title">${loc.code}${escapeHtml(vendorLabel)} · ${r.kg.toFixed(1)} kg</span>
          <span class="activity-meta">${escapeHtml(r.collector)} · ${dateStr} ${r.notes ? '· ' + escapeHtml(r.notes) : ''}</span>
        </div>
        <span class="activity-kg">+${r.kg.toFixed(1)}</span>
        <button type="button" class="activity-delete-btn" data-delete-id="${r.id}" title="Delete record" aria-label="Delete record">×</button>
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
        const vTag = rec.vendorName ? ` (${rec.vendorName})` : '';
        openLightbox(rec.photo, `${loc.code}${vTag} — ${rec.kg} kg by ${rec.collector}`);
      }
    });
  });

  // Attach Record Delete handlers
  activityListEl.querySelectorAll('.activity-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const recId = btn.dataset.deleteId;
      const rec = records.find(r => r.id === recId);
      if (!rec) return;
      const loc = LOCATIONS_MAP[rec.locationId] || { code: rec.locationId };
      const stallLabel = rec.vendorName ? ` (${rec.vendorName})` : '';
      if (confirm(`Delete pickup record: ${rec.kg} kg at ${loc.code}${stallLabel}?`)) {
        records = records.filter(r => r.id !== recId);
        saveRecordsStorage();
        updateUI();
        pushRecordToCloud({ id: recId, _deleted: true });
        showToast('Pickup record deleted');
      }
    });
  });

  // Map Markers & Popups Update
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

      // Build Leaflet Popup showing Stalls in this KK
      const locVendors = vendors.filter(v => v.locationId === loc.id);
      const vendorsHtml = locVendors.length > 0 ? `
        <ul class="map-popup-vendor-list">
          ${locVendors.map(v => {
            const statusClass = (v.status || '').toLowerCase().replace(/\s+/g, '');
            return `
              <li class="map-popup-vendor-item">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong>${escapeHtml(v.name)}</strong>
                  <span class="badge-status badge-${statusClass}">${escapeHtml(v.status)}</span>
                </div>
                ${v.requirement ? `<div style="color:#6B7280;font-size:11px;">⚠️ ${escapeHtml(v.requirement)}</div>` : ''}
                ${v.contact ? `<a href="tel:${cleanPhone(v.contact)}" class="vendor-contact-link" style="font-size:11px;">📞 ${escapeHtml(v.contact)}</a>` : ''}
              </li>
            `;
          }).join('')}
        </ul>
      ` : `
        <p style="font-size:12px;color:#8E8E93;margin-bottom:8px;">No cafe stalls registered yet.</p>
      `;

      const popupContent = `
        <div style="min-width:200px;">
          <div class="map-popup-title">${loc.code} — ${escapeHtml(loc.name)}</div>
          <div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:8px;">
            ${total.toFixed(1)} kg collected
          </div>
          ${vendorsHtml}
          <div class="map-popup-actions">
            <button type="button" class="btn-popup-log" onclick="window.ucoApp.openLog('${loc.id}')">Log Pickup</button>
            <button type="button" class="btn-popup-add" onclick="window.ucoApp.openAddVendor('${loc.id}')">+ Add Cafe</button>
          </div>
        </div>
      `;

      marker.unbindPopup();
      marker.bindPopup(popupContent, { maxWidth: 260 });
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
    markers[loc.id] = marker;
  });
}

// Bottom Sheet Open/Close
function openSheetWithLocation(locationId, vendorId = '') {
  if (locationId) {
    locationSelect.value = locationId;
    updateVendorSelectOptions(locationId, vendorId);
  }
  const dateInput = $('#dateInput');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  clearPhotoInput();
  sheetBackdrop.classList.add('visible');
  logSheet.classList.add('open');
}

function closeSheet() {
  sheetBackdrop.classList.remove('visible');
  logSheet.classList.remove('open');
  clearPhotoInput();
  const dateInput = $('#dateInput');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function clearPhotoInput() {
  currentCompressedPhoto = '';
  photoInput.value = '';
  photoPreviewBox.hidden = true;
  photoPrompt.hidden = false;
  photoPreviewImg.src = '';
}

// Setup Forms, Listeners & Navigation
function setupApp() {
  // Populate Location Dropdown in Pickup Sheet
  const resGroup = document.createElement('optgroup');
  resGroup.label = 'Residential Colleges (KK1 - KK13)';
  const facGroup = document.createElement('optgroup');
  facGroup.label = 'Faculty Cafeterias';

  // Populate Location Dropdown in Vendor Sheet
  const vendorResGroup = document.createElement('optgroup');
  vendorResGroup.label = 'Residential Colleges (KK1 - KK13)';
  const vendorFacGroup = document.createElement('optgroup');
  vendorFacGroup.label = 'Faculty Cafeterias';

  UM_LOCATIONS.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.id;
    opt.textContent = `${loc.code} — ${loc.name}`;
    if (loc.type === 'residential') resGroup.appendChild(opt);
    else facGroup.appendChild(opt);

    const vOpt = document.createElement('option');
    vOpt.value = loc.id;
    vOpt.textContent = `${loc.code} — ${loc.name}`;
    if (loc.type === 'residential') vendorResGroup.appendChild(vOpt);
    else vendorFacGroup.appendChild(vOpt);
  });

  locationSelect.appendChild(resGroup);
  locationSelect.appendChild(facGroup);

  vendorLocationSelect.appendChild(vendorResGroup);
  vendorLocationSelect.appendChild(vendorFacGroup);

  // Location select change updates vendor options
  locationSelect.addEventListener('change', () => {
    updateVendorSelectOptions(locationSelect.value);
  });

  vendorSelect.addEventListener('change', () => {
    updateVendorRequirementHint();
  });

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

  // Steppers for Pickup Weight
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

  // Lightbox Close
  closeLightboxBtn.addEventListener('click', closeLightbox);
  lightboxScrim.addEventListener('click', closeLightbox);

  // Pickup Form Submit
  pickupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const kg = parseFloat(weightInput.value);
    if (!kg || kg <= 0) return;
    if (kg > 500) {
      showToast('Maximum 500 kg per entry');
      return;
    }

    const locId = locationSelect.value;
    const vId = vendorSelect.value;
    const vObj = vendors.find(v => v.id === vId);

    const dateInput = $('#dateInput');
    const chosenDate = dateInput ? dateInput.value : '';
    const recordTimestamp = chosenDate
      ? new Date(chosenDate + 'T12:00:00').getTime()
      : Date.now();

    const newRecord = {
      id: 'rec-' + Date.now(),
      locationId: locId,
      vendorId: vId || null,
      vendorName: vObj ? vObj.name : '',
      kg: Math.round(kg * 10) / 10,
      collector: selectedCollector,
      tag: selectedTag,
      notes: notesInput.value.trim(),
      photo: currentCompressedPhoto,
      timestamp: recordTimestamp
    };

    records.push(newRecord);
    records.sort((a, b) => a.timestamp - b.timestamp);
    saveRecordsStorage();
    updateUI();
    closeSheet();
    notesInput.value = '';
    const locTitle = LOCATIONS_MAP[newRecord.locationId].code;
    const stallTitle = newRecord.vendorName ? ` (${newRecord.vendorName})` : '';
    showToast(`Saved ${newRecord.kg} kg at ${locTitle}${stallTitle}`);

    pushRecordToCloud(newRecord);
  });

  // Sheet Controls
  $('#openLogBtn').addEventListener('click', () => openSheetWithLocation(locationSelect.value || 'kk2'));
  $('#closeSheetBtn').addEventListener('click', closeSheet);
  sheetBackdrop.addEventListener('click', closeSheet);

  // Vendor Sheet Controls
  if (addNewVendorBtn) {
    addNewVendorBtn.addEventListener('click', () => openVendorSheet());
  }
  if (closeVendorSheetBtn) {
    closeVendorSheetBtn.addEventListener('click', closeVendorSheet);
  }
  if (vendorSheetBackdrop) {
    vendorSheetBackdrop.addEventListener('click', closeVendorSheet);
  }

  // Vendor Status Chips Selection
  if (vendorStatusChips) {
    vendorStatusChips.addEventListener('click', e => {
      const btn = e.target.closest('[data-status]');
      if (!btn) return;
      setVendorStatusChip(btn.dataset.status);
    });
  }

  // Vendor Form Submit (Add or Edit)
  if (vendorForm) {
    vendorForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = vendorNameInput.value.trim();
      if (!name) return;

      const editId = vendorEditId.value;
      const locId = vendorLocationSelect.value;
      const req = vendorRequirementInput.value.trim();
      const contact = vendorContactInput.value.trim();

      if (editId) {
        // Edit existing
        const idx = vendors.findIndex(v => v.id === editId);
        if (idx >= 0) {
          vendors[idx] = {
            ...vendors[idx],
            locationId: locId,
            name,
            status: selectedVendorStatus,
            requirement: req,
            contact,
            updatedAt: Date.now()
          };
          pushVendorToCloud(vendors[idx]);
        }
      } else {
        // Add new
        const newVendor = {
          id: 'v-' + Date.now(),
          locationId: locId,
          name,
          status: selectedVendorStatus,
          requirement: req,
          contact,
          updatedAt: Date.now()
        };
        vendors.push(newVendor);
        pushVendorToCloud(newVendor);
      }

      saveVendorsStorage();
      renderVendors();
      updateUI();
      updateVendorSelectOptions(locationSelect.value);
      closeVendorSheet();
      showToast(`Saved cafe stall: ${name}`);
    });
  }

  // Delete Vendor Button
  if (deleteVendorBtn) {
    deleteVendorBtn.addEventListener('click', () => {
      const editId = vendorEditId.value;
      if (!editId) return;

      const toDelete = vendors.find(v => v.id === editId);
      vendors = vendors.filter(v => v.id !== editId);
      saveVendorsStorage();
      renderVendors();
      updateUI();
      updateVendorSelectOptions(locationSelect.value);
      closeVendorSheet();

      if (toDelete) {
        pushVendorToCloud({ id: editId, _deleted: true });
        showToast(`Removed stall: ${toDelete.name}`);
      }
    });
  }

  // Status Filter Bar in Cafes Directory
  if (statusFilterBar) {
    statusFilterBar.addEventListener('click', e => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      statusFilterBar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderVendors(btn.dataset.filter);
    });
  }

  // Bottom Dock Tabs
  document.querySelectorAll('.dock-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetTab = $('#' + btn.dataset.tab);
      if (targetTab) targetTab.classList.add('active');
      if (btn.dataset.tab === 'tab-map' && map) {
        setTimeout(() => map.invalidateSize(), 120);
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

  // Initial populate of vendor options
  updateVendorSelectOptions(locationSelect.value || 'kk2');
}

// Global hook for Map popups
window.ucoApp = {
  openLog: (locId) => {
    if (map) map.closePopup();
    openSheetWithLocation(locId);
  },
  openAddVendor: (locId) => {
    if (map) map.closePopup();
    openVendorSheet(null, locId);
  }
};

// Start Application
window.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initMap();
  setupApp();
  renderVendors('All');
  updateUI();
  syncWithCloud();

  // Background sync every 25 seconds across teammates
  setInterval(syncWithCloud, 25000);
});
