/* ═══════════════════════════════════════════════════════════════
   hepacheck.js  —  Client-side helpers for HepaCheck
   Auth is handled server-side (FastAPI + JWT cookie).
   This file only handles:
     • Tab navigation
     • Client-side score calculation (preview only)
     • localStorage-backed reports / emergency contacts
     • Community forum (in-memory, session only)
     • Doctor flags / appointments (localStorage)
═══════════════════════════════════════════════════════════════ */

/* ── Login page: role selector ───────────────────────────────── */
function selectRole(r) {
  var patBtn = document.getElementById('role-patient');
  var docBtn = document.getElementById('role-doctor');
  var input  = document.getElementById('role-input');
  if (patBtn) patBtn.classList.toggle('active', r === 'patient');
  if (docBtn) docBtn.classList.toggle('active', r === 'doctor');
  if (input)  input.value = r;
}

/* ── Patient tab navigation ──────────────────────────────────── */
function goChooseDoctor() {
  var cd = document.getElementById('nav-choose-doctor');
  if (cd) { cd.classList.remove('active'); cd.blur(); }
  window.location.href = '/patient/choose-doctor';
}

function showPatientTab(tab) {
  var tabs = ['home','scores','reports','info','community','emergency','contact'];
  for (var i = 0; i < tabs.length; i++) {
    var el = document.getElementById('ptab-' + tabs[i]);
    if (el) el.style.display = (tabs[i] === tab) ? '' : 'none';
  }
  var allLinks = document.querySelectorAll('#patient-nav .nav-link');
  for (var j = 0; j < allLinks.length; j++) {
    allLinks[j].classList.remove('active');
    allLinks[j].blur();
  }
  var navMap = {
    home:'nav-home', scores:'nav-scores', reports:'nav-reports',
    info:'nav-info', community:'nav-community',
    emergency:'nav-emergency', contact:'nav-contact'
  };
  if (navMap[tab]) {
    var target = document.getElementById(navMap[tab]);
    if (target) target.classList.add('active');
  }
  if (tab === 'community') renderCommunityPosts();
  if (tab === 'reports')   renderReports();
}

/* ── Doctor tab navigation ───────────────────────────────────── */
function showDoctorTab(tab) {
  document.querySelectorAll('[id^="dtab-"]').forEach(function(el) {
    el.style.display = 'none';
  });
  var target = document.getElementById('dtab-' + tab);
  if (target) target.style.display = '';

  document.querySelectorAll('#doctor-nav .nav-link').forEach(function(l) {
    l.classList.remove('active');
  });
  var map = { home:0, scores:1, patients:2, 'emergency-flag':3, appointments:4, contact:5 };
  var links = document.querySelectorAll('#doctor-nav .nav-link');
  if (map[tab] !== undefined) links[map[tab]].classList.add('active');
  if (tab === 'appointments') renderAppointments();
  if (tab === 'emergency-flag') renderFlags();
}

/* ═══════════════════════════════════════════════════════════════
   SCORE CALCULATION  (client-side preview — not saved here)
   Saving is done via POST /patient/score in routes_patient.py
═══════════════════════════════════════════════════════════════ */
function calcScores(age, ast, alt, plt, alb, bmi, glu, ins, diabetes) {
  var fib4 = (plt > 0 && alt > 0) ? (age * ast) / (plt * Math.sqrt(alt)) : null;
  var apri = plt > 0 ? (ast / 40 * 100) / plt : null;
  var nfs  = (age && bmi && plt && alb && ast && alt)
    ? -1.675 + 0.037*age + 0.094*bmi + 1.13*(diabetes ? 1 : 0)
      + 0.99*(ast/alt) - 0.013*plt - 0.66*alb
    : null;
  var homa = (glu && ins) ? (glu * ins) / 405 : null;
  return { fib4: fib4, apri: apri, nfs: nfs, homa: homa };
}

function riskFib4(v) { return v < 1.30 ? 'Low' : v < 2.67 ? 'Moderate' : 'High'; }
function riskApri(v) { return v < 0.5  ? 'Low' : v < 1.5  ? 'Moderate' : 'High'; }
function riskNfs(v)  { return v < -1.455 ? 'Low' : v < 0.676 ? 'Moderate' : 'High'; }
function riskHoma(v) { return v < 2.5  ? 'Normal' : v < 5.0 ? 'Elevated' : 'High'; }
function riskColor(r) {
  return (r === 'Low' || r === 'Normal') ? 'var(--hc-green)'
       : (r === 'Moderate' || r === 'Elevated') ? 'var(--hc-amber)'
       : 'var(--hc-red)';
}

function setResultBoxes(fib4, apri, nfs, homa, prefix) {
  var p = prefix || 'r-';
  function setBox(id, val, riskFn, decimals) {
    if (val !== null) {
      var el = document.getElementById(p + id);
      var re = document.getElementById(p + id + '-r');
      if (el) el.textContent = val.toFixed(decimals || 2);
      if (re) { var r = riskFn(val); re.textContent = r; re.style.color = riskColor(r); }
    }
  }
  setBox('fib4', fib4, riskFib4, 2);
  setBox('apri', apri, riskApri, 3);
  setBox('nfs',  nfs,  riskNfs,  3);
  setBox('homa', homa, riskHoma, 2);
}

/* Patient scores tab — compute button */
function computeScores() {
  var age = +document.getElementById('s-age').value;
  var ast = +document.getElementById('s-ast').value;
  var alt = +document.getElementById('s-alt').value;
  var plt = +document.getElementById('s-plt').value;
  var alb = +document.getElementById('s-alb').value;
  var bmi = +document.getElementById('s-bmi').value;
  var glu = +document.getElementById('s-glu').value;
  var ins = +document.getElementById('s-ins').value;
  var dia = document.getElementById('s-diabetes') && document.getElementById('s-diabetes').checked;
  var scores = calcScores(age, ast, alt, plt, alb, bmi, glu, ins, dia);
  setResultBoxes(scores.fib4, scores.apri, scores.nfs, scores.homa, 'r-');
  updateHomeKPIs(scores.fib4, scores.apri, scores.nfs, scores.homa);
}

function clearScoreForm() {
  ['s-age','s-ast','s-alt','s-plt','s-alb','s-bmi','s-glu','s-ins'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var dia = document.getElementById('s-diabetes');
  if (dia) dia.checked = false;
  ['r-fib4','r-apri','r-nfs','r-homa'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '—';
  });
  ['r-fib4-r','r-apri-r','r-nfs-r','r-homa-r'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = '—'; el.style.color = 'var(--text-muted)'; }
  });
}

/* Doctor scores tab — compute button */
function computeDocScores() {
  var age = +document.getElementById('ds-age').value;
  var ast = +document.getElementById('ds-ast').value;
  var alt = +document.getElementById('ds-alt').value;
  var plt = +document.getElementById('ds-plt').value;
  var alb = +document.getElementById('ds-alb').value;
  var bmi = +document.getElementById('ds-bmi').value;
  var glu = +document.getElementById('ds-glu').value;
  var ins = +document.getElementById('ds-ins').value;
  var scores = calcScores(age, ast, alt, plt, alb, bmi, glu, ins, false);
  setResultBoxes(scores.fib4, scores.apri, scores.nfs, scores.homa, 'dr-');
}

function clearDocScoreForm() {
  ['ds-pid','ds-age','ds-ast','ds-alt','ds-plt','ds-alb','ds-bmi','ds-glu','ds-ins'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['dr-fib4','dr-apri','dr-nfs','dr-homa'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '—';
  });
  ['dr-fib4-r','dr-apri-r','dr-nfs-r','dr-homa-r'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = '—'; el.style.color = 'var(--text-muted)'; }
  });
}

/* ── Home KPI cards ──────────────────────────────────────────── */
function updateHomeKPIs(fib4, apri, nfs, homa) {
  function setBadge(valId, badgeId, val, riskFn) {
    if (val === null || isNaN(val)) return;
    var vEl = document.getElementById(valId);
    var bEl = document.getElementById(badgeId);
    if (!vEl || !bEl) return;
    vEl.textContent = val.toFixed(2);
    var r = riskFn(val);
    bEl.textContent = r;
    bEl.className = 'kpi-badge ' + (r === 'Low' || r === 'Normal' ? 'low' : r === 'Moderate' || r === 'Elevated' ? 'mod' : 'high');
  }
  setBadge('home-fib4', 'home-fib4-risk', fib4, riskFib4);
  setBadge('home-apri', 'home-apri-risk', apri, riskApri);
  setBadge('home-nfs',  'home-nfs-risk',  nfs,  riskNfs);
  setBadge('home-homa', 'home-homa-risk', homa, riskHoma);
  if (fib4 !== null) updateGauge(fib4);
}

function updateGauge(fib4) {
  var pct = Math.min(100, Math.max(0, (fib4 / 5) * 100));
  var arcLen = (pct / 100) * 188;
  var arc = document.getElementById('gauge-arc');
  var txt = document.getElementById('gauge-pct-text');
  var lbl = document.getElementById('gauge-risk-label');
  if (!arc) return;
  arc.setAttribute('stroke-dasharray', arcLen + ' 200');
  var color = fib4 < 1.30 ? '#3d8b37' : fib4 < 2.67 ? '#b45309' : '#e53e3e';
  arc.setAttribute('stroke', color);
  if (txt) txt.textContent = pct.toFixed(0) + '%';
  if (lbl) { lbl.textContent = riskFib4(fib4) + ' Risk'; lbl.style.color = color; }
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS  (localStorage — keyed by a stable session key)
   NOTE: uses a generic key since we have no JS currentUser.
   The real history comes from the server via /patient/home.
   This section handles the client-side "quick save" display.
═══════════════════════════════════════════════════════════════ */
var REPORT_KEY = 'hepacheck_reports';

function saveScores() {
  var fib4El = document.getElementById('r-fib4');
  if (!fib4El || fib4El.textContent === '—') {
    alert('Please compute scores first.');
    return;
  }
  var entry = {
    date:    new Date().toLocaleDateString('en-IN'),
    fib4:    document.getElementById('r-fib4').textContent,
    fib4Risk:document.getElementById('r-fib4-r').textContent,
    apri:    document.getElementById('r-apri').textContent,
    nfs:     document.getElementById('r-nfs').textContent,
    homa:    document.getElementById('r-homa').textContent,
  };
  var history = JSON.parse(localStorage.getItem(REPORT_KEY) || '[]');
  history.unshift(entry);
  localStorage.setItem(REPORT_KEY, JSON.stringify(history));
  alert('Scores saved locally. Use the Reports tab to view history.');
  renderReports();
  // Count badge
  var badge = document.getElementById('history-count-badge');
  if (badge) badge.textContent = history.length + ' entr' + (history.length === 1 ? 'y' : 'ies');
}

function renderReports() {
  var wrap = document.getElementById('reports-table-wrap');
  if (!wrap) return;
  var history = JSON.parse(localStorage.getItem(REPORT_KEY) || '[]');
  var badge = document.getElementById('history-count-badge');
  if (badge) badge.textContent = history.length + ' entr' + (history.length === 1 ? 'y' : 'ies');

  if (history.length === 0) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No saved results yet. Compute scores and click Save.</p></div>';
    return;
  }
  var rows = history.map(function(e) {
    var cls = e.fib4Risk === 'Low' ? 'low' : e.fib4Risk === 'Moderate' ? 'moderate' : 'high';
    return '<tr><td>' + e.date + '</td><td>' + e.fib4 + '</td>'
      + '<td><span class="risk-pill ' + cls + '">' + e.fib4Risk + '</span></td>'
      + '<td>' + e.apri + '</td><td>' + e.nfs + '</td><td>' + e.homa + '</td></tr>';
  }).join('');
  wrap.innerHTML = '<table class="data-table"><thead><tr>'
    + '<th>Date</th><th>FIB-4</th><th>Risk</th><th>APRI</th><th>NFS</th><th>HOMA-IR</th>'
    + '</tr></thead><tbody>' + rows + '</tbody></table>';
  renderHistoryChart(history);
}

function renderHistoryChart(history) {
  var chartWrap = document.getElementById('home-history-chart');
  if (!chartWrap || history.length === 0) return;
  var max5 = history.slice(0, 5).reverse();
  var html = max5.map(function(e) {
    var val = parseFloat(e.fib4) || 0;
    var pct = Math.min(100, (val / 5) * 100);
    var color = val < 1.30 ? 'var(--hc-green)' : val < 2.67 ? 'var(--hc-amber)' : 'var(--hc-red)';
    return '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.6rem;">'
      + '<span style="font-size:.75rem;color:var(--text-muted);width:90px;flex-shrink:0;">' + e.date + '</span>'
      + '<div style="flex:1;height:20px;background:var(--hc-green-light);border-radius:4px;overflow:hidden;">'
      + '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:4px;display:flex;align-items:center;padding-left:6px;">'
      + '<span style="font-size:.72rem;font-weight:700;color:#fff;">' + e.fib4 + '</span>'
      + '</div></div></div>';
  }).join('');
  chartWrap.innerHTML = '<div style="font-size:.75rem;color:var(--text-muted);margin-bottom:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">FIB-4 History (local)</div>' + html;
}

function clearReports() {
  if (!confirm('Clear all locally saved reports?')) return;
  localStorage.removeItem(REPORT_KEY);
  renderReports();
}

/* ═══════════════════════════════════════════════════════════════
   ACCORDION  (Info tab)
═══════════════════════════════════════════════════════════════ */
function toggleAcc(header) {
  var body = header.nextElementSibling;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
}

/* ═══════════════════════════════════════════════════════════════
   EMERGENCY CONTACTS  (localStorage)
═══════════════════════════════════════════════════════════════ */
function saveEmergency() {
  var data = {
    c1n: (document.getElementById('em-c1n') || {}).value || '',
    c1p: (document.getElementById('em-c1p') || {}).value || '',
    c2n: (document.getElementById('em-c2n') || {}).value || '',
    c2p: (document.getElementById('em-c2p') || {}).value || '',
    dn:  (document.getElementById('em-dn')  || {}).value || '',
    dp:  (document.getElementById('em-dp')  || {}).value || '',
    amb: (document.getElementById('em-amb') || {}).value || '',
  };
  localStorage.setItem('hepacheck_emergency', JSON.stringify(data));
  alert('Emergency contacts saved!');
}

function resetEmergency() {
  ['em-c1n','em-c1p','em-c2n','em-c2p','em-dn','em-dp','em-amb'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  localStorage.removeItem('hepacheck_emergency');
}

(function loadEmergency() {
  var data = JSON.parse(localStorage.getItem('hepacheck_emergency') || '{}');
  var map = { 'em-c1n':'c1n','em-c1p':'c1p','em-c2n':'c2n','em-c2p':'c2p',
              'em-dn':'dn','em-dp':'dp','em-amb':'amb' };
  Object.keys(map).forEach(function(id) {
    var el = document.getElementById(id);
    if (el && data[map[id]]) el.value = data[map[id]];
  });
})();

/* ═══════════════════════════════════════════════════════════════
   COMMUNITY FORUM  (in-memory, resets on page reload)
   For persistence, wire submitPost() to POST /patient/community
═══════════════════════════════════════════════════════════════ */
var forumPosts = [];
var selectedTag = 'Question';
var myPostCount = 0;

function selectTag(el, tag) {
  document.querySelectorAll('.forum-tag').forEach(function(t) { t.classList.remove('selected'); });
  el.classList.add('selected');
  selectedTag = tag;
}

function submitPost() {
  var text = (document.getElementById('forum-post-text') || {}).value;
  if (!text || !text.trim()) { alert('Please write something before posting.'); return; }
  var nameEl = document.getElementById('patient-name-badge');
  var realName = (nameEl && nameEl.textContent.trim()) ? nameEl.textContent.trim() : 'Patient';
  var words = realName.split(' ');
  var initials = words.map(function(w){ return w[0]||''; }).join('').toUpperCase().slice(0,2) || 'PT';
  var newPost = {
    id: Date.now(),
    author: realName,
    initials: initials,
    tag: selectedTag,
    body: text.trim(),
    time: 'Just now',
    likes: 0,
    replies: [],
    isOwn: true,
  };
  forumPosts.unshift(newPost);
  myPostCount++;
  document.getElementById('forum-post-text').value = '';
  var sp = document.getElementById('stat-posts');
  var sm = document.getElementById('stat-my-posts');
  if (sp) sp.textContent = forumPosts.length;
  if (sm) sm.textContent = myPostCount;
  renderCommunityPosts();
}

function renderCommunityPosts() {
  var wrap = document.getElementById('forum-posts-wrap');
  if (!wrap) return;
  if (forumPosts.length === 0) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>No posts yet. Be the first to share!</p></div>';
    return;
  }
  wrap.innerHTML = forumPosts.map(function(post) {
    var repliesHtml = post.replies.map(function(r) {
      return '<div class="reply"><div class="reply-author">' + r.author + '</div>' + r.body + '</div>';
    }).join('');
    return '<div class="forum-post" id="post-' + post.id + '">'
      + '<div class="post-header">'
      + '<div class="post-avatar" style="background:' + avatarColor(post.initials) + '">' + post.initials + '</div>'
      + '<div class="post-meta">'
      + '<div class="post-author">' + post.author + ' <span class="post-tag">' + post.tag + '</span></div>'
      + '<div class="post-time">' + post.time + '</div>'
      + '</div></div>'
      + '<div class="post-body">' + post.body + '</div>'
      + '<div class="post-actions">'
      + '<button class="post-action-btn" onclick="likePost(' + post.id + ', this)">❤ ' + post.likes + ' Likes</button>'
      + '<button class="post-action-btn" onclick="toggleReplies(' + post.id + ')">💬 ' + post.replies.length + ' Replies</button>'
      + '</div>'
      + '<div class="post-replies" id="replies-' + post.id + '" style="display:none;">'
      + repliesHtml
      + '<div class="reply-input">'
      + '<input type="text" placeholder="Write a reply..." id="reply-input-' + post.id + '">'
      + '<button class="reply-submit" onclick="submitReply(' + post.id + ')">Reply</button>'
      + '</div></div></div>';
  }).join('');
}

function avatarColor(initials) {
  var colors = ['#3d8b37','#0f766e','#1e40af','#7c3aed','#b45309','#be123c'];
  var hash = 0;
  for (var i = 0; i < initials.length; i++) hash += initials.charCodeAt(i);
  return colors[hash % colors.length];
}

function likePost(id, btn) {
  var post = forumPosts.find(function(p) { return p.id === id; });
  if (post) { post.likes++; btn.textContent = '❤ ' + post.likes + ' Likes'; }
}

function toggleReplies(id) {
  var el = document.getElementById('replies-' + id);
  if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function submitReply(id) {
  var input = document.getElementById('reply-input-' + id);
  if (!input || !input.value.trim()) return;
  var post = forumPosts.find(function(p) { return p.id === id; });
  if (post) {
    var rn = document.getElementById('patient-name-badge');
    var rName = (rn && rn.textContent.trim()) ? rn.textContent.trim() : 'Patient';
    post.replies.push({ author: rName, body: input.value.trim() });
    renderCommunityPosts();
    var el = document.getElementById('replies-' + id);
    if (el) el.style.display = 'block';
  }
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR — EMERGENCY FLAGS  (localStorage)
═══════════════════════════════════════════════════════════════ */
var flagTab = 'open';

function addFlag() {
  var patientEl = document.getElementById('ef-patient');
  var patientVal = patientEl
    ? (patientEl.tagName === 'SELECT'
        ? patientEl.options[patientEl.selectedIndex].text
        : patientEl.value)
    : '';
  if (!patientVal || patientVal === 'Select patient…') {
    alert('Please select a patient.'); return;
  }
  var flag = {
    id:       Date.now(),
    date:     (document.getElementById('ef-date') || {}).value || '—',
    time:     (document.getElementById('ef-time') || {}).value || '—',
    patient:  patientVal,
    severity: (document.getElementById('ef-severity') || {}).value || 'High',
    category: (document.getElementById('ef-category') || {}).value || 'Other',
    notes:    (document.getElementById('ef-notes') || {}).value || '',
    status:   'open',
  };
  var flags = JSON.parse(localStorage.getItem('hepacheck_flags') || '[]');
  flags.unshift(flag);
  localStorage.setItem('hepacheck_flags', JSON.stringify(flags));
  ['ef-date','ef-time','ef-notes'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  if (patientEl && patientEl.tagName === 'SELECT') patientEl.selectedIndex = 0;
  renderFlags();
  updateDocStats();
}

function renderFlags(filter) {
  var wrap = document.getElementById('flags-list');
  if (!wrap) return;
  var flags = JSON.parse(localStorage.getItem('hepacheck_flags') || '[]');
  var shown = flags.filter(function(f) { return f.status === flagTab; });
  if (filter) {
    var q = filter.toLowerCase();
    shown = shown.filter(function(f) {
      return (f.patient + f.notes + f.category).toLowerCase().indexOf(q) !== -1;
    });
  }
  if (!shown.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">🚨</div><p>No ' + flagTab + ' flags.</p></div>';
    return;
  }
  wrap.innerHTML = shown.map(function(f) {
    return '<div class="flag-list-item">'
      + '<span class="flag-severity ' + f.severity.toLowerCase() + '">' + f.severity + '</span>'
      + '<div style="flex:1;">'
      + '<div style="font-weight:600;font-size:.9rem;">' + f.patient
      + ' <span style="font-weight:400;color:var(--text-muted);font-size:.82rem;">— ' + f.category + '</span></div>'
      + '<div style="font-size:.78rem;color:var(--text-muted);">' + f.date + ' ' + f.time
      + (f.notes ? ' · ' + f.notes : '') + '</div></div>'
      + (flagTab === 'open'
          ? '<button class="btn-outline" style="font-size:.78rem;padding:.3rem .7rem;color:var(--hc-green);border-color:var(--hc-green);" onclick="resolveFlag(' + f.id + ')">✓ Resolve</button>'
          : '')
      + '</div>';
  }).join('');
  updateDocStats();
}

function resolveFlag(id) {
  var flags = JSON.parse(localStorage.getItem('hepacheck_flags') || '[]');
  var f = flags.find(function(x) { return x.id === id; });
  if (f) { f.status = 'resolved'; localStorage.setItem('hepacheck_flags', JSON.stringify(flags)); }
  renderFlags();
}

function clearFlags() {
  if (!confirm('Clear all flags?')) return;
  localStorage.removeItem('hepacheck_flags');
  renderFlags();
}

function switchFlagTab(tab) {
  flagTab = tab;
  var open = document.getElementById('flag-tab-open');
  var res  = document.getElementById('flag-tab-resolved');
  if (open) open.classList.toggle('active', tab === 'open');
  if (res)  res.classList.toggle('active',  tab === 'resolved');
  renderFlags();
}

function searchFlags(val) { renderFlags(val); }

/* ═══════════════════════════════════════════════════════════════
   DOCTOR — APPOINTMENTS  (localStorage)
═══════════════════════════════════════════════════════════════ */
var apptTab = 'upcoming';

function addAppointment() {
  var patientEl = document.getElementById('ap-patient');
  var patientVal = patientEl
    ? (patientEl.tagName === 'SELECT'
        ? patientEl.options[patientEl.selectedIndex].text
        : patientEl.value)
    : '';
  if (!patientVal || patientVal === 'Select patient…') {
    alert('Please select a patient.'); return;
  }
  var appt = {
    id:       Date.now(),
    date:     (document.getElementById('ap-date') || {}).value || '—',
    time:     (document.getElementById('ap-time') || {}).value || '—',
    patient:  patientVal,
    type:     (document.getElementById('ap-type') || {}).value || 'Consult',
    location: (document.getElementById('ap-location') || {}).value || 'Clinic',
    notes:    (document.getElementById('ap-notes') || {}).value || '',
    status:   'upcoming',
  };
  var appts = JSON.parse(localStorage.getItem('hepacheck_appts') || '[]');
  appts.unshift(appt);
  localStorage.setItem('hepacheck_appts', JSON.stringify(appts));
  ['ap-date','ap-time','ap-notes'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  if (patientEl && patientEl.tagName === 'SELECT') patientEl.selectedIndex = 0;
  renderAppointments();
  updateDocStats();
}

function renderAppointments(filter) {
  var wrap = document.getElementById('appts-list');
  if (!wrap) return;
  var appts = JSON.parse(localStorage.getItem('hepacheck_appts') || '[]');
  var shown = appts.filter(function(a) { return a.status === apptTab; });
  if (filter) {
    var q = filter.toLowerCase();
    shown = shown.filter(function(a) {
      return (a.patient + a.notes + a.type).toLowerCase().indexOf(q) !== -1;
    });
  }
  if (!shown.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>No ' + apptTab + ' appointments.</p></div>';
    return;
  }
  wrap.innerHTML = shown.map(function(a) {
    return '<div class="flag-list-item">'
      + '<div style="text-align:center;min-width:65px;">'
      + '<div style="font-size:.78rem;font-weight:700;color:var(--hc-blue);">' + a.date + '</div>'
      + '<div style="font-size:.75rem;color:var(--text-muted);">' + a.time + '</div></div>'
      + '<div style="flex:1;">'
      + '<div style="font-weight:600;font-size:.9rem;">' + a.patient
      + ' <span class="risk-pill low" style="font-size:.7rem;margin-left:.4rem;">' + a.type + '</span></div>'
      + '<div style="font-size:.78rem;color:var(--text-muted);">' + a.location
      + (a.notes ? ' · ' + a.notes : '') + '</div></div>'
      + (apptTab === 'upcoming'
          ? '<button class="btn-outline" style="font-size:.78rem;padding:.3rem .7rem;" onclick="markApptPast(' + a.id + ')">✓ Done</button>'
          : '')
      + '</div>';
  }).join('');
  updateDocStats();
}

function markApptPast(id) {
  var appts = JSON.parse(localStorage.getItem('hepacheck_appts') || '[]');
  var a = appts.find(function(x) { return x.id === id; });
  if (a) { a.status = 'past'; localStorage.setItem('hepacheck_appts', JSON.stringify(appts)); }
  renderAppointments();
}

function clearAppointments() {
  if (!confirm('Clear all appointments?')) return;
  localStorage.removeItem('hepacheck_appts');
  renderAppointments();
}

function switchApptTab(tab) {
  apptTab = tab;
  var up   = document.getElementById('appt-tab-upcoming');
  var past = document.getElementById('appt-tab-past');
  if (up)   up.classList.toggle('active',   tab === 'upcoming');
  if (past) past.classList.toggle('active', tab === 'past');
  renderAppointments();
}

function searchAppts(val) { renderAppointments(val); }

function updateDocStats() {
  var flags = JSON.parse(localStorage.getItem('hepacheck_flags') || '[]');
  var appts = JSON.parse(localStorage.getItem('hepacheck_appts') || '[]');
  var cfg   = document.getElementById('doctor-page-config');
  var serverFlags = cfg ? parseInt(cfg.getAttribute('data-open-flags') || '0', 10) : 0;
  var flagEl = document.getElementById('doc-open-flags');
  var apptEl = document.getElementById('doc-upcoming-appts');
  if (flagEl) flagEl.textContent = serverFlags + flags.filter(function(f) { return f.status === 'open'; }).length;
  if (apptEl) apptEl.textContent = appts.filter(function(a) { return a.status === 'upcoming'; }).length;
}

/* ── Patient search ──────────────────────────────────────────── */
function searchPatients(val) {
  document.querySelectorAll('#patients-list .patient-row').forEach(function(row) {
    var name  = row.getAttribute('data-name')  || '';
    var email = row.getAttribute('data-email') || '';
    row.style.display = (name + email).indexOf(val.toLowerCase()) !== -1 ? '' : 'none';
  });
}

/* ── Init on DOMContentLoaded ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  /* Doctor page */
  var cfg = document.getElementById('doctor-page-config');
  if (cfg) {
    var serverTab  = cfg.getAttribute('data-tab')    || 'home';
    var showDetail = cfg.getAttribute('data-detail') || 'false';
    if (showDetail === 'true') {
      showDoctorTab('patients');
      var detail = document.getElementById('dtab-patient-detail');
      if (detail) {
        document.querySelectorAll('[id^="dtab-"]').forEach(function(el) { el.style.display = 'none'; });
        detail.style.display = '';
      }
    } else {
      showDoctorTab(serverTab);
    }
    document.querySelectorAll('.risk-bar').forEach(function(el) {
      el.style.width = (el.getAttribute('data-pct') || 0) + '%';
    });
    updateDocStats();
  }

  /* Patient page */
  if (document.getElementById('patient-nav')) {
    /* On the choose-doctor page the active nav highlight is set in HTML —
       skip tab switching so we don't strip it. */
    var isChooseDoctor = window.location.pathname.indexOf('choose-doctor') !== -1;
    if (!isChooseDoctor) {
      /* Strip active + focus from Choose Doctor when on patient/home */
      var cd = document.getElementById('nav-choose-doctor');
      if (cd) { cd.classList.remove('active'); cd.blur(); }

      /* Restore tab from URL hash, default to 'home' */
      var hash = window.location.hash.replace('#', '');
      var validTabs = ['home','scores','reports','info','community','emergency','contact'];
      if (hash && validTabs.indexOf(hash) !== -1) {
        showPatientTab(hash);
      } else {
        showPatientTab('home');
      }
      if (document.getElementById('reports-table-wrap')) renderReports();
    }
  }
});