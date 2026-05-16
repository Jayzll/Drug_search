import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  // Load the specific CSV file
  useEffect(() => {
    Papa.parse("/BIOL11822_Drugs_List.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setIsSearched(false);
      return;
    }

    const filtered = data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(query.toLowerCase())
      )
    );

    setResults(filtered);
    setIsSearched(true);
  };

  return (
    <div className={`app-wrapper ${isSearched ? 'results-layout' : 'home-layout'}`}>
      <div className="search-section">
        <div className="logo-container" onClick={() => {setIsSearched(false); setQuery("");}}>
          <div className="logo">DrugSearch</div>
          <div className="subtitle">BIOL10822/BIOL11822</div>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-wrapper">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by drug name, class, or condition..."
            />
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      {isSearched && (
        <main className="results-container">
          <p className="results-count">Found {results.length} matches in the pharmacology database</p>
          
          {results.length > 0 ? (
            results.map((item, index) => (
              <div key={index} className="result-card">
                <div className="card-header">
                  <span className="week-badge">Week {item.Week}</span>
                  <span className="class-label">{item.Class}</span>
                </div>

                <div className="drug-title">
                  {item.Drug} 
                  <span className="treats-text"> treats {item.Treat}</span>
                </div>

                <div className="content-grid">
                  <div className="info-block">
                    <strong>Target / Mechanism:</strong>
                    <p>{item.Target || "N/A"}</p>
                  </div>

                  <div className="info-block">
                    <strong>Common Side Effects:</strong>
                    <p className="side-effects">{item["Common Side effects"]}</p>
                  </div>

                  {item["Rare Side Effects"] && (
                    <div className="info-block rare">
                      <strong>Rare / Serious Side Effects:</strong>
                      <p>{item["Rare Side Effects"]}</p>
                    </div>
                  )}

                  {item["More info"] && (
                    <div className="info-block note">
                      <strong>Clinical Notes:</strong>
                      <p>{item["More info"]}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No results found for "{query}"</h3>
              <p>Try searching for a drug class (e.g., "ACE inhibitors") or a week number.</p>
            </div>
          )}
        </main>
      )}
      <footer className="app-footer">
        <p>
          If there are any mistakes or problems, please{" "}
          <a href="mailto:jupiter.mo@student.manchester.ac.uk?subject=DrugSearch%20Feedback">
            email me
          </a>.
        </p>
      </footer>
    </div>
  );
}

export default App;