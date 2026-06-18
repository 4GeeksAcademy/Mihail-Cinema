import "./style.css";

type SeatMatrix = number[][];

const INITIAL_UI_ROOM_MATRIX: SeatMatrix = [
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
];

function cloneSeatMatrix(matrix: SeatMatrix): SeatMatrix {
  return matrix.map((row) => [...row]);
}

/**
 * Builds a seating matrix where 0 means available and 1 means occupied.
 */
function initializeSeatingMatrix(rows: number = 8, columns: number = 10): SeatMatrix {
  return Array.from({ length: rows }, () => Array(columns).fill(0));
}

/**
 * Prints the room with row/column numbers, X for occupied seats, and L for available seats.
 */
function displayScreeningRoom(seats: SeatMatrix): void {
  const columnNumbers = seats[0].map((_, index) => String(index + 1).padStart(2, " ")).join(" ");
  console.log(`    ${columnNumbers}`);

  let rowIndex = 0;

  while (rowIndex < seats.length) {
    const row = seats[rowIndex];
    const rowLabel = String(rowIndex + 1).padStart(2, " ");
    const rowSeats = row.map((seat) => (seat === 1 ? " X" : " L")).join(" ");
    console.log(`${rowLabel} |${rowSeats}`);
    rowIndex += 1;
  }
}

/**
 * Reserves one seat using 1-based row and column numbers.
 */
function reserveSeat(seats: SeatMatrix, rowNumber: number, columnNumber: number): string {
  const rowIndex = rowNumber - 1;
  const columnIndex = columnNumber - 1;

  if (!seats[rowIndex] || seats[rowIndex][columnIndex] === undefined) {
    return `Reservation failed: seat (${rowNumber}, ${columnNumber}) is out of range.`;
  }

  if (seats[rowIndex][columnIndex] === 1) {
    return `Reservation failed: seat (${rowNumber}, ${columnNumber}) is already taken.`;
  }

  seats[rowIndex][columnIndex] = 1;
  return `Reservation confirmed: seat (${rowNumber}, ${columnNumber}) is now reserved.`;
}

/**
 * Toggles a seat between occupied (1) and available (0) using 1-based coordinates.
 */
function toggleSeat(seats: SeatMatrix, rowNumber: number, columnNumber: number): string {
  const rowIndex = rowNumber - 1;
  const columnIndex = columnNumber - 1;

  if (!seats[rowIndex] || seats[rowIndex][columnIndex] === undefined) {
    return `Update failed: seat (${rowNumber}, ${columnNumber}) is out of range.`;
  }

  if (seats[rowIndex][columnIndex] === 1) {
    seats[rowIndex][columnIndex] = 0;
    return `Seat released: seat (${rowNumber}, ${columnNumber}) is now available.`;
  }

  seats[rowIndex][columnIndex] = 1;
  return `Reservation confirmed: seat (${rowNumber}, ${columnNumber}) is now reserved.`;
}

/**
 * Counts occupied and available seats in the entire room.
 */
function countSeats(seats: SeatMatrix): { occupied: number; available: number } {
  const occupied = seats.flat().filter((seat) => seat === 1).length;
  const total = seats.length * seats[0].length;

  return {
    occupied,
    available: total - occupied,
  };
}

/**
 * Finds the first horizontal pair of adjacent available seats.
 */
function findFirstAdjacentAvailableSeats(
  seats: SeatMatrix,
): { first: { row: number; column: number }; second: { row: number; column: number } } | null {
  for (let rowIndex = 0; rowIndex < seats.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < seats[rowIndex].length - 1; columnIndex += 1) {
      if (seats[rowIndex][columnIndex] === 0 && seats[rowIndex][columnIndex + 1] === 0) {
        return {
          first: { row: rowIndex + 1, column: columnIndex + 1 },
          second: { row: rowIndex + 1, column: columnIndex + 2 },
        };
      }
    }
  }

  return null;
}

function logSeatSummary(seats: SeatMatrix): void {
  const summary = countSeats(seats);
  console.log(`Occupied seats: ${summary.occupied}`);
  console.log(`Available seats: ${summary.available}`);
}

function logAdjacentPairResult(seats: SeatMatrix): void {
  const pair = findFirstAdjacentAvailableSeats(seats);

  if (!pair) {
    console.log("Adjacent search: no adjacent available seats found.");
    return;
  }

  console.log(
    `Adjacent search: found seats (${pair.first.row}, ${pair.first.column}) and (${pair.second.row}, ${pair.second.column}).`,
  );
}

function renderCinemaUI(seats: SeatMatrix): void {
  if (typeof document === "undefined") {
    return;
  }

  const occupiedCount = document.querySelector<HTMLElement>("#occupied-count");
  const availableCount = document.querySelector<HTMLElement>("#available-count");
  const statusMessage = document.querySelector<HTMLElement>("#status-message");
  const adjacentMessage = document.querySelector<HTMLElement>("#adjacent-result");
  const seatGrid = document.querySelector<HTMLElement>("#seat-grid");

  if (!occupiedCount || !availableCount || !statusMessage || !adjacentMessage || !seatGrid) {
    return;
  }

  const summary = countSeats(seats);
  occupiedCount.textContent = String(summary.occupied);
  availableCount.textContent = String(summary.available);

  seatGrid.innerHTML = "";
  seatGrid.style.gridTemplateColumns = `repeat(${seats[0].length + 1}, 2rem)`;

  const corner = document.createElement("div");
  corner.className = "seat-header";
  corner.textContent = "#";
  seatGrid.appendChild(corner);

  for (let column = 1; column <= seats[0].length; column += 1) {
    const columnLabel = document.createElement("div");
    columnLabel.className = "seat-header";
    columnLabel.textContent = String(column);
    seatGrid.appendChild(columnLabel);
  }

  for (let rowIndex = 0; rowIndex < seats.length; rowIndex += 1) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "seat-row-label";
    rowLabel.textContent = String(rowIndex + 1);
    seatGrid.appendChild(rowLabel);

    for (let columnIndex = 0; columnIndex < seats[rowIndex].length; columnIndex += 1) {
      const seatButton = document.createElement("button");
      const isOccupied = seats[rowIndex][columnIndex] === 1;

      seatButton.type = "button";
      seatButton.className = `seat ${isOccupied ? "occupied" : "available"}`;
      seatButton.textContent = isOccupied ? "X" : "L";
      seatButton.setAttribute("aria-label", `Row ${rowIndex + 1}, Seat ${columnIndex + 1}`);

      seatButton.addEventListener("click", () => {
        const message = toggleSeat(seats, rowIndex + 1, columnIndex + 1);
        statusMessage.textContent = message;
        renderCinemaUI(seats);
      });

      seatGrid.appendChild(seatButton);
    }
  }

  const adjacentPair = findFirstAdjacentAvailableSeats(seats);
  adjacentMessage.textContent = adjacentPair
    ? `Suggestion: (${adjacentPair.first.row}, ${adjacentPair.first.column}) and (${adjacentPair.second.row}, ${adjacentPair.second.column})`
    : "Suggestion: no adjacent available seats.";
}

function initializeCinemaDashboard(): void {
  if (typeof document === "undefined") {
    return;
  }

  const uiRoom = cloneSeatMatrix(INITIAL_UI_ROOM_MATRIX);

  const app = document.querySelector<HTMLElement>("#app");
  const statusMessage = document.querySelector<HTMLElement>("#status-message");
  const adjacentMessage = document.querySelector<HTMLElement>("#adjacent-result");
  const findAdjacentButton = document.querySelector<HTMLButtonElement>("#find-adjacent-btn");
  const reserveAdjacentButton = document.querySelector<HTMLButtonElement>("#reserve-adjacent-btn");
  const resetRoomButton = document.querySelector<HTMLButtonElement>("#reset-room-btn");

  if (!app || !statusMessage || !adjacentMessage) {
    return;
  }

  app.textContent = "Interactive seat map ready. Click an available seat to reserve it.";

  renderCinemaUI(uiRoom);

  findAdjacentButton?.addEventListener("click", () => {
    const pair = findFirstAdjacentAvailableSeats(uiRoom);
    adjacentMessage.textContent = pair
      ? `Suggestion: (${pair.first.row}, ${pair.first.column}) and (${pair.second.row}, ${pair.second.column})`
      : "Suggestion: no adjacent available seats.";
  });

  reserveAdjacentButton?.addEventListener("click", () => {
    const pair = findFirstAdjacentAvailableSeats(uiRoom);

    if (!pair) {
      statusMessage.textContent = "Reservation failed: no adjacent pair is available.";
      return;
    }

    reserveSeat(uiRoom, pair.first.row, pair.first.column);
    const message = reserveSeat(uiRoom, pair.second.row, pair.second.column);
    statusMessage.textContent = message;
    renderCinemaUI(uiRoom);
  });

  resetRoomButton?.addEventListener("click", () => {
    const resetMatrix = cloneSeatMatrix(INITIAL_UI_ROOM_MATRIX);

    for (let rowIndex = 0; rowIndex < uiRoom.length; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < uiRoom[rowIndex].length; columnIndex += 1) {
        uiRoom[rowIndex][columnIndex] = resetMatrix[rowIndex][columnIndex];
      }
    }

    statusMessage.textContent = "Room reset complete: original seating arrangement restored.";
    renderCinemaUI(uiRoom);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCinemaDashboard);
  } else {
    initializeCinemaDashboard();
  }
}

console.log("\n=== Scenario 1: Empty room (all seats available) ===");
const emptyRoom = initializeSeatingMatrix();
displayScreeningRoom(emptyRoom);
logSeatSummary(emptyRoom);
console.log(reserveSeat(emptyRoom, 1, 1));
console.log(reserveSeat(emptyRoom, 1, 1));
logAdjacentPairResult(emptyRoom);

console.log("\n=== Scenario 2: Partially filled room ===");
const partialRoom = initializeSeatingMatrix();
reserveSeat(partialRoom, 1, 1);
reserveSeat(partialRoom, 2, 3);
reserveSeat(partialRoom, 5, 5);
reserveSeat(partialRoom, 8, 10);
displayScreeningRoom(partialRoom);
logSeatSummary(partialRoom);
console.log(reserveSeat(partialRoom, 2, 3));
console.log(reserveSeat(partialRoom, 2, 4));
logAdjacentPairResult(partialRoom);

console.log("\n=== Scenario 3: Nearly full room with scattered single seats ===");
const nearlyFullRoom = initializeSeatingMatrix().map((row) => row.map(() => 1));
nearlyFullRoom[0][0] = 0;
nearlyFullRoom[1][2] = 0;
nearlyFullRoom[2][4] = 0;
nearlyFullRoom[3][6] = 0;
nearlyFullRoom[4][8] = 0;
displayScreeningRoom(nearlyFullRoom);
logSeatSummary(nearlyFullRoom);
logAdjacentPairResult(nearlyFullRoom);
console.log(reserveSeat(nearlyFullRoom, 1, 1));
console.log(reserveSeat(nearlyFullRoom, 1, 2));

console.log("\n=== Scenario 4: Full room (no seats available) ===");
const fullRoom = initializeSeatingMatrix().map((row) => row.map(() => 1));
displayScreeningRoom(fullRoom);
logSeatSummary(fullRoom);
logAdjacentPairResult(fullRoom);
console.log(reserveSeat(fullRoom, 3, 7));

export {};
