import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // FIXED: HOOK 1 - Restored the essential CSV file loader
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

  // FIXED: HOOK 2 - Isolated the suggestion engine into its own separate hook
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const matches = [];

    data.forEach(item => {
      // Uses .startsWith() so searching "v" only shows words starting with "v"
      if (item.Drug && item.Drug.toLowerCase().trim().startsWith(searchTerm)) {
        matches.push(item.Drug);
      }
      if (item.Class && item.Class.toLowerCase().trim().startsWith(searchTerm)) {
        matches.push(item.Class);
      }
    });

    const uniqueMatches = [...new Set(matches)].slice(0, 6);
    setSuggestions(uniqueMatches);
  }, [query, data]);

  // Shared search function used by both form submission and selection clicks
  const executeSearch = (searchTerm) => {
    const filtered = data.filter(item => {
      const matchesFields = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm)
      );
      const fullWeekString = `week ${item.Week}`.toLowerCase();
      const matchesWeekText = fullWeekString.includes(searchTerm);
      return matchesFields || matchesWeekText;
    });

    setResults(filtered);
    setIsSearched(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setIsSearched(false);
      return;
    }
    setShowSuggestions(false);
    executeSearch(query.toLowerCase().trim());
  };

  const handleSuggestionClick = (pickedValue) => {
    setQuery(pickedValue);
    setShowSuggestions(false);
    executeSearch(pickedValue.toLowerCase().trim());
  };

  return (
    <div className={`app-wrapper ${isSearched ? 'results-layout' : 'home-layout'}`}>
      <div className="search-section">
        <div className="logo-container" onClick={() => {setIsSearched(false); setQuery("");}}>
          <div className="logo">DrugSearch</div>
          <div className="subtitle">Only BIOL10822/BIOL11822 drugs are searchable</div>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-wrapper">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search by week, drug name, class, or condition..."
            />
            <button type="submit">Search</button>
          </div>

          {/* FIXED: Clean text-only suggestion rows layout (No "search" text artifact) */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((item, index) => (
                <li key={index} onClick={() => handleSuggestionClick(item)}>
                  {item}
                </li>
              ))}
            </ul>
          )}

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
        <p className='last-updated'>Last updated: 17/5/2026</p>
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