const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Scheduling Algorithms
const FCFS = require('./scheduling/FCFS');
const SJF = require('./scheduling/SJF');
const PriorityScheduling = require('./scheduling/Priority');
const RoundRobin = require('./scheduling/RoundRobin');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security Middleware ---
// Generate nonce for CSP
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  xFrameOptions: { action: 'deny' },
}));

const allowedOrigins = ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ============================================
// MOCK DATA (In production, use MongoDB)
// ============================================
const mockMovies = [
  { movieId: 'M001', title: 'Interstellar', duration: 169, genre: 'Sci-Fi', rating: 8.7, poster: '🚀', status: 'Now Showing' },
  { movieId: 'M002', title: 'The Dark Knight', duration: 152, genre: 'Action', rating: 9.0, poster: '🦇', status: 'Now Showing' },
  { movieId: 'M003', title: 'Inception', duration: 148, genre: 'Sci-Fi', rating: 8.8, poster: '🌀', status: 'Now Showing' },
  { movieId: 'M004', title: 'Avengers: Endgame', duration: 181, genre: 'Action', rating: 8.4, poster: '🛡️', status: 'Coming Soon' },
  { movieId: 'M005', title: 'Joker', duration: 122, genre: 'Drama', rating: 8.4, poster: '🃏', status: 'Now Showing' },
  { movieId: 'M006', title: 'Parasite', duration: 132, genre: 'Thriller', rating: 8.5, poster: '🏠', status: 'Now Showing' },
  { movieId: 'M007', title: 'Spider-Man: No Way Home', duration: 148, genre: 'Action', rating: 8.3, poster: '🕷️', status: 'Coming Soon' },
  { movieId: 'M008', title: 'Dune: Part Two', duration: 166, genre: 'Sci-Fi', rating: 8.6, poster: '🏜️', status: 'Now Showing' },
];

const mockShows = [
  { showId: 'S001', movieId: 'M001', hallId: 'H001', date: '2026-06-04', time: '10:00 AM', bookedSeats: 45 },
  { showId: 'S002', movieId: 'M002', hallId: 'H002', date: '2026-06-04', time: '01:00 PM', bookedSeats: 78 },
  { showId: 'S003', movieId: 'M003', hallId: 'H001', date: '2026-06-04', time: '04:00 PM', bookedSeats: 62 },
  { showId: 'S004', movieId: 'M005', hallId: 'H003', date: '2026-06-04', time: '07:00 PM', bookedSeats: 33 },
  { showId: 'S005', movieId: 'M006', hallId: 'H002', date: '2026-06-05', time: '10:00 AM', bookedSeats: 51 },
  { showId: 'S006', movieId: 'M008', hallId: 'H001', date: '2026-06-05', time: '01:00 PM', bookedSeats: 90 },
];

const mockBookings = [
  { bookingId: 'B001', userId: 'U001', userName: 'Ali Khan', showId: 'S001', movieTitle: 'Interstellar', seatNumber: 'A5', bookingType: 'VIP', time: '09:55 AM', arrivalOrder: 1 },
  { bookingId: 'B002', userId: 'U002', userName: 'Sara Ahmed', showId: 'S001', movieTitle: 'Interstellar', seatNumber: 'B3', bookingType: 'Regular', time: '09:57 AM', arrivalOrder: 2 },
  { bookingId: 'B003', userId: 'U003', userName: 'Hassan Malik', showId: 'S002', movieTitle: 'The Dark Knight', seatNumber: 'C7', bookingType: 'Premium', time: '12:50 PM', arrivalOrder: 3 },
  { bookingId: 'B004', userId: 'U004', userName: 'Fatima Noor', showId: 'S002', movieTitle: 'The Dark Knight', seatNumber: 'D1', bookingType: 'VIP', time: '12:52 PM', arrivalOrder: 4 },
  { bookingId: 'B005', userId: 'U005', userName: 'Usman Shah', showId: 'S003', movieTitle: 'Inception', seatNumber: 'A9', bookingType: 'Regular', time: '03:45 PM', arrivalOrder: 5 },
  { bookingId: 'B006', userId: 'U006', userName: 'Ayesha Tariq', showId: 'S003', movieTitle: 'Inception', seatNumber: 'B8', bookingType: 'VIP', time: '03:48 PM', arrivalOrder: 6 },
];

const mockFoodOrders = [
  { orderId: 'F001', userId: 'U001', userName: 'Ali Khan', items: 'Large Popcorn', preparationTime: 3, priority: 1, status: 'Completed', priorityLabel: 'VIP' },
  { orderId: 'F002', userId: 'U002', userName: 'Sara Ahmed', items: 'Cold Drink', preparationTime: 1, priority: 3, status: 'Processing', priorityLabel: 'Regular' },
  { orderId: 'F003', userId: 'U003', userName: 'Hassan Malik', items: 'Cheese Burger', preparationTime: 8, priority: 2, status: 'Pending', priorityLabel: 'Premium' },
  { orderId: 'F004', userId: 'U004', userName: 'Fatima Noor', items: 'Nachos + Dip', preparationTime: 5, priority: 1, status: 'Processing', priorityLabel: 'VIP' },
  { orderId: 'F005', userId: 'U005', userName: 'Usman Shah', items: 'Pizza Slice', preparationTime: 12, priority: 3, status: 'Pending', priorityLabel: 'Regular' },
  { orderId: 'F006', userId: 'U006', userName: 'Ayesha Tariq', items: 'Hot Dog + Drink', preparationTime: 6, priority: 2, status: 'Pending', priorityLabel: 'Premium' },
];

const mockComplaints = [
  { complaintId: 'C001', userId: 'U002', userName: 'Sara Ahmed', complaintType: 'Payment Failure', priority: 1, status: 'Open', submittedAt: '10:05 AM' },
  { complaintId: 'C002', userId: 'U005', userName: 'Usman Shah', complaintType: 'Seat Issue', priority: 3, status: 'Open', submittedAt: '10:15 AM' },
  { complaintId: 'C003', userId: 'U003', userName: 'Hassan Malik', complaintType: 'Refund Request', priority: 1, status: 'In Progress', submittedAt: '10:20 AM' },
  { complaintId: 'C004', userId: 'U001', userName: 'Ali Khan', complaintType: 'App Bug', priority: 2, status: 'Open', submittedAt: '10:30 AM' },
  { complaintId: 'C005', userId: 'U006', userName: 'Ayesha Tariq', complaintType: 'Ticket Cancellation', priority: 1, status: 'Open', submittedAt: '10:45 AM' },
];

const mockAuditoriums = [
  { hallId: 'H001', hallName: 'Hall A - IMAX', capacity: 120, cleaningTime: 15, status: 'Available' },
  { hallId: 'H002', hallName: 'Hall B - Dolby', capacity: 100, cleaningTime: 30, status: 'Screening' },
  { hallId: 'H003', hallName: 'Hall C - Standard', capacity: 80, cleaningTime: 20, status: 'Cleaning' },
  { hallId: 'H004', hallName: 'Hall D - Premium', capacity: 60, cleaningTime: 45, status: 'Available' },
];

// ============================================
// API ROUTES
// ============================================

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
  res.json({
    totalMovies: mockMovies.length,
    totalBookings: mockBookings.length,
    totalRevenue: 285600,
    activeShows: mockShows.length,
    totalFoodOrders: mockFoodOrders.length,
    openComplaints: mockComplaints.filter(c => c.status === 'Open').length,
    dailySales: [12500, 18200, 15800, 22400, 19600, 28500, 24300],
    weeklyRevenue: [95000, 112000, 98500, 125000],
    movieSales: mockMovies.slice(0, 5).map(m => ({ title: m.title, sales: Math.floor(Math.random() * 100) + 20 })),
    customerTypes: { VIP: 35, Premium: 28, Regular: 37 },
  });
});

// Helper to get formatted current time
function getCurrentTimeFormatted() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Movies
app.get('/api/movies', (req, res) => res.json(mockMovies));
app.post('/api/movies', (req, res) => {
  const { title, duration, genre, rating, poster, status } = req.body;
  if (!title || !duration || !genre || !rating) {
    return res.status(400).json({ error: 'Missing required movie fields' });
  }
  const nextId = 'M' + String(mockMovies.length + 1).padStart(3, '0');
  const newMovie = {
    movieId: nextId,
    title: String(title).slice(0, 100),
    duration: parseInt(duration, 10) || 120,
    genre: String(genre).slice(0, 50),
    rating: parseFloat(rating) || 7.0,
    poster: String(poster || '🎬').slice(0, 10),
    status: status === 'Coming Soon' ? 'Coming Soon' : 'Now Showing',
  };
  mockMovies.push(newMovie);
  res.status(201).json(newMovie);
});

// Shows
app.get('/api/shows', (req, res) => {
  const enriched = mockShows.map(s => {
    const movie = mockMovies.find(m => m.movieId === s.movieId);
    const hall = mockAuditoriums.find(h => h.hallId === s.hallId);
    return { ...s, movieTitle: movie ? movie.title : 'Unknown', hallName: hall ? hall.hallName : 'Unknown', totalCapacity: hall ? hall.capacity : 0 };
  });
  res.json(enriched);
});
app.post('/api/shows', (req, res) => {
  const { movieId, hallId, date, time } = req.body;
  if (!movieId || !hallId || !date || !time) {
    return res.status(400).json({ error: 'Missing required show fields' });
  }
  const nextId = 'S' + String(mockShows.length + 1).padStart(3, '0');
  const newShow = {
    showId: nextId,
    movieId: String(movieId),
    hallId: String(hallId),
    date: String(date),
    time: String(time),
    bookedSeats: 0,
  };
  mockShows.push(newShow);
  res.status(201).json(newShow);
});

// Bookings
app.get('/api/bookings', (req, res) => res.json(mockBookings));
app.post('/api/bookings', (req, res) => {
  const { userName, showId, seatNumber, bookingType } = req.body;
  if (!userName || !showId || !seatNumber || !bookingType) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const show = mockShows.find(s => s.showId === showId);
  if (!show) {
    return res.status(404).json({ error: 'Show not found' });
  }

  // Update show booked seats count
  show.bookedSeats = (show.bookedSeats || 0) + 1;

  const movie = mockMovies.find(m => m.movieId === show.movieId);
  const movieTitle = movie ? movie.title : 'Unknown Movie';

  const nextId = 'B' + String(mockBookings.length + 1).padStart(3, '0');
  const nextArrivalOrder = mockBookings.length + 1;

  const newBooking = {
    bookingId: nextId,
    userId: 'U' + String(mockBookings.length + 1).padStart(3, '0'),
    userName: String(userName).slice(0, 100),
    showId: String(showId),
    movieTitle: movieTitle,
    seatNumber: String(seatNumber).slice(0, 10),
    bookingType: bookingType === 'VIP' ? 'VIP' : bookingType === 'Premium' ? 'Premium' : 'Regular',
    time: getCurrentTimeFormatted(),
    arrivalOrder: nextArrivalOrder,
  };
  mockBookings.push(newBooking);
  res.status(201).json(newBooking);
});

// Food Orders
app.get('/api/food-orders', (req, res) => res.json(mockFoodOrders));
app.post('/api/food-orders', (req, res) => {
  const { userName, items, preparationTime, priorityLabel } = req.body;
  if (!userName || !items || !preparationTime || !priorityLabel) {
    return res.status(400).json({ error: 'Missing required food order fields' });
  }
  const nextId = 'F' + String(mockFoodOrders.length + 1).padStart(3, '0');
  const priorityMap = { VIP: 1, Premium: 2, Regular: 3 };
  const newOrder = {
    orderId: nextId,
    userId: 'U' + String(mockFoodOrders.length + 1).padStart(3, '0'),
    userName: String(userName).slice(0, 100),
    items: String(items).slice(0, 200),
    preparationTime: parseInt(preparationTime, 10) || 5,
    priority: priorityMap[priorityLabel] || 3,
    status: 'Pending',
    priorityLabel: priorityLabel === 'VIP' ? 'VIP' : priorityLabel === 'Premium' ? 'Premium' : 'Regular',
  };
  mockFoodOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// Complaints
app.get('/api/complaints', (req, res) => res.json(mockComplaints));
app.post('/api/complaints', (req, res) => {
  const { userName, complaintType, priorityText } = req.body;
  if (!userName || !complaintType || !priorityText) {
    return res.status(400).json({ error: 'Missing required complaint fields' });
  }
  const nextId = 'C' + String(mockComplaints.length + 1).padStart(3, '0');
  const priorityMap = { Critical: 1, Medium: 2, Low: 3 };
  const newComplaint = {
    complaintId: nextId,
    userId: 'U' + String(mockComplaints.length + 1).padStart(3, '0'),
    userName: String(userName).slice(0, 100),
    complaintType: String(complaintType).slice(0, 100),
    priority: priorityMap[priorityText] || 3,
    status: 'Open',
    submittedAt: getCurrentTimeFormatted(),
  };
  mockComplaints.push(newComplaint);
  res.status(201).json(newComplaint);
});

// Auditoriums
app.get('/api/auditoriums', (req, res) => res.json(mockAuditoriums));
app.post('/api/auditoriums', (req, res) => {
  const { hallName, capacity, cleaningTime } = req.body;
  if (!hallName || !capacity || !cleaningTime) {
    return res.status(400).json({ error: 'Missing required auditorium fields' });
  }
  const nextId = 'H' + String(mockAuditoriums.length + 1).padStart(3, '0');
  const newAuditorium = {
    hallId: nextId,
    hallName: String(hallName).slice(0, 100),
    capacity: parseInt(capacity, 10) || 100,
    cleaningTime: parseInt(cleaningTime, 10) || 30,
    status: 'Available',
  };
  mockAuditoriums.push(newAuditorium);
  res.status(201).json(newAuditorium);
});


// ============================================
// SCHEDULING ALGORITHM API ROUTES
// ============================================

// FCFS - Ticket Booking / Complaints
app.post('/api/scheduling/fcfs', (req, res) => {
  try {
    const fcfs = new FCFS();
    const processes = req.body.processes;
    if (!Array.isArray(processes)) {
      return res.status(400).json({ error: 'Processes must be an array' });
    }
    processes.forEach(p => fcfs.addProcess(p));
    const result = fcfs.execute();

    if (req.body.updateState) {
      processes.forEach(p => {
        if (p.id.startsWith('C')) {
          const complaint = mockComplaints.find(c => c.complaintId === p.id);
          if (complaint) complaint.status = 'Resolved';
        } else if (p.id.startsWith('F')) {
          const order = mockFoodOrders.find(f => f.orderId === p.id);
          if (order) order.status = 'Completed';
        } else if (p.id.startsWith('H')) {
          const hall = mockAuditoriums.find(h => h.hallId === p.id);
          if (hall) hall.status = 'Available';
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Scheduling execution failed' });
  }
});

// SJF - Food Orders / Hall Cleaning
app.post('/api/scheduling/sjf', (req, res) => {
  try {
    const sjf = new SJF();
    const processes = req.body.processes;
    const preemptive = req.body.preemptive || false;
    if (!Array.isArray(processes)) {
      return res.status(400).json({ error: 'Processes must be an array' });
    }
    processes.forEach(p => sjf.addProcess(p));
    const result = sjf.execute(preemptive);

    if (req.body.updateState) {
      processes.forEach(p => {
        if (p.id.startsWith('C')) {
          const complaint = mockComplaints.find(c => c.complaintId === p.id);
          if (complaint) complaint.status = 'Resolved';
        } else if (p.id.startsWith('F')) {
          const order = mockFoodOrders.find(f => f.orderId === p.id);
          if (order) order.status = 'Completed';
        } else if (p.id.startsWith('H')) {
          const hall = mockAuditoriums.find(h => h.hallId === p.id);
          if (hall) hall.status = 'Available';
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Scheduling execution failed' });
  }
});

// Priority - VIP handling / Support Tickets
app.post('/api/scheduling/priority', (req, res) => {
  try {
    const priority = new PriorityScheduling();
    const processes = req.body.processes;
    const preemptive = req.body.preemptive || false;
    if (!Array.isArray(processes)) {
      return res.status(400).json({ error: 'Processes must be an array' });
    }
    processes.forEach(p => priority.addProcess(p));
    const result = priority.execute(preemptive);

    if (req.body.updateState) {
      processes.forEach(p => {
        if (p.id.startsWith('C')) {
          const complaint = mockComplaints.find(c => c.complaintId === p.id);
          if (complaint) complaint.status = 'Resolved';
        } else if (p.id.startsWith('F')) {
          const order = mockFoodOrders.find(f => f.orderId === p.id);
          if (order) order.status = 'Completed';
        } else if (p.id.startsWith('H')) {
          const hall = mockAuditoriums.find(h => h.hallId === p.id);
          if (hall) hall.status = 'Available';
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Scheduling execution failed' });
  }
});

// Round Robin - Peak traffic / Hall Cleaning
app.post('/api/scheduling/round-robin', (req, res) => {
  try {
    const quantum = req.body.quantum || 3;
    const rr = new RoundRobin(quantum);
    const processes = req.body.processes;
    if (!Array.isArray(processes)) {
      return res.status(400).json({ error: 'Processes must be an array' });
    }
    processes.forEach(p => rr.addProcess(p));
    const result = rr.execute();

    if (req.body.updateState) {
      processes.forEach(p => {
        if (p.id.startsWith('C')) {
          const complaint = mockComplaints.find(c => c.complaintId === p.id);
          if (complaint) complaint.status = 'Resolved';
        } else if (p.id.startsWith('F')) {
          const order = mockFoodOrders.find(f => f.orderId === p.id);
          if (order) order.status = 'Completed';
        } else if (p.id.startsWith('H')) {
          const hall = mockAuditoriums.find(h => h.hallId === p.id);
          if (hall) hall.status = 'Available';
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Scheduling execution failed' });
  }
});

// Demo: Run all algorithms with sample data
app.get('/api/scheduling/demo', (req, res) => {
  // Ticket Booking Demo (FCFS)
  const fcfs = new FCFS();
  mockBookings.forEach((b, i) => fcfs.addProcess({
    id: b.bookingId, name: b.userName, arrivalTime: i * 2, burstTime: 3 + Math.floor(Math.random() * 5), type: 'booking'
  }));
  const fcfsResult = fcfs.execute();

  // Food Order Demo (SJF)
  const sjf = new SJF();
  mockFoodOrders.forEach((f, i) => sjf.addProcess({
    id: f.orderId, name: f.items, arrivalTime: i, burstTime: f.preparationTime, type: 'food'
  }));
  const sjfResult = sjf.execute(false);

  // Complaint Handling Demo (Priority)
  const priority = new PriorityScheduling();
  mockComplaints.forEach((c, i) => priority.addProcess({
    id: c.complaintId, name: c.userName + ' - ' + c.complaintType, arrivalTime: i * 3, burstTime: 5 + Math.floor(Math.random() * 10), priority: c.priority, priorityLabel: c.priority === 1 ? 'Critical' : c.priority === 2 ? 'Medium' : 'Low', type: 'complaint'
  }));
  const priorityResult = priority.execute(false);

  // Hall Cleaning Demo (Round Robin)
  const rr = new RoundRobin(5);
  mockAuditoriums.forEach((a, i) => rr.addProcess({
    id: a.hallId, name: a.hallName, arrivalTime: i * 2, burstTime: a.cleaningTime, type: 'cleaning'
  }));
  const rrResult = rr.execute();

  res.json({
    ticketBooking: fcfsResult,
    foodOrders: sjfResult,
    complaints: priorityResult,
    hallCleaning: rrResult,
  });
});

// Serve the admin portal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listen on configured host or localhost by default (security best practice)
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  // Server started successfully
  console.log(`Cinema Management System running at http://${HOST}:${PORT}`);
});
