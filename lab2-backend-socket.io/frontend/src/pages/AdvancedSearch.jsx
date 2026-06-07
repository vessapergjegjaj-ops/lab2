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
      { id: 1, name: "Payment 001", method: "Card", status: "success", amount: 50 },
      { id: 2, name: "Payment 002", method: "Cash", status: "pending", amount: 25 },
      { id: 3, name: "Payment 003", method: "PayPal", status: "failed", amount: 30 },
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

    if (filterValue.trim() !== "") {
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

  const resetSearch = () => {
    setSearchText("");
    setFilterValue("");
    setSortBy("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "25px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ marginBottom: "5px" }}>Advanced Search</h1>

        <p style={{ color: "#cbd5e1", marginBottom: "25px" }}>
          Full-text search, filters and sorting for 5 different lists.
        </p>

        <div style={{ marginBottom: "20px" }}>
          {["matches", "bookings", "seats", "payments", "users"].map((list) => (
            <button
              key={list}
              onClick={() => setActiveList(list)}
              style={{
                padding: "10px 15px",
                marginRight: "8px",
                marginBottom: "8px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: activeList === list ? "#06b6d4" : "#334155",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {list.toUpperCase()}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Full-text search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#020617",
              color: "white",
              minWidth: "230px",
            }}
          />

          <input
            type="text"
            placeholder="Filter by status, role, stadium..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#020617",
              color: "white",
              minWidth: "260px",
            }}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#020617",
              color: "white",
            }}
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="date">Date</option>
            <option value="price">Price / Amount</option>
          </select>

          <button
            onClick={resetSearch}
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#ef4444",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset
          </button>
        </div>

        <div
          style={{
            background: "#020617",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "15px",
          }}
        >
          <strong>Results:</strong> {filteredData.length} from{" "}
          <strong>{activeList}</strong>
        </div>

        {filteredData.length === 0 ? (
          <div
            style={{
              padding: "25px",
              background: "#111827",
              borderRadius: "12px",
              textAlign: "center",
              color: "#cbd5e1",
            }}
          >
            No results found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#020617",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#06b6d4" }}>
                  {Object.keys(filteredData[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        color: "white",
                      }}
                    >
                      {key.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #1e293b" }}>
                    {Object.values(item).map((value, index) => (
                      <td key={index} style={{ padding: "12px", color: "#e2e8f0" }}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedSearch;