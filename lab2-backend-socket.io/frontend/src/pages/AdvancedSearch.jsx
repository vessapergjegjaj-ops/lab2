import { useMemo, useState } from "react";

function AdvancedSearch() {
  const [activeList, setActiveList] = useState("matches");
  const [team, setTeam] = useState("");
  const [stadium, setStadium] = useState("");
  const [seatType, setSeatType] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const matches = [
    {
      id: 1,
      team: "Real Madrid vs Barcelona",
      stadium: "Bernabeu",
      date: "2026-10-09",
      status: "scheduled",
      price: 80,
      image:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      team: "Liverpool vs Chelsea",
      stadium: "Anfield",
      date: "2026-11-12",
      status: "active",
      price: 60,
      image:
        "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      team: "PSG vs Juventus",
      stadium: "Parc des Princes",
      date: "2026-12-01",
      status: "cancelled",
      price: 70,
      image:
        "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const packages = [
    {
      id: 1,
      name: "VIP Match Package",
      match: "Real Madrid vs Barcelona",
      includes: "VIP seat + food + priority entry",
      status: "available",
      price: 180,
      icon: "⭐",
    },
    {
      id: 2,
      name: "Family Package",
      match: "Liverpool vs Chelsea",
      includes: "4 regular seats + snacks",
      status: "available",
      price: 120,
      icon: "👨‍👩‍👧‍👦",
    },
    {
      id: 3,
      name: "Student Package",
      match: "PSG vs Juventus",
      includes: "1 regular seat with student discount",
      status: "limited",
      price: 25,
      icon: "🎓",
    },
  ];

  const sections = [
    { id: 1, name: "North Stand", type: "Regular", status: "available", seats: 42, price: 25, icon: "🟢" },
    { id: 2, name: "East Premium", type: "Premium", status: "reserved", seats: 24, price: 45, icon: "🔵" },
    { id: 3, name: "South Stand", type: "Regular", status: "available", seats: 36, price: 30, icon: "🟡" },
    { id: 4, name: "West VIP", type: "VIP", status: "sold", seats: 12, price: 80, icon: "⭐" },
  ];

  const payments = [
    { id: 1, name: "Visa Card", method: "Card", status: "available", fee: "0 €", icon: "💳" },
    { id: 2, name: "Mastercard", method: "Card", status: "available", fee: "0 €", icon: "💳" },
    { id: 3, name: "PayPal", method: "Online Wallet", status: "available", fee: "1 €", icon: "🅿️" },
    { id: 4, name: "Cash Payment", method: "Cash", status: "available", fee: "0 €", icon: "💵" },
  ];

  const stadiums = [
    {
      id: 1,
      name: "Bernabeu Stadium",
      city: "Madrid",
      status: "open",
      capacity: 81044,
      image:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      name: "Anfield Stadium",
      city: "Liverpool",
      status: "open",
      capacity: 53394,
      image:
        "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Parc des Princes",
      city: "Paris",
      status: "maintenance",
      capacity: 47929,
      image:
        "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const listButtons = [
    { key: "matches", label: "Matches", icon: "⚽" },
    { key: "packages", label: "Packages", icon: "🎁" },
    { key: "seats", label: "Seats", icon: "🪑" },
    { key: "payments", label: "Payments", icon: "💳" },
    { key: "stadiums", label: "Stadiums", icon: "🏟️" },
  ];

  const data = {
    matches,
    packages,
    seats: sections,
    payments,
    stadiums,
  };

  const currentData = data[activeList];

  const filteredData = useMemo(() => {
    let result = [...currentData];

    if (activeList === "matches") {
      result = result.filter((match) => {
        return (
          (team === "" || match.team === team) &&
          (stadium === "" || match.stadium === stadium)
        );
      });
    }

    if (activeList === "seats") {
      result = result.filter((section) => {
        return seatType === "" || section.type === seatType;
      });
    }

    if (activeList === "payments") {
      result = result.filter((payment) => {
        return paymentMethod === "" || payment.method === paymentMethod;
      });
    }

    if (searchText.trim() !== "") {
      result = result.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.name || a.team).localeCompare(String(b.name || b.team))
      );
    }

    if (sortBy === "status") {
      result.sort((a, b) => String(a.status).localeCompare(String(b.status)));
    }

    if (sortBy === "date") {
      result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }

    if (sortBy === "price") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return result;
  }, [
    currentData,
    activeList,
    team,
    stadium,
    seatType,
    paymentMethod,
    searchText,
    sortBy,
  ]);

  const selected = sections.find((s) => s.name === selectedSection);

  const resetSearch = () => {
    setTeam("");
    setStadium("");
    setSeatType("");
    setSelectedSection("");
    setSearchText("");
    setSortBy("");
    setPaymentMethod("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        color: "white",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e3a8a 100%)",
      }}
    >
      <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
        <div
          style={{
            padding: "35px",
            borderRadius: "25px",
            background:
              "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.15))",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
            marginBottom: "25px",
          }}
        >
          <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
            🏟️ Advanced Stadium Search
          </h1>

          <p style={{ color: "#cbd5e1", fontSize: "17px" }}>
            Full-text search, filters and sorting for 5 different lists.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              marginTop: "25px",
              marginBottom: "25px",
            }}
          >
            {listButtons.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveList(item.key)}
                style={{
                  padding: "14px",
                  borderRadius: "16px",
                  border:
                    activeList === item.key
                      ? "2px solid #67e8f9"
                      : "1px solid rgba(255,255,255,0.2)",
                  background:
                    activeList === item.key
                      ? "linear-gradient(135deg, #06b6d4, #2563eb)"
                      : "rgba(255,255,255,0.08)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                <div style={{ fontSize: "24px" }}>{item.icon}</div>
                {item.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            <input
              type="text"
              placeholder="Full-text search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={inputStyle}
            />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle}>
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
              <option value="price">Price</option>
            </select>

            <button onClick={resetSearch} style={resetButtonStyle}>
              Reset
            </button>
          </div>

          {activeList === "matches" && (
            <div style={filterBoxStyle}>
              <select value={team} onChange={(e) => setTeam(e.target.value)} style={inputStyle}>
                <option value="">All Matches</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.team}>
                    {m.team}
                  </option>
                ))}
              </select>

              <select value={stadium} onChange={(e) => setStadium(e.target.value)} style={inputStyle}>
                <option value="">All Stadiums</option>
                <option value="Bernabeu">Bernabeu</option>
                <option value="Anfield">Anfield</option>
                <option value="Parc des Princes">Parc des Princes</option>
              </select>
            </div>
          )}

          {activeList === "seats" && (
            <div style={filterBoxStyle}>
              <select value={seatType} onChange={(e) => setSeatType(e.target.value)} style={inputStyle}>
                <option value="">All Seat Types</option>
                <option value="VIP">VIP</option>
                <option value="Premium">Premium</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
          )}

          {activeList === "payments" && (
            <div style={filterBoxStyle}>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={inputStyle}
              >
                <option value="">All Payment Methods</option>
                <option value="Card">Card</option>
                <option value="Online Wallet">Online Wallet</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          )}
        </div>

        <h2 style={{ marginBottom: "15px" }}>
          Results from {activeList}: {filteredData.length}
        </h2>

        {activeList === "seats" && (
          <div style={gridStyle}>
            {filteredData.map((section) => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section.name)}
                style={{
                  padding: "22px",
                  borderRadius: "22px",
                  cursor: "pointer",
                  background:
                    selectedSection === section.name
                      ? "linear-gradient(135deg, #06b6d4, #2563eb)"
                      : "rgba(255,255,255,0.08)",
                  border:
                    selectedSection === section.name
                      ? "2px solid #67e8f9"
                      : "1px solid rgba(255,255,255,0.15)",
                  boxShadow:
                    selectedSection === section.name
                      ? "0 18px 40px rgba(6,182,212,0.35)"
                      : "0 12px 30px rgba(0,0,0,0.25)",
                  transform:
                    selectedSection === section.name ? "scale(1.03)" : "scale(1)",
                  transition: "0.25s",
                }}
              >
                <div style={{ fontSize: "38px" }}>{section.icon}</div>
                <h3>{section.name}</h3>
                <p>Type: {section.type}</p>
                <p>Status: {section.status}</p>
                <p>Available seats: {section.seats}</p>
                <h2>{section.price} €</h2>
              </div>
            ))}
          </div>
        )}

        {activeList !== "seats" && (
          <div style={gridStyle}>
            {filteredData.map((item) => (
              <div key={item.id} style={cardStyle}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.team || item.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div style={{ padding: "20px" }}>
                  <h2 style={{ marginTop: 0 }}>
                    {item.icon ? `${item.icon} ` : ""}
                    {item.team || item.name}
                  </h2>

                  {Object.entries(item)
                    .filter(
                      ([key]) =>
                        key !== "id" &&
                        key !== "image" &&
                        key !== "team" &&
                        key !== "name" &&
                        key !== "icon"
                    )
                    .map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong> {value}
                      </p>
                    ))}

                  {activeList === "payments" && (
                    <button
                      style={{
                        width: "100%",
                        marginTop: "15px",
                        padding: "13px",
                        borderRadius: "14px",
                        border: "none",
                        background: "#06b6d4",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Choose {item.name}
                    </button>
                  )}

                  {activeList === "packages" && (
                    <button
                      style={{
                        width: "100%",
                        marginTop: "15px",
                        padding: "13px",
                        borderRadius: "14px",
                        border: "none",
                        background: "#22c55e",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Select Package
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && activeList === "seats" && (
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              borderRadius: "18px",
              background: "rgba(6,182,212,0.18)",
            }}
          >
            <strong>Selected Seat Section</strong>
            <p>🪑 {selected.name}</p>
            <p>🎟️ {selected.type}</p>
            <p>✅ {selected.seats} seats available</p>
            <p>💰 {selected.price} €</p>
          </div>
        )}

        {filteredData.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "35px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "18px",
            }}
          >
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#020617",
  color: "white",
  fontSize: "15px",
};

const resetButtonStyle = {
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

const filterBoxStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginTop: "15px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "22px",
};

const cardStyle = {
  borderRadius: "24px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.09)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.15)",
};

export default AdvancedSearch;