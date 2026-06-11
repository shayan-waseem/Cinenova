/**
 * Cinema Management System - Admin Portal
 * Main Application JavaScript
 * 
 * Uses safe DOM manipulation (textContent, createElement, etc.)
 * No innerHTML usage for security (XSS prevention)
 */

// ============================================
// APP STATE
// ============================================
const AppState = {
  currentPage: 'dashboard',
  dashboardData: null,
  movies: [],
  shows: [],
  bookings: [],
  foodOrders: [],
  complaints: [],
  auditoriums: [],
  schedulingData: null,
  currentAlgo: 'fcfs',
};

// ============================================
// DOM HELPERS (Secure - no innerHTML)
// ============================================
function clearElement(el) {
  el.replaceChildren();
}

function createEl(tag, attrs, children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') el.className = val;
      else if (key === 'textContent') el.textContent = val;
      else if (key === 'style') Object.assign(el.style, val);
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
      else el.setAttribute(key, val);
    }
  }
  if (children) {
    if (typeof children === 'string') el.textContent = children;
    else if (Array.isArray(children)) children.forEach(c => { if (c) el.appendChild(c); });
    else el.appendChild(children);
  }
  return el;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, icon) {
  icon = icon || '✅';
  const container = document.getElementById('toastContainer');
  const toast = createEl('div', { className: 'toast' }, [
    createEl('span', { className: 'toast-icon', textContent: icon }),
    createEl('span', { className: 'toast-message', textContent: message }),
  ]);
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============================================
// ANIMATED COUNTER
// ============================================
function animateCounter(element, target, prefix, duration) {
  prefix = prefix || '';
  duration = duration || 1000;
  const start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    element.textContent = prefix + current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================
// API CALLS
// ============================================
async function fetchAPI(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    showToast('Failed to load data', '❌');
    return null;
  }
}

async function postAPI(endpoint, data) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    showToast('Failed to process request', '❌');
    return null;
  }
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Mobile menu
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function navigateTo(page) {
  AppState.currentPage = page;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeNav = document.querySelector('[data-page="' + page + '"]');
  if (activeNav) activeNav.classList.add('active');

  // Update pages
  document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
  const activePage = document.getElementById('page-' + page);
  if (activePage) activePage.classList.add('active');

  // Update header
  const titles = {
    dashboard: ['Dashboard', 'Welcome back, Admin'],
    movies: ['Movies', 'Manage your movie catalog'],
    shows: ['Shows', 'Schedule and manage shows'],
    bookings: ['Bookings', 'View and manage ticket bookings'],
    food: ['Food Orders', 'Kitchen order management'],
    complaints: ['Complaints', 'Customer complaint tracking'],
    auditoriums: ['Auditoriums', 'Hall management & operations'],
    customer: ['Simulate Customer', 'Simulate client bookings, ordering, and support tickets'],
    scheduling: ['Scheduling', 'OS Scheduling Algorithm Visualization'],
    reports: ['Reports', 'Analytics and performance reports'],
  };
  const t = titles[page] || ['Page', ''];
  document.getElementById('pageTitle').textContent = t[0];
  document.getElementById('pageSubtitle').textContent = t[1];

  // Load data for page
  loadPageData(page);

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// ============================================
// LOAD PAGE DATA
// ============================================
async function loadPageData(page) {
  switch (page) {
    case 'dashboard': await loadDashboard(); break;
    case 'movies': await loadMovies(); break;
    case 'shows': await loadShows(); break;
    case 'bookings': await loadBookings(); break;
    case 'food': await loadFoodOrders(); break;
    case 'complaints': await loadComplaints(); break;
    case 'auditoriums': await loadAuditoriums(); break;
    case 'customer': 
      await loadMovies();
      await loadShows();
      populateCustomerMovieSelects(); 
      break;
    case 'reports': loadReports(); break;
  }
  
  if (typeof updateSimulationQueues === 'function') {
    updateSimulationQueues();
  }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
  const data = await fetchAPI('/api/dashboard');
  if (!data) return;
  AppState.dashboardData = data;

  animateCounter(document.getElementById('statMovies'), data.totalMovies);
  animateCounter(document.getElementById('statBookings'), data.totalBookings);
  animateCounter(document.getElementById('statRevenue'), data.totalRevenue, 'Rs ');
  animateCounter(document.getElementById('statFood'), data.totalFoodOrders);
  animateCounter(document.getElementById('statComplaints'), data.openComplaints);
  animateCounter(document.getElementById('statShows'), data.activeShows);

  renderBarChart(data.dailySales);
  renderDonutChart(data.customerTypes);
  await loadRecentBookings();
}

function renderBarChart(dailySales) {
  const container = document.getElementById('barChart');
  clearElement(container);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...dailySales);

  dailySales.forEach((val, i) => {
    const heightPct = (val / max) * 100;
    const wrapper = createEl('div', { className: 'bar-wrapper' });
    const valLabel = createEl('div', { className: 'bar-value', textContent: (val / 1000).toFixed(1) + 'K' });
    const bar = createEl('div', { className: 'bar', style: { height: '0%' } });
    const label = createEl('div', { className: 'bar-label', textContent: days[i] });

    wrapper.appendChild(valLabel);
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    container.appendChild(wrapper);

    // Animate bar
    setTimeout(() => { bar.style.height = heightPct + '%'; }, 100 + i * 80);
  });
}

function renderDonutChart(customerTypes) {
  const container = document.getElementById('donutChart');
  clearElement(container);

  const total = customerTypes.VIP + customerTypes.Premium + customerTypes.Regular;
  const data = [
    { label: 'VIP', value: customerTypes.VIP, color: '#f59e0b' },
    { label: 'Premium', value: customerTypes.Premium, color: '#8b5cf6' },
    { label: 'Regular', value: customerTypes.Regular, color: '#64748b' },
  ];

  // Create SVG donut
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '180');
  svg.setAttribute('height', '180');
  svg.setAttribute('viewBox', '0 0 180 180');
  svg.classList.add('donut-svg');

  const cx = 90, cy = 90, r = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  data.forEach(item => {
    const pct = item.value / total;
    const dashLen = circumference * pct;
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', item.color);
    circle.setAttribute('stroke-width', '12');
    circle.setAttribute('stroke-dasharray', dashLen + ' ' + (circumference - dashLen));
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('stroke-linecap', 'round');
    circle.classList.add('donut-segment');
    svg.appendChild(circle);
    offset += dashLen;
  });

  // Center text (needs to be un-rotated since SVG is rotated)
  const gCenter = document.createElementNS(svgNS, 'g');
  gCenter.setAttribute('transform', 'rotate(90, 90, 90)');
  const centerText = document.createElementNS(svgNS, 'text');
  centerText.setAttribute('x', '90');
  centerText.setAttribute('y', '86');
  centerText.setAttribute('text-anchor', 'middle');
  centerText.classList.add('donut-center-text');
  centerText.textContent = total + '%';
  const subText = document.createElementNS(svgNS, 'text');
  subText.setAttribute('x', '90');
  subText.setAttribute('y', '104');
  subText.setAttribute('text-anchor', 'middle');
  subText.classList.add('donut-sub-text');
  subText.textContent = 'TOTAL';
  gCenter.appendChild(centerText);
  gCenter.appendChild(subText);
  svg.appendChild(gCenter);

  container.appendChild(svg);

  // Legend
  const legend = createEl('div', { className: 'donut-legend' });
  data.forEach(item => {
    const li = createEl('div', { className: 'legend-item' }, [
      createEl('div', { className: 'legend-dot', style: { background: item.color } }),
      createEl('span', { textContent: item.label + ' - ' + item.value + '%' }),
    ]);
    legend.appendChild(li);
  });
  container.appendChild(legend);
}

async function loadRecentBookings() {
  const bookings = await fetchAPI('/api/bookings');
  if (!bookings) return;
  AppState.bookings = bookings;

  const tbody = document.getElementById('recentBookingsBody');
  clearElement(tbody);

  bookings.forEach(b => {
    const typeClass = b.bookingType === 'VIP' ? 'badge-vip' : b.bookingType === 'Premium' ? 'badge-premium' : 'badge-regular';
    const tr = createEl('tr', {}, [
      createEl('td', { textContent: b.bookingId }),
      createEl('td', { textContent: b.userName }),
      createEl('td', { textContent: b.movieTitle }),
      createEl('td', { textContent: b.seatNumber }),
      createEl('td', {}, createEl('span', { className: 'badge ' + typeClass, textContent: b.bookingType })),
      createEl('td', { textContent: b.time }),
    ]);
    tbody.appendChild(tr);
  });
}

// ============================================
// MOVIES
// ============================================
async function loadMovies() {
  const movies = await fetchAPI('/api/movies');
  if (!movies) return;
  AppState.movies = movies;

  const grid = document.getElementById('moviesGrid');
  clearElement(grid);

  movies.forEach(m => {
    const statusClass = m.status === 'Now Showing' ? 'showing' : 'coming';
    const card = createEl('div', { className: 'movie-card' }, [
      createEl('div', { className: 'movie-poster' }, [
        createEl('span', { textContent: m.poster, style: { fontSize: '64px' } }),
        createEl('span', { className: 'movie-status-badge ' + statusClass, textContent: m.status }),
      ]),
      createEl('div', { className: 'movie-info' }, [
        createEl('h3', { textContent: m.title }),
        createEl('div', { className: 'movie-meta' }, [
          createEl('span', { className: 'movie-rating', textContent: '⭐ ' + m.rating }),
          createEl('span', { textContent: m.genre }),
          createEl('span', { textContent: m.duration + ' min' }),
        ]),
      ]),
    ]);
    grid.appendChild(card);
  });
}

// ============================================
// SHOWS
// ============================================
async function loadShows() {
  const shows = await fetchAPI('/api/shows');
  if (!shows) return;
  AppState.shows = shows;

  const tbody = document.getElementById('showsBody');
  clearElement(tbody);

  shows.forEach(s => {
    const pct = s.totalCapacity > 0 ? Math.round((s.bookedSeats / s.totalCapacity) * 100) : 0;
    const statusBadge = pct > 80 ? 'badge-danger' : pct > 50 ? 'badge-warning' : 'badge-success';
    const statusText = pct > 80 ? 'Almost Full' : pct > 50 ? 'Filling Up' : 'Available';

    const tr = createEl('tr', {}, [
      createEl('td', { textContent: s.showId }),
      createEl('td', { textContent: s.movieTitle }),
      createEl('td', { textContent: s.hallName }),
      createEl('td', { textContent: s.date }),
      createEl('td', { textContent: s.time }),
      createEl('td', { textContent: s.bookedSeats + '/' + s.totalCapacity + ' (' + pct + '%)' }),
      createEl('td', {}, createEl('span', { className: 'badge ' + statusBadge }, [
        createEl('span', { className: 'badge-dot' }),
        document.createTextNode(' ' + statusText),
      ])),
    ]);
    tbody.appendChild(tr);
  });
}

// ============================================
// BOOKINGS
// ============================================
async function loadBookings() {
  const bookings = await fetchAPI('/api/bookings');
  if (!bookings) return;
  AppState.bookings = bookings;

  const tbody = document.getElementById('bookingsBody');
  clearElement(tbody);

  bookings.forEach(b => {
    const typeClass = b.bookingType === 'VIP' ? 'badge-vip' : b.bookingType === 'Premium' ? 'badge-premium' : 'badge-regular';
    const tr = createEl('tr', {}, [
      createEl('td', { textContent: b.bookingId }),
      createEl('td', { textContent: b.userName }),
      createEl('td', { textContent: b.movieTitle }),
      createEl('td', { textContent: b.seatNumber }),
      createEl('td', {}, createEl('span', { className: 'badge ' + typeClass, textContent: b.bookingType })),
      createEl('td', { textContent: b.time }),
      createEl('td', { textContent: '#' + b.arrivalOrder }),
    ]);
    tbody.appendChild(tr);
  });
}

// ============================================
// FOOD ORDERS
// ============================================
async function loadFoodOrders() {
  const orders = await fetchAPI('/api/food-orders');
  if (!orders) return;
  AppState.foodOrders = orders;

  const tbody = document.getElementById('foodOrdersBody');
  clearElement(tbody);

  orders.forEach(f => {
    const statusClass = f.status === 'Completed' ? 'badge-success' : f.status === 'Processing' ? 'badge-warning' : 'badge-info';
    const priorityClass = f.priorityLabel === 'VIP' ? 'badge-vip' : f.priorityLabel === 'Premium' ? 'badge-premium' : 'badge-regular';

    const tr = createEl('tr', {}, [
      createEl('td', { textContent: f.orderId }),
      createEl('td', { textContent: f.userName }),
      createEl('td', { textContent: f.items }),
      createEl('td', { textContent: f.preparationTime + ' min' }),
      createEl('td', {}, createEl('span', { className: 'badge ' + priorityClass, textContent: f.priorityLabel })),
      createEl('td', {}, createEl('span', { className: 'badge ' + statusClass }, [
        createEl('span', { className: 'badge-dot' }),
        document.createTextNode(' ' + f.status),
      ])),
    ]);
    tbody.appendChild(tr);
  });
}

// ============================================
// COMPLAINTS
// ============================================
async function loadComplaints() {
  const complaints = await fetchAPI('/api/complaints');
  if (!complaints) return;
  AppState.complaints = complaints;

  const tbody = document.getElementById('complaintsBody');
  clearElement(tbody);

  complaints.forEach(c => {
    const statusClass = c.status === 'Resolved' ? 'badge-success' : c.status === 'In Progress' ? 'badge-warning' : 'badge-danger';
    const priorityText = c.priority === 1 ? 'Critical' : c.priority === 2 ? 'Medium' : 'Low';
    const priorityClass = c.priority === 1 ? 'badge-danger' : c.priority === 2 ? 'badge-warning' : 'badge-info';

    const tr = createEl('tr', {}, [
      createEl('td', { textContent: c.complaintId }),
      createEl('td', { textContent: c.userName }),
      createEl('td', { textContent: c.complaintType }),
      createEl('td', {}, createEl('span', { className: 'badge ' + priorityClass, textContent: priorityText })),
      createEl('td', {}, createEl('span', { className: 'badge ' + statusClass }, [
        createEl('span', { className: 'badge-dot' }),
        document.createTextNode(' ' + c.status),
      ])),
      createEl('td', { textContent: c.submittedAt }),
    ]);
    tbody.appendChild(tr);
  });
}

// ============================================
// AUDITORIUMS
// ============================================
async function loadAuditoriums() {
  const halls = await fetchAPI('/api/auditoriums');
  if (!halls) return;
  AppState.auditoriums = halls;

  const grid = document.getElementById('hallsGrid');
  clearElement(grid);

  halls.forEach(h => {
    const statusClass = h.status === 'Available' ? 'badge-success' : h.status === 'Screening' ? 'badge-info' : 'badge-warning';

    const card = createEl('div', { className: 'hall-card' }, [
      createEl('div', { className: 'hall-card-header' }, [
        createEl('div', { className: 'hall-name', textContent: h.hallName }),
        createEl('span', { className: 'badge ' + statusClass }, [
          createEl('span', { className: 'badge-dot' }),
          document.createTextNode(' ' + h.status),
        ]),
      ]),
      createEl('div', { className: 'hall-stats' }, [
        createEl('div', { className: 'hall-stat' }, [
          createEl('div', { className: 'hall-stat-value', textContent: String(h.capacity) }),
          createEl('div', { className: 'hall-stat-label', textContent: 'Capacity' }),
        ]),
        createEl('div', { className: 'hall-stat' }, [
          createEl('div', { className: 'hall-stat-value', textContent: h.cleaningTime + 'm' }),
          createEl('div', { className: 'hall-stat-label', textContent: 'Cleaning Time' }),
        ]),
      ]),
      createSeatGrid(h.capacity),
    ]);
    grid.appendChild(card);
  });
}

function createSeatGrid(capacity) {
  const grid = createEl('div', { className: 'seat-grid' });
  const seatCount = Math.min(capacity, 40); // Show max 40 seats for visual
  for (let i = 0; i < seatCount; i++) {
    const rand = Math.random();
    const type = rand < 0.15 ? 'vip' : rand < 0.55 ? 'booked' : 'available';
    const seat = createEl('div', { className: 'seat ' + type });
    grid.appendChild(seat);
  }
  return grid;
}

// ============================================
// SCHEDULING VISUALIZATION & ACTIONS
// ============================================
function initScheduling() {
  // Initialize processedBookingIds if not set
  if (!AppState.processedBookingIds) {
    AppState.processedBookingIds = new Set();
  }

  // Algorithm configuration dropdowns to toggle quantum input display
  const setupAlgoToggle = (selectId, quantumId) => {
    const select = document.getElementById(selectId);
    const quantum = document.getElementById(quantumId);
    if (select && quantum) {
      select.addEventListener('change', () => {
        quantum.style.display = select.value === 'rr' ? 'inline-block' : 'none';
      });
    }
  };

  setupAlgoToggle('bookingAlgoSelect', 'bookingQuantum');
  setupAlgoToggle('foodAlgoSelect', 'foodQuantum');
  setupAlgoToggle('complaintAlgoSelect', 'complaintQuantum');
  setupAlgoToggle('cleaningAlgoSelect', 'cleaningQuantum');

  // Algorithm tabs (on scheduling page)
  document.querySelectorAll('.algo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentAlgo = btn.getAttribute('data-algo');
      document.getElementById('currentAlgoTag').textContent = btn.textContent;
    });
  });

  // Run Demo button
  const demoBtn = document.getElementById('runDemoBtn');
  if (demoBtn) {
    demoBtn.addEventListener('click', runSchedulingDemo);
  }

  // 1. Run Bookings Scheduler Action
  const runBookingsBtn = document.getElementById('runBookingSchedulingBtn');
  if (runBookingsBtn) {
    runBookingsBtn.addEventListener('click', async () => {
      const pending = AppState.bookings.filter(b => !AppState.processedBookingIds.has(b.bookingId));
      if (pending.length === 0) {
        showToast('No pending bookings to schedule!', '⚠️');
        return;
      }

      const algo = document.getElementById('bookingAlgoSelect').value;
      const quantum = parseInt(document.getElementById('bookingQuantum').value, 10) || 3;

      const processes = pending.map(b => ({
        id: b.bookingId,
        name: b.userName,
        arrivalTime: b.arrivalOrder,
        burstTime: 3 + Math.floor(Math.random() * 4), // 3-6s random booking duration
        priority: b.bookingType === 'VIP' ? 1 : b.bookingType === 'Premium' ? 2 : 3
      }));

      let endpoint = '/api/scheduling/fcfs';
      let payload = { processes, updateState: true };

      if (algo === 'priority') {
        endpoint = '/api/scheduling/priority';
      } else if (algo === 'rr') {
        endpoint = '/api/scheduling/round-robin';
        payload.quantum = quantum;
      }

      showToast(`Running Booking Scheduler (${algo.toUpperCase()})...`, '⚡');
      const result = await postAPI(endpoint, payload);
      if (result) {
        pending.forEach(b => AppState.processedBookingIds.add(b.bookingId));
        showToast(`${result.algorithm} Booking Scheduling complete!`, '✅');
        await loadBookings();
        renderGanttChart(result);
        renderSchedulingResults(result);
        navigateTo('scheduling');
      }
    });
  }

  // 2. Run Food / Kitchen Scheduler Action
  const runFoodBtn = document.getElementById('runFoodSchedulingBtn');
  if (runFoodBtn) {
    runFoodBtn.addEventListener('click', async () => {
      const pending = AppState.foodOrders.filter(f => f.status === 'Pending' || f.status === 'Processing');
      if (pending.length === 0) {
        showToast('No pending food orders in kitchen!', '⚠️');
        return;
      }

      const algo = document.getElementById('foodAlgoSelect').value;
      const quantum = parseInt(document.getElementById('foodQuantum').value, 10) || 5;

      const processes = pending.map((f, i) => ({
        id: f.orderId,
        name: f.userName + ' - ' + f.items,
        arrivalTime: i * 2,
        burstTime: f.preparationTime,
        priority: f.priority
      }));

      let endpoint = '/api/scheduling/sjf';
      let payload = { processes, updateState: true, preemptive: false };

      if (algo === 'sjf-preemptive') {
        payload.preemptive = true;
      } else if (algo === 'priority') {
        endpoint = '/api/scheduling/priority';
      } else if (algo === 'priority-preemptive') {
        endpoint = '/api/scheduling/priority';
        payload.preemptive = true;
      } else if (algo === 'rr') {
        endpoint = '/api/scheduling/round-robin';
        payload.quantum = quantum;
      }

      showToast(`Running Kitchen Scheduler (${algo.toUpperCase()})...`, '⚡');
      const result = await postAPI(endpoint, payload);
      if (result) {
        showToast(`${result.algorithm} Kitchen Scheduling complete!`, '✅');
        await loadFoodOrders();
        renderGanttChart(result);
        renderSchedulingResults(result);
        navigateTo('scheduling');
      }
    });
  }

  // 3. Run Complaints / Support Scheduler Action
  const runComplaintBtn = document.getElementById('runComplaintSchedulingBtn');
  if (runComplaintBtn) {
    runComplaintBtn.addEventListener('click', async () => {
      const pending = AppState.complaints.filter(c => c.status === 'Open' || c.status === 'In Progress');
      if (pending.length === 0) {
        showToast('No pending customer complaints!', '⚠️');
        return;
      }

      const algo = document.getElementById('complaintAlgoSelect').value;
      const quantum = parseInt(document.getElementById('complaintQuantum').value, 10) || 10;

      const processes = pending.map((c, i) => ({
        id: c.complaintId,
        name: c.userName + ' - ' + c.complaintType,
        arrivalTime: i * 3,
        burstTime: 5 + Math.floor(Math.random() * 8), // 5-12s response duration
        priority: c.priority
      }));

      let endpoint = '/api/scheduling/priority';
      let payload = { processes, updateState: true };

      if (algo === 'fcfs') {
        endpoint = '/api/scheduling/fcfs';
      } else if (algo === 'rr') {
        endpoint = '/api/scheduling/round-robin';
        payload.quantum = quantum;
      }

      showToast(`Running Support Scheduler (${algo.toUpperCase()})...`, '⚡');
      const result = await postAPI(endpoint, payload);
      if (result) {
        showToast(`${result.algorithm} Support Scheduling complete!`, '✅');
        await loadComplaints();
        renderGanttChart(result);
        renderSchedulingResults(result);
        navigateTo('scheduling');
      }
    });
  }

  // 4. Run Cleaning / Auditorium Scheduler Action
  const runCleaningBtn = document.getElementById('runCleaningScheduleBtn');
  if (runCleaningBtn) {
    runCleaningBtn.addEventListener('click', async () => {
      if (AppState.auditoriums.length === 0) {
        showToast('No halls registered!', '⚠️');
        return;
      }

      const algo = document.getElementById('cleaningAlgoSelect').value;
      const quantum = parseInt(document.getElementById('cleaningQuantum').value, 10) || 10;

      // Mark status as Cleaning when scheduling is initialized
      AppState.auditoriums.forEach(h => { h.status = 'Cleaning'; });
      await loadAuditoriums();

      const processes = AppState.auditoriums.map((h, i) => ({
        id: h.hallId,
        name: h.hallName,
        arrivalTime: i * 2,
        burstTime: h.cleaningTime
      }));

      let endpoint = '/api/scheduling/sjf';
      let payload = { processes, updateState: true };

      if (algo === 'fcfs') {
        endpoint = '/api/scheduling/fcfs';
      } else if (algo === 'rr') {
        endpoint = '/api/scheduling/round-robin';
        payload.quantum = quantum;
      }

      showToast(`Running Cleaning Scheduler (${algo.toUpperCase()})...`, '⚡');
      const result = await postAPI(endpoint, payload);
      if (result) {
        showToast(`${result.algorithm} Cleaning scheduled successfully!`, '✅');
        await loadAuditoriums();
        renderGanttChart(result);
        renderSchedulingResults(result);
        navigateTo('scheduling');
      }
    });
  }
}

async function runSchedulingDemo() {
  showToast('Running scheduling demo...', '⚡');
  const data = await fetchAPI('/api/scheduling/demo');
  if (!data) return;
  AppState.schedulingData = data;

  const algoMap = {
    fcfs: data.ticketBooking,
    sjf: data.foodOrders,
    priority: data.complaints,
    rr: data.hallCleaning,
  };

  const result = algoMap[AppState.currentAlgo];
  if (result) {
    renderGanttChart(result);
    renderSchedulingResults(result);
    showToast(result.algorithm + ' visualization ready!', '✅');
  }
}

function renderGanttChart(result) {
  const container = document.getElementById('ganttContainer');
  clearElement(container);

  const processes = result.processes;
  if (!processes || processes.length === 0) return;

  const maxTime = result.totalTime || Math.max(...processes.map(p => p.completionTime));
  const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6'];

  if (result.timeline && result.timeline.length > 0) {
    // Multi-slot Gantt rendering (Round Robin or Preemptive)
    const uniqueProcIds = [...new Set(result.timeline.map(t => t.processId))];
    
    uniqueProcIds.forEach((pid, i) => {
      const p = processes.find(proc => proc.id === pid) || { id: pid, name: pid };
      const row = createEl('div', { className: 'gantt-row' });
      const label = createEl('div', { className: 'gantt-label', textContent: p.name || p.id });
      const track = createEl('div', { className: 'gantt-bar-track' });

      const slots = result.timeline.filter(t => t.processId === pid);
      slots.forEach(slot => {
        const leftPct = (slot.startTime / maxTime) * 100;
        const widthPct = ((slot.endTime - slot.startTime) / maxTime) * 100;
        
        const bar = createEl('div', {
          className: 'gantt-bar ' + colors[i % colors.length],
          style: { left: '0%', width: '0%' },
          textContent: slot.duration + 's'
        });
        track.appendChild(bar);
        
        setTimeout(() => {
          bar.style.left = leftPct + '%';
          bar.style.width = Math.max(widthPct, 2.5) + '%';
        }, 150 + i * 80);
      });

      row.appendChild(label);
      row.appendChild(track);
      container.appendChild(row);
    });
  } else {
    // Non-preemptive single-slot Gantt rendering
    processes.forEach((p, i) => {
      const row = createEl('div', { className: 'gantt-row' });
      const label = createEl('div', { className: 'gantt-label', textContent: p.name || p.id });
      const track = createEl('div', { className: 'gantt-bar-track' });

      const leftPct = (p.startTime / maxTime) * 100;
      const widthPct = ((p.completionTime - p.startTime) / maxTime) * 100;

      const bar = createEl('div', {
        className: 'gantt-bar ' + colors[i % colors.length],
        style: { left: '0%', width: '0%' },
        textContent: p.burstTime + 's',
      });

      track.appendChild(bar);
      row.appendChild(label);
      row.appendChild(track);
      container.appendChild(row);

      // Animate
      setTimeout(() => {
        bar.style.left = leftPct + '%';
        bar.style.width = Math.max(widthPct, 5) + '%';
      }, 150 + i * 80);
    });
  }

  // Time axis
  const axis = createEl('div', { className: 'gantt-time-axis' });
  const steps = Math.min(maxTime, 10);
  for (let i = 0; i <= steps; i++) {
    const timeVal = Math.round((i / steps) * maxTime);
    const label = createEl('span', {
      className: 'gantt-time-label',
      textContent: timeVal + 's',
      style: { flex: '1', textAlign: i === 0 ? 'left' : i === steps ? 'right' : 'center' },
    });
    axis.appendChild(label);
  }
  container.appendChild(axis);
}

function renderSchedulingResults(result) {
  const container = document.getElementById('schedulingResults');
  container.style.display = 'grid';
  clearElement(container);

  const metrics = [
    { label: 'Algorithm', value: result.algorithm },
    { label: 'Avg Waiting Time', value: result.averageWaitingTime + 's' },
    { label: 'Avg Turnaround', value: result.averageTurnaroundTime + 's' },
    { label: 'Total Time', value: result.totalTime + 's' },
    { label: 'Processes', value: String(result.processes.length) },
  ];

  if (result.quantum) {
    metrics.push({ label: 'Quantum', value: result.quantum + 's' });
  }

  metrics.forEach(m => {
    const card = createEl('div', { className: 'result-card' }, [
      createEl('div', { className: 'result-value', textContent: m.value }),
      createEl('div', { className: 'result-label', textContent: m.label }),
    ]);
    container.appendChild(card);
  });
}

// ============================================
// REPORTS
// ============================================
function loadReports() {
  // Monthly sales bar chart
  const reportChart = document.getElementById('reportBarChart');
  if (reportChart && reportChart.children.length === 0) {
    const monthlyData = [42000, 58000, 51000, 63000, 55000, 71000, 68000];
    const days = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const max = Math.max(...monthlyData);

    clearElement(reportChart);
    monthlyData.forEach((val, i) => {
      const heightPct = (val / max) * 100;
      const wrapper = createEl('div', { className: 'bar-wrapper' });
      wrapper.appendChild(createEl('div', { className: 'bar-value', textContent: (val / 1000).toFixed(0) + 'K' }));
      const bar = createEl('div', { className: 'bar', style: { height: '0%' } });
      wrapper.appendChild(bar);
      wrapper.appendChild(createEl('div', { className: 'bar-label', textContent: days[i] }));
      reportChart.appendChild(wrapper);
      setTimeout(() => { bar.style.height = heightPct + '%'; }, 100 + i * 80);
    });
  }

  // Genre donut
  const genreChart = document.getElementById('genreDonut');
  if (genreChart && genreChart.children.length === 0) {
    const genres = [
      { label: 'Action', value: 35, color: '#f43f5e' },
      { label: 'Sci-Fi', value: 28, color: '#6366f1' },
      { label: 'Drama', value: 18, color: '#f59e0b' },
      { label: 'Thriller', value: 12, color: '#10b981' },
      { label: 'Comedy', value: 7, color: '#0ea5e9' },
    ];
    const total = genres.reduce((s, g) => s + g.value, 0);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '180');
    svg.setAttribute('height', '180');
    svg.setAttribute('viewBox', '0 0 180 180');
    svg.classList.add('donut-svg');

    const cx = 90, cy = 90, r = 70;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    genres.forEach(item => {
      const pct = item.value / total;
      const dashLen = circumference * pct;
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', item.color);
      circle.setAttribute('stroke-width', '12');
      circle.setAttribute('stroke-dasharray', dashLen + ' ' + (circumference - dashLen));
      circle.setAttribute('stroke-dashoffset', -offset);
      circle.setAttribute('stroke-linecap', 'round');
      circle.classList.add('donut-segment');
      svg.appendChild(circle);
      offset += dashLen;
    });

    const gCenter = document.createElementNS(svgNS, 'g');
    gCenter.setAttribute('transform', 'rotate(90, 90, 90)');
    const centerText = document.createElementNS(svgNS, 'text');
    centerText.setAttribute('x', '90');
    centerText.setAttribute('y', '86');
    centerText.setAttribute('text-anchor', 'middle');
    centerText.classList.add('donut-center-text');
    centerText.textContent = '5';
    const subText = document.createElementNS(svgNS, 'text');
    subText.setAttribute('x', '90');
    subText.setAttribute('y', '104');
    subText.setAttribute('text-anchor', 'middle');
    subText.classList.add('donut-sub-text');
    subText.textContent = 'GENRES';
    gCenter.appendChild(centerText);
    gCenter.appendChild(subText);
    svg.appendChild(gCenter);
    genreChart.appendChild(svg);

    const legend = createEl('div', { className: 'donut-legend' });
    genres.forEach(item => {
      legend.appendChild(createEl('div', { className: 'legend-item' }, [
        createEl('div', { className: 'legend-dot', style: { background: item.color } }),
        createEl('span', { textContent: item.label + ' - ' + item.value + '%' }),
      ]));
    });
    genreChart.appendChild(legend);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
  // Refresh bookings
  const refreshBtn = document.getElementById('refreshBookingsBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadRecentBookings();
      showToast('Bookings refreshed', '🔄');
    });
  }

  // Notification button
  const notifBtn = document.getElementById('notificationBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      showToast('No new notifications', '🔔');
    });
  }

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        showToast('Searching for: ' + searchInput.value, '🔍');
      }
    });
  }
}

// ============================================
// CLIENT SIMULATION PORTAL
// ============================================
function initCustomerPortal() {
  if (!AppState.processedBookingIds) {
    AppState.processedBookingIds = new Set();
  }

  // Smartphone app tab switching
  const tabs = document.querySelectorAll('.phone-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-tab');
      document.querySelectorAll('.phone-screen-content').forEach(c => c.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Seat Grid selection
  const seatGrid = document.getElementById('phoneSeatGrid');
  if (seatGrid) {
    seatGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('seat-dot') && e.target.classList.contains('available')) {
        document.querySelectorAll('#phoneSeatGrid .seat-dot.selected').forEach(s => s.classList.remove('selected'));
        e.target.classList.add('selected');
        document.getElementById('phoneSelectedSeat').value = e.target.getAttribute('data-seat-id');
      }
    });
  }

  // Populate phone movie select
  const movieSelect = document.getElementById('phoneMovieSelect');
  if (movieSelect) {
    movieSelect.addEventListener('change', () => {
      const movieId = movieSelect.value;
      const showSelect = document.getElementById('phoneShowSelect');
      clearElement(showSelect);
      showSelect.appendChild(createEl('option', { value: '', textContent: '-- Select Show Timing --' }));

      if (!movieId) {
        showSelect.disabled = true;
        clearElement(seatGrid);
        return;
      }

      const movieShows = AppState.shows.filter(s => s.movieId === movieId);
      if (movieShows.length === 0) {
        showSelect.appendChild(createEl('option', { value: '', textContent: 'No shows scheduled' }));
        showSelect.disabled = true;
        clearElement(seatGrid);
        return;
      }

      movieShows.forEach(s => {
        showSelect.appendChild(createEl('option', { 
          value: s.showId, 
          textContent: `${s.time} (${s.hallName})` 
        }));
      });
      showSelect.disabled = false;
    });
  }

  // Show select maps seating grid
  const showSelect = document.getElementById('phoneShowSelect');
  if (showSelect) {
    showSelect.addEventListener('change', () => {
      const showId = showSelect.value;
      clearElement(seatGrid);
      document.getElementById('phoneSelectedSeat').value = '';

      if (!showId) return;

      const show = AppState.shows.find(s => s.showId === showId);
      const capacity = show ? show.totalCapacity : 40;
      const seatCount = Math.min(capacity, 36); // standard 6x6 phone grid

      const alphabets = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (let i = 0; i < seatCount; i++) {
        const rowIdx = Math.floor(i / 6);
        const colIdx = (i % 6) + 1;
        const seatId = alphabets[rowIdx] + colIdx;

        const isBooked = Math.random() < 0.35; // simulate some taken seats
        const seatDot = createEl('span', {
          className: 'seat-dot ' + (isBooked ? 'booked' : 'available'),
          textContent: seatId,
          style: { fontSize: '8px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        });
        seatDot.setAttribute('data-seat-id', seatId);
        seatGrid.appendChild(seatDot);
      }
    });
  }

  // Booking Form Submission
  const bookingForm = document.getElementById('phoneBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userName = document.getElementById('phoneCustName').value.trim();
      const showId = document.getElementById('phoneShowSelect').value;
      const seatNumber = document.getElementById('phoneSelectedSeat').value;
      const bookingType = document.getElementById('phoneBookingType').value;

      if (!userName || !showId || !seatNumber || !bookingType) {
        showToast('Please enter your name and select a seat', '❌');
        return;
      }

      const result = await postAPI('/api/bookings', { userName, showId, seatNumber, bookingType });
      if (result) {
        showToast('Booking added to queue!', '🎫');
        bookingForm.reset();
        document.getElementById('phoneShowSelect').disabled = true;
        clearElement(seatGrid);
        await loadBookings();
        updateSimulationQueues();
      }
    });
  }

  // Food Form Submission
  const foodForm = document.getElementById('phoneFoodForm');
  if (foodForm) {
    foodForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userName = document.getElementById('phoneFoodCustName').value.trim();
      const checkboxes = document.querySelectorAll('input[name="foodItem"]:checked');
      const priorityLabel = document.getElementById('phoneFoodPriority').value;

      if (!userName || checkboxes.length === 0) {
        showToast('Please enter your name and choose snacks', '❌');
        return;
      }

      const items = Array.from(checkboxes).map(cb => cb.value).join(', ');
      const prepMap = { Popcorn: 3, 'Cold Drink': 1, Burger: 8, 'Pizza Slice': 12, Nachos: 5, 'Hot Dog': 6 };
      let prepTime = 0;
      checkboxes.forEach(cb => {
        prepTime += prepMap[cb.value] || 4;
      });

      const result = await postAPI('/api/food-orders', { userName, items, preparationTime: prepTime, priorityLabel });
      if (result) {
        showToast('Snack order added to kitchen queue!', '🍿');
        foodForm.reset();
        await loadFoodOrders();
        updateSimulationQueues();
      }
    });
  }

  // Support Ticket Submission
  const complaintForm = document.getElementById('phoneComplaintForm');
  if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userName = document.getElementById('phoneCompCustName').value.trim();
      const complaintType = document.getElementById('phoneCompType').value;
      const priorityText = document.getElementById('phoneCompPriority').value;

      if (!userName || !complaintType || !priorityText) {
        showToast('Please enter name and details', '❌');
        return;
      }

      const result = await postAPI('/api/complaints', { userName, complaintType, priorityText });
      if (result) {
        showToast('Support case escalated to queue!', '📋');
        complaintForm.reset();
        await loadComplaints();
        updateSimulationQueues();
      }
    });
  }
}

function populateCustomerMovieSelects() {
  const movieSelect = document.getElementById('phoneMovieSelect');
  if (movieSelect) {
    clearElement(movieSelect);
    movieSelect.appendChild(createEl('option', { value: '', textContent: '-- Choose Movie --' }));
    AppState.movies.forEach(m => {
      if (m.status === 'Now Showing') {
        movieSelect.appendChild(createEl('option', { value: m.movieId, textContent: m.title }));
      }
    });
  }
}

function updateSimulationQueues() {
  if (!AppState.processedBookingIds) {
    AppState.processedBookingIds = new Set();
  }

  // 1. Pending Bookings List
  const pendingBookings = AppState.bookings.filter(b => !AppState.processedBookingIds.has(b.bookingId));
  const bookingsList = document.getElementById('sim-bookings-list');
  const bookingsCount = document.getElementById('sim-booking-count');
  if (bookingsCount) bookingsCount.textContent = pendingBookings.length;
  if (bookingsList) {
    clearElement(bookingsList);
    if (pendingBookings.length === 0) {
      bookingsList.appendChild(createEl('div', { className: 'empty-queue-text', textContent: 'No pending bookings' }));
    } else {
      pendingBookings.forEach(b => {
        const typeClass = b.bookingType === 'VIP' ? 'badge-vip' : b.bookingType === 'Premium' ? 'badge-premium' : 'badge-regular';
        const card = createEl('div', { className: 'queue-item-card' }, [
          createEl('div', {}, [
            createEl('div', { className: 'queue-item-name', textContent: b.userName }),
            createEl('div', { className: 'queue-item-meta', textContent: `${b.movieTitle} - Seat ${b.seatNumber}` })
          ]),
          createEl('span', { className: 'queue-badge ' + typeClass, textContent: b.bookingType })
        ]);
        bookingsList.appendChild(card);
      });
    }
  }

  // 2. Pending Food orders
  const pendingFood = AppState.foodOrders.filter(f => f.status === 'Pending' || f.status === 'Processing');
  const foodList = document.getElementById('sim-food-list');
  const foodCount = document.getElementById('sim-food-count');
  if (foodCount) foodCount.textContent = pendingFood.length;
  if (foodList) {
    clearElement(foodList);
    if (pendingFood.length === 0) {
      foodList.appendChild(createEl('div', { className: 'empty-queue-text', textContent: 'No pending orders' }));
    } else {
      pendingFood.forEach(f => {
        const typeClass = f.priorityLabel === 'VIP' ? 'badge-vip' : f.priorityLabel === 'Premium' ? 'badge-premium' : 'badge-regular';
        const card = createEl('div', { className: 'queue-item-card' }, [
          createEl('div', {}, [
            createEl('div', { className: 'queue-item-name', textContent: f.userName }),
            createEl('div', { className: 'queue-item-meta', textContent: `${f.items} (Prep: ${f.preparationTime}m)` })
          ]),
          createEl('span', { className: 'queue-badge ' + typeClass, textContent: f.priorityLabel })
        ]);
        foodList.appendChild(card);
      });
    }
  }

  // 3. Pending complaints
  const pendingComplaints = AppState.complaints.filter(c => c.status === 'Open' || c.status === 'In Progress');
  const complaintsList = document.getElementById('sim-complaints-list');
  const complaintsCount = document.getElementById('sim-complaint-count');
  if (complaintsCount) complaintsCount.textContent = pendingComplaints.length;
  if (complaintsList) {
    clearElement(complaintsList);
    if (pendingComplaints.length === 0) {
      complaintsList.appendChild(createEl('div', { className: 'empty-queue-text', textContent: 'No pending issues' }));
    } else {
      pendingComplaints.forEach(c => {
        const priorityText = c.priority === 1 ? 'Critical' : c.priority === 2 ? 'Medium' : 'Low';
        const typeClass = c.priority === 1 ? 'badge-danger' : c.priority === 2 ? 'badge-warning' : 'badge-regular';
        const card = createEl('div', { className: 'queue-item-card' }, [
          createEl('div', {}, [
            createEl('div', { className: 'queue-item-name', textContent: c.userName }),
            createEl('div', { className: 'queue-item-meta', textContent: c.complaintType })
          ]),
          createEl('span', { className: 'queue-badge ' + typeClass, textContent: priorityText })
        ]);
        complaintsList.appendChild(card);
      });
    }
  }

  // Sidebar badges updates
  const badgeFood = document.getElementById('badge-food');
  const badgeComplaints = document.getElementById('badge-complaints');
  const navBookings = document.querySelector('[data-page="bookings"]');
  const badgeBookings = navBookings ? navBookings.querySelector('.nav-badge') : null;

  if (badgeFood) badgeFood.textContent = pendingFood.length;
  if (badgeComplaints) badgeComplaints.textContent = pendingComplaints.length;
  if (badgeBookings) badgeBookings.textContent = pendingBookings.length;
}

// ============================================
// ADMIN ADD MODALS
// ============================================
function initAdminModals() {
  const movieModal = document.getElementById('addMovieModal');
  const showModal = document.getElementById('addShowModal');

  // Add Movie Modal triggers
  const addMovieBtn = document.getElementById('addMovieBtn');
  if (addMovieBtn) {
    addMovieBtn.addEventListener('click', () => {
      movieModal.classList.add('active');
    });
  }

  const closeMovieModalBtn = document.getElementById('closeMovieModalBtn');
  const cancelMovieBtn = document.getElementById('cancelMovieBtn');
  const closeMovie = () => movieModal.classList.remove('active');
  if (closeMovieModalBtn) closeMovieModalBtn.addEventListener('click', closeMovie);
  if (cancelMovieBtn) cancelMovieBtn.addEventListener('click', closeMovie);

  // Submit Movie Form
  const movieForm = document.getElementById('addMovieForm');
  if (movieForm) {
    movieForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('movieTitleInput').value.trim();
      const duration = document.getElementById('movieDurationInput').value;
      const genre = document.getElementById('movieGenreInput').value.trim();
      const rating = document.getElementById('movieRatingInput').value;
      const poster = document.getElementById('moviePosterInput').value.trim();
      const status = document.getElementById('movieStatusInput').value;

      const result = await postAPI('/api/movies', { title, duration, genre, rating, poster, status });
      if (result) {
        showToast('Movie added successfully!', '🎬');
        closeMovie();
        movieForm.reset();
        await loadMovies();
      }
    });
  }

  // Add Show Modal triggers
  const addShowBtn = document.getElementById('addShowBtn');
  if (addShowBtn) {
    addShowBtn.addEventListener('click', () => {
      const movieSelect = document.getElementById('showMovieSelect');
      const hallSelect = document.getElementById('showHallSelect');

      clearElement(movieSelect);
      movieSelect.appendChild(createEl('option', { value: '', textContent: '-- Choose Movie --' }));
      AppState.movies.forEach(m => {
        movieSelect.appendChild(createEl('option', { value: m.movieId, textContent: m.title }));
      });

      clearElement(hallSelect);
      hallSelect.appendChild(createEl('option', { value: '', textContent: '-- Choose Auditorium --' }));
      AppState.auditoriums.forEach(h => {
        hallSelect.appendChild(createEl('option', { value: h.hallId, textContent: h.hallName }));
      });

      showModal.classList.add('active');
    });
  }

  const closeShowModalBtn = document.getElementById('closeShowModalBtn');
  const cancelShowBtn = document.getElementById('cancelShowBtn');
  const closeShow = () => showModal.classList.remove('active');
  if (closeShowModalBtn) closeShowModalBtn.addEventListener('click', closeShow);
  if (cancelShowBtn) cancelShowBtn.addEventListener('click', closeShow);

  // Submit Show Form
  const showForm = document.getElementById('addShowForm');
  if (showForm) {
    showForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const movieId = document.getElementById('showMovieSelect').value;
      const hallId = document.getElementById('showHallSelect').value;
      const date = document.getElementById('showDateInput').value;
      const time = document.getElementById('showTimeInput').value.trim();

      const result = await postAPI('/api/shows', { movieId, hallId, date, time });
      if (result) {
        showToast('Show scheduled successfully!', '🎭');
        closeShow();
        showForm.reset();
        await loadShows();
      }
    });
  }

  // Close modals on window background click
  window.addEventListener('click', (e) => {
    if (e.target === movieModal) closeMovie();
    if (e.target === showModal) closeShow();
  });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Hide loading overlay
  setTimeout(() => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
  }, 800);

  initNavigation();
  initEventListeners();
  initScheduling();
  initAdminModals();
  initCustomerPortal();
  
  loadDashboard().then(() => {
    populateCustomerMovieSelects();
    updateSimulationQueues();
  });
});
