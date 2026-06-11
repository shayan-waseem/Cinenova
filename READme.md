# 🎬 Cinema Management System

## Operating Systems Project

---

# 1. Project Title

**Cinema Management System using Operating System Scheduling Algorithms**

---

# 2. Project Overview

The Cinema Management System is a hybrid application consisting of:

* 📱 Mobile Application for Customers
* 💻 Web-Based Admin Portal

The system automates cinema operations such as ticket booking, food ordering, customer support, auditorium management, and movie scheduling.

The main objective of this project is to demonstrate the practical implementation of Operating System Scheduling Algorithms in a real-world cinema environment.

The project applies:

* First Come First Serve (FCFS)
* Shortest Job First (SJF)
* Priority Scheduling
* Round Robin Scheduling

across different departments of the cinema.

---

# 3. Project Objectives

* Manage movie ticket bookings.
* Handle food and snack orders.
* Process customer complaints.
* Manage auditorium operations.
* Schedule movies and special events.
* Demonstrate OS scheduling algorithms in real-life scenarios.
* Provide analytical reports through the Admin Portal.

---

# 4. System Architecture

## User Side (Mobile App)

Customers can:

* Register/Login
* Browse Movies
* View Show Timings
* Book Tickets
* Select Seats
* Order Food
* Submit Complaints
* View Booking History
* Track Orders
* Receive Notifications

---

## Admin Side (Web Portal)

Administrators can:

* Manage Movies
* Manage Shows
* Manage Halls
* Manage Food Menu
* View Ticket Sales
* Monitor Scheduling Algorithms
* Manage Complaints
* Generate Reports
* View Revenue Analytics
* Manage Users

---

# 5. Operating System Scheduling Implementation

---

## Department 1: Ticket Booking Department

### FCFS (First Come First Serve)

Normal customers are served according to arrival time.

Example:

Customer A → 10:00 AM

Customer B → 10:01 AM

Customer C → 10:03 AM

Processing Order:

A → B → C

---

### Priority Scheduling (Non-Preemptive)

VIP customers receive higher priority.

Priority Levels:

VIP = 1

Premium = 2

Regular = 3

Processing:

VIP → Premium → Regular

---

### Round Robin

Used during peak traffic.

Each booking request gets fixed CPU time.

Example Quantum = 3 seconds

Customer A → 3 sec

Customer B → 3 sec

Customer C → 3 sec

Cycle repeats until booking completes.

---

# Department 2: Food & Snack Department

## SJF (Shortest Job First)

Orders requiring less preparation time are processed first.

Example:

Popcorn = 2 min

Drink = 1 min

Burger = 8 min

Pizza = 15 min

Processing:

Drink → Popcorn → Burger → Pizza

---

## Priority Scheduling (Preemptive)

VIP lounge orders interrupt normal orders.

Example:

Normal Pizza Order

↓

VIP Popcorn Order Arrives

↓

Kitchen immediately processes VIP order

↓

Returns to Pizza

---

## Round Robin

Kitchen resources shared equally.

Each order receives fixed preparation slot.

Quantum Example:

5 minutes

---

# Department 3: Customer Support Department

## FCFS

Complaints handled based on submission time.

---

## Priority Scheduling

Critical complaints receive higher priority.

Examples:

Payment Failure

Ticket Cancellation

Refund Issues

These are processed before general inquiries.

---

## Round Robin

Support agents spend fixed time per customer.

Example:

Quantum = 10 minutes

Agent handles:

Customer A → 10 mins

Customer B → 10 mins

Customer C → 10 mins

Then repeats.

---

# Department 4: Auditorium Operations

## SJF

Halls with shorter cleaning times are prepared first.

Example:

Hall A = 15 mins

Hall B = 30 mins

Hall C = 45 mins

Processing:

A → B → C

---

## FCFS

Cleaning requests enter queue according to movie completion time.

---

## Round Robin

Shows are distributed among halls cyclically.

Example:

Hall 1

Hall 2

Hall 3

Hall 1

Hall 2

Hall 3

This balances workload.

---

# Department 5: Movie & Event Scheduling

## Priority Scheduling (Preemptive)

Special events receive highest priority.

Examples:

Movie Premieres

Celebrity Visits

Blockbuster Releases

---

## SJF (Preemptive)

Short advertisements and trailers are inserted before long content.

---

## FCFS

Regular movie scheduling follows request order.

---

# 6. Complete System Workflow

## Step 1

Customer opens mobile application.

↓

## Step 2

Customer registers/logs in.

↓

## Step 3

Customer browses movies.

↓

## Step 4

Select movie and show.

↓

## Step 5

Ticket request enters Booking Queue.

↓

## Step 6

Scheduling Algorithm executes:

FCFS

Priority

Round Robin

↓

## Step 7

Seat allocated.

↓

## Step 8

Payment completed.

↓

## Step 9

Ticket generated.

↓

## Step 10

Customer may order food.

↓

## Step 11

Food Order Queue executes:

SJF

Priority

Round Robin

↓

## Step 12

Food prepared and delivered.

↓

## Step 13

Customer watches movie.

↓

## Step 14

Complaint submitted (Optional)

↓

## Step 15

Support Queue executes:

FCFS

Priority

Round Robin

↓

## Step 16

Admin monitors everything from Dashboard.

---

# 7. Technology Stack

## Frontend Mobile App

React Native

or

Flutter

---

## Admin Portal

React.js

---

## Backend

Node.js

Express.js

---

## Database

MongoDB

---

## Authentication

JWT

---

## Operating System Simulation

Custom Scheduling Engine

* FCFS Module
* SJF Module
* Priority Module
* Round Robin Module

---

# 8. Database Collections

## Users

* userId
* name
* email
* password
* role

---

## Movies

* movieId
* title
* duration
* genre
* rating

---

## Shows

* showId
* movieId
* hallId
* date
* time

---

## Bookings

* bookingId
* userId
* showId
* seatNumber
* bookingType

---

## FoodOrders

* orderId
* userId
* items
* preparationTime
* priority

---

## Complaints

* complaintId
* userId
* complaintType
* priority
* status

---

## Auditoriums

* hallId
* hallName
* capacity
* cleaningTime

---

# 9. Admin Dashboard Features

## Analytics

* Daily Sales
* Weekly Sales
* Monthly Sales
* Revenue Graphs

---

## Scheduling Analytics

* FCFS Queue Visualization
* SJF Queue Visualization
* Priority Queue Visualization
* Round Robin Execution Visualization

---

## Reports

* Ticket Reports
* Food Sales Reports
* Customer Reports
* Complaint Reports

---

# 10. Folder Structure

CinemaManagementSystem/

│

├── frontend-mobile/

│ ├── src/

│ │ ├── screens/

│ │ ├── components/

│ │ ├── navigation/

│ │ ├── services/

│ │ ├── redux/

│ │ ├── assets/

│ │ └── utils/

│

├── admin-portal/

│ ├── src/

│ │ ├── pages/

│ │ ├── components/

│ │ ├── dashboard/

│ │ ├── charts/

│ │ ├── services/

│ │ └── layouts/

│

├── backend/

│ ├── config/

│ ├── controllers/

│ ├── routes/

│ ├── models/

│ ├── middleware/

│ ├── services/

│ ├── scheduling/

│ │

│ ├── fcfs/

│ │ └── FCFS.js

│ │

│ ├── sjf/

│ │ └── SJF.js

│ │

│ ├── priority/

│ │ └── Priority.js

│ │

│ ├── roundrobin/

│ │ └── RoundRobin.js

│ │

│ └── server.js

│

├── docs/

│ ├── SRS.pdf

│ ├── UML

│ ├── ResearchPaper

│ └── Presentation

│

├── README.md

├── package.json

└── .env

---

# 11. Future Enhancements

* AI Movie Recommendations
* Online Payments
* QR Ticket Scanning
* Facial Recognition Entry
* Dynamic Pricing
* Real-Time Seat Reservation
* Multi-Cinema Support

---

# 12. Conclusion

The Cinema Management System demonstrates the practical implementation of Operating System scheduling algorithms within a real-world business environment. By integrating FCFS, SJF, Priority Scheduling, and Round Robin Scheduling into various cinema departments, the system improves resource utilization, fairness, response time, and overall operational efficiency while providing a complete customer and administrator experience.

---

# 13. How to Run the Application

This repository contains a fully interactive simulation of the Cinema Management System using OS Scheduling Algorithms, complete with an **Admin Portal** and a separate customer **Expo Mobile Application**.

---

## Part A: Running the Backend Server & Admin Portal

The backend server is an Express application that serves both the API endpoints and renders the Admin Web Portal.

### 1. Install dependencies:
From the project root directory, run:
```bash
npm install
```

### 2. Start the server:
For local-only browser testing (Admin portal and emulator access):
```bash
npm start
```
* The server will boot and listen on `http://127.0.0.1:3000`.
* Open [http://localhost:3000](http://localhost:3000) in your web browser to launch the Admin Portal interface.

> [!TIP]
> If you plan to test the mobile app on a **physical mobile phone** via Expo Go, run the server on all network interfaces using the `HOST` variable so your phone can reach it:
> ```bash
> HOST=0.0.0.0 npm start
> ```

---

## Part B: Running the Customer Mobile App (Expo)

The customer app is built on React Native & Expo, allowing you to run it locally on emulators or your own physical phone.

### 1. Install mobile dependencies:
Navigate to the `frontend-mobile` directory and install the packages:
```bash
cd frontend-mobile
npm install
```

### 2. Start the Expo development server:
```bash
npx expo start
```npx expo start

### 3. Open the application:
* **iOS Simulator**: Press `i` in the terminal to launch the app on your computer's iOS simulator.
* **Android Emulator**: Press `a` in the terminal to launch the app on your computer's Android emulator.
* **Physical Device**: Make sure your phone and computer are on the same Wi-Fi network. Scan the QR code printed in the terminal:
  - On **iOS**: Scan the QR code using your phone's system Camera app (requires the [Expo Go app](https://apps.apple.com/app/expo-go/id984021508) installed).
  - On **Android**: Scan the QR code using the scanner inside the [Expo Go app](https://play.google.com/store/apps/details?id=host.exp.exponent).

### 4. Connect the mobile app to the server:
1. Log in on the welcome screen with your name and category tier (VIP, Premium, or Regular).
2. Tap the settings gear icon (`⚙️`) in the top-right corner of the header.
3. Enter your computer's local IP address (e.g. `192.168.1.50`) and tap **Test & Connect**.
4. Once connected, your ticket bookings, snack orders, and support complaints will sync in real time with the running Admin Portal!

---

## 🧪 Interactive Simulation Workflow

1. **User Mobile App Simulation:** Submit some bookings, orders, or support complaints through the Expo mobile app (or use the built-in customer simulator on the web dashboard).
2. **Admin Algorithm Dispatching:** Go to the Admin Web Portal (`http://localhost:3000`) and view the **Bookings**, **Food Orders**, or **Complaints** queue tables.
3. **Dispatch & Visualize:** Use the page header dropdowns to select the desired OS scheduling algorithm (e.g. FCFS, Priority, SJF, or Round Robin) and hit **Run Scheduler**.
4. **Real-time Live Sync**: The system executes the scheduling algorithm and updates the items. The horizontal Gantt Chart is generated in the portal, and the customer's mobile app receives live status updates (e.g., ticket generated, kitchen preparing, complaint resolved) in their **Wallet** screen progress tracker!

