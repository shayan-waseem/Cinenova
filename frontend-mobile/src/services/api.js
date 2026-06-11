import { Platform } from 'react-native';

// Default server URL — works for iOS simulator & web.
// Android emulator uses 10.0.2.2 to reach host machine's localhost.
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEFAULT_PORT = '3000';

let _serverHost = DEFAULT_HOST;
let _serverPort = DEFAULT_PORT;

export function setServerAddress(host, port) {
  _serverHost = host || DEFAULT_HOST;
  _serverPort = port || DEFAULT_PORT;
}

export function getServerAddress() {
  return { host: _serverHost, port: _serverPort };
}

function getBaseUrl() {
  return `http://${_serverHost}:${_serverPort}`;
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper with timeout and offline fallback
// ---------------------------------------------------------------------------
async function apiFetch(endpoint, options = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    // Re-throw so callers can detect offline vs server error
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Movie APIs
// ---------------------------------------------------------------------------
export async function fetchMovies() {
  return apiFetch('/api/movies');
}

// ---------------------------------------------------------------------------
// Show APIs
// ---------------------------------------------------------------------------
export async function fetchShows() {
  return apiFetch('/api/shows');
}

// ---------------------------------------------------------------------------
// Booking APIs
// ---------------------------------------------------------------------------
export async function fetchBookings() {
  return apiFetch('/api/bookings');
}

export async function createBooking({ userName, showId, seatNumber, bookingType }) {
  return apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ userName, showId, seatNumber, bookingType }),
  });
}

// ---------------------------------------------------------------------------
// Food Order APIs
// ---------------------------------------------------------------------------
export async function fetchFoodOrders() {
  return apiFetch('/api/food-orders');
}

export async function createFoodOrder({ userName, items, preparationTime, priorityLabel }) {
  return apiFetch('/api/food-orders', {
    method: 'POST',
    body: JSON.stringify({ userName, items, preparationTime, priorityLabel }),
  });
}

// ---------------------------------------------------------------------------
// Complaint APIs
// ---------------------------------------------------------------------------
export async function fetchComplaints() {
  return apiFetch('/api/complaints');
}

export async function createComplaint({ userName, complaintType, priorityText }) {
  return apiFetch('/api/complaints', {
    method: 'POST',
    body: JSON.stringify({ userName, complaintType, priorityText }),
  });
}

// ---------------------------------------------------------------------------
// Dashboard / Stats
// ---------------------------------------------------------------------------
export async function fetchDashboard() {
  return apiFetch('/api/dashboard');
}

// ---------------------------------------------------------------------------
// Offline fallback mock data
// ---------------------------------------------------------------------------
export const MOCK_MOVIES = [
  { movieId: 'M001', title: 'Interstellar', duration: 169, genre: 'Sci-Fi', rating: 8.7, poster: '🚀', status: 'Now Showing' },
  { movieId: 'M002', title: 'The Dark Knight', duration: 152, genre: 'Action', rating: 9.0, poster: '🦇', status: 'Now Showing' },
  { movieId: 'M003', title: 'Inception', duration: 148, genre: 'Sci-Fi', rating: 8.8, poster: '🌀', status: 'Now Showing' },
  { movieId: 'M004', title: 'Avengers: Endgame', duration: 181, genre: 'Action', rating: 8.4, poster: '🛡️', status: 'Coming Soon' },
  { movieId: 'M005', title: 'Joker', duration: 122, genre: 'Drama', rating: 8.4, poster: '🃏', status: 'Now Showing' },
  { movieId: 'M006', title: 'Parasite', duration: 132, genre: 'Thriller', rating: 8.5, poster: '🏠', status: 'Now Showing' },
  { movieId: 'M007', title: 'Spider-Man: No Way Home', duration: 148, genre: 'Action', rating: 8.3, poster: '🕷️', status: 'Coming Soon' },
  { movieId: 'M008', title: 'Dune: Part Two', duration: 166, genre: 'Sci-Fi', rating: 8.6, poster: '🏜️', status: 'Now Showing' },
];

export const MOCK_SHOWS = [
  { showId: 'S001', movieId: 'M001', hallId: 'H001', date: '2026-06-04', time: '10:00 AM', movieTitle: 'Interstellar', hallName: 'Hall A - IMAX', totalCapacity: 120, bookedSeats: 45 },
  { showId: 'S002', movieId: 'M002', hallId: 'H002', date: '2026-06-04', time: '01:00 PM', movieTitle: 'The Dark Knight', hallName: 'Hall B - Dolby', totalCapacity: 100, bookedSeats: 78 },
  { showId: 'S003', movieId: 'M003', hallId: 'H001', date: '2026-06-04', time: '04:00 PM', movieTitle: 'Inception', hallName: 'Hall A - IMAX', totalCapacity: 120, bookedSeats: 62 },
  { showId: 'S004', movieId: 'M005', hallId: 'H003', date: '2026-06-04', time: '07:00 PM', movieTitle: 'Joker', hallName: 'Hall C - Standard', totalCapacity: 80, bookedSeats: 33 },
  { showId: 'S005', movieId: 'M006', hallId: 'H002', date: '2026-06-05', time: '10:00 AM', movieTitle: 'Parasite', hallName: 'Hall B - Dolby', totalCapacity: 100, bookedSeats: 51 },
  { showId: 'S006', movieId: 'M008', hallId: 'H001', date: '2026-06-05', time: '01:00 PM', movieTitle: 'Dune: Part Two', hallName: 'Hall A - IMAX', totalCapacity: 120, bookedSeats: 90 },
];

export const FOOD_MENU = [
  { name: 'Large Popcorn', emoji: '🍿', preparationTime: 3, price: 450 },
  { name: 'Cold Drink', emoji: '🥤', preparationTime: 1, price: 200 },
  { name: 'Cheese Burger', emoji: '🍔', preparationTime: 8, price: 650 },
  { name: 'Nachos + Dip', emoji: '🧀', preparationTime: 5, price: 500 },
  { name: 'Pizza Slice', emoji: '🍕', preparationTime: 12, price: 550 },
  { name: 'Hot Dog + Drink', emoji: '🌭', preparationTime: 6, price: 480 },
  { name: 'Ice Cream Sundae', emoji: '🍨', preparationTime: 4, price: 350 },
  { name: 'French Fries', emoji: '🍟', preparationTime: 7, price: 300 },
];
