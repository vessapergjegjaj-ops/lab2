import { useMemo, useState } from "react";

function AdvancedSearch() {
  const [activeList, setActiveList] = useState("matches");
  const [searchText, setSearchText] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("");

  const data = {
    matches: [
      { id: 1, name: "Real Madrid vs Barcelona", stadium: "Bernabeu", date: "2026-10-09", status: "scheduled" },
      { id: 2, name: "Liverpool vs Chelsea", stadium: "Anfield", date: "2026-11-12", status: "active" },
      { id: 3, name: "PSG vs Juventus", stadium: "Parc des Princes", date: "2026-12-01", status: "cancelled" },
    ],
    bookings: [
      { id: 1, name: "Booking 001", user: "Elsa", status: "paid", date: "2026-10-09" },
      { id: 2, name: "Booking 002", user: "Arta", status: "pending", date: "2026-11-12" },
      { id: 3, name: "Booking 003", user: "Dion", status: "cancelled", date: "2026-12-01" },
    ],
    seats: [
      { id: 1, name: "Seat A1", section: "VIP", status: "available", price: 50 },
      { id: 2, name: "Seat B4", section: "Regular", status: "reserved", price: 25 },
      { id: 3, name: "Seat C7", section: "Regular", status: "sold", price: 30 },
    ],
    payments: [
      { id: 1, name: "Payment 001", method: "card", status: "success", amount: 50 },
      { id: 2, name: "Payment 002", method: "cash", status: "pending", amount: 25 },
      { id: 3, name: "Payment 003", method: "paypal", status: "failed", amount: 30 },
    ],
    users: [
      { id: 1, name: "Admin User", role: "admin", status: "active", email: "admin@test.com" },
      { id: 2, name: "Normal User", role: "user", status: "active", email: "user@test.com" },
      { id: 3, name: "Manager User", role: "manager", status: "inactive", email: "manager@test.com" },
    ],
  };

  const currentData = data[activeList];

  const filteredData = useMemo(() => {
    let result = [...currentData];

    if (searchText.trim() !== "") {
      result = result.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (filterValue !== "") {
      result = result.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    if (sortBy === "status") {
      result.sort((a, b) => String(a.status).localeCompare(String(b.status)));
    }

    if (sortBy === "date") {
      result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }

    if (sortBy === "price") {
      result.sort((a, b) => (a.price || a.amount || 0) - (b.price || b.amount || 0));
    }

    return result;
  }, [searchText, filterValue, sortBy, currentData]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Advanced Search</h1>

      <p>
        Search with filters, sorting and full-text search for 5 different lists.
      </p>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => setActiveList("matches")}>Matches</button>{" "}
        <button onClick={() => setActiveList("bookings")}>Bookings</button>{" "}
        <button onClick={() => setActiveList("seats")}>Seats</button>{" "}
        <button onClick={() => setActiveList("payments")}>Payments</button>{" "}
        <button onClick={() => setActiveList("users")}>Users</button>
      </div>

      <input
        type="text"
        placeholder="Full-text search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ padding: "10px", width: "250px", marginRight: "10px" }}
      />

      <input
        type="text"
        placeholder="Filter by status, role, stadium..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        style={{ padding: "10px", width: "250px", marginRight: "10px" }}
      />

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{ padding: "10px" }}
      >
        <option value="">Sort By</option>
        <option value="name">Name</option>
        <option value="status">Status</option>
        <option value="date">Date</option>
        <option value="price">Price / Amount</option>
      </select>

      <h3 style={{ marginTop: "20px" }}>
        Results from {activeList}: {filteredData.length}
      </h3>

      {filteredData.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "15px" }}>
          <thead>
            <tr>
              {Object.keys(filteredData[0]).map((key) => (
                <th key={key}>{key.toUpperCase()}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                {Object.values(item).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdvancedSearch;