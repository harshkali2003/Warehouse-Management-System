# Warehouse Management System (WMS) — Backend

A production-oriented **Warehouse Management System (WMS)** backend built with a focus on **inventory consistency, system design, and real-world warehouse workflows**.

---

## 📌 Overview

This system is designed to manage warehouse operations such as:

* Inventory tracking at bin level
* Stock movement (inbound, outbound, transfer)
* Batch management (expiry-based tracking)
* Reservation system for order fulfillment

The project focuses on building a **scalable and reliable backend system**, similar to real-world logistics platforms.

---

## 🏗️ Architecture

The project follows a **modular backend architecture**:

* Each domain (inventory, stock, warehouse, etc.) is handled independently
* Business logic is separated using service layers
* Designed as a **modular monolith** for scalability

---

## ⚙️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JWT (planned)

---

## 📦 Core Modules

### 🔹 Product

Defines items that can be stored and managed in the warehouse.

---

### 🔹 Warehouse

Represents physical storage locations with geospatial support.

---

### 🔹 Bin (Location System)

Represents the smallest storage unit inside a warehouse.

Structure:
Warehouse → Zone → Rack → Shelf → Bin

---

### 🔹 Batch

Groups products based on manufacturing and expiry dates.

---

### 🔹 Inventory (🔥 Core Module)

Tracks the current stock of products.

Key principle:

* One record per (product + batch + bin)
* Maintains current quantity

---

### 🔹 Stock Movement (🔥 Core Feature)

Tracks every change in inventory:

* INBOUND → Stock added
* OUTBOUND → Stock removed
* TRANSFER → Stock moved between bins

Provides a complete **audit trail of inventory changes**.

---

### 🔹 Reservation (Planned)

Prevents overselling by reserving stock before order fulfillment.

Flow:
Order → Reserve stock → Confirm → Deduct

---

## 🔄 Warehouse Flow

### 📦 Inbound

Supplier → Receive → Assign Bin → Update Inventory → Log Movement

---

### 📤 Outbound

Order → Pick → Pack → Dispatch → Update Inventory → Log Movement

---

### 🔁 Transfer

Bin A → Bin B → Update Inventory → Log Movement

---

## 🧠 Key Engineering Concepts

* Separation of Product and Inventory
* Bin-level inventory tracking
* Unique constraints to prevent duplicate stock
* Stock movement as immutable audit logs
* System design focused approach

---

## 📂 Project Structure

```id="v8r3k1"
src/
 ├── modules/
 │    ├── product/
 │    ├── warehouse/
 │    ├── bin/
 │    ├── batch/
 │    ├── inventory/
 │    ├── stock/
 │
 ├── shared/
 │    ├── middlewares/
 │    ├── utils/
 │
 ├── config/
 ├── app.js
 ├── server.js
```

---

## 🚀 Future Improvements

* Reservation system implementation
* Concurrency handling using transactions
* Redis caching for performance
* Message queues for async processing
* Role-based access control

---

## 🏁 Conclusion

This project focuses on building a **real-world backend system** with:

* Strong data modeling
* Scalable architecture
* Inventory consistency
* Auditability through stock movement

---

## 👨‍💻 Author

Harsh Vardhan
Backend Developer | MERN Stack | System Design Enthusiast
