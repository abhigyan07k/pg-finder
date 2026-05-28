import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import "../styles/ListingsHeader.css";

function ListingsHeader({
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  selectedBhk,
  setSelectedBhk,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  cityOptions = [],
  bhkOptions = [],
  onReset,
}) {
  return (
    <section className="listings-header">
      <div className="listings-header-content">
        <div className="listings-heading">
          <h1>Find Your Perfect Property</h1>
          <p>Search homes, flats, PGs and rooms near you</p>
        </div>

        <div className="search-filter-card">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-grid">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="FLAT">Flat</option>
              <option value="PG">PG</option>
              <option value="ROOM">Room</option>
            </select>

            <select
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
            >
              <option value="">All BHK</option>
              {bhkOptions.map((bhk) => (
                <option key={bhk} value={bhk}>
                  {bhk}
                </option>
              ))}
            </select>

            <div className="price-filter">
              <label>
                Budget: ₹{minPrice} - ₹{maxPrice}
              </label>

              <div className="price-inputs">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  min="0"
                />

                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button className="filter-label-btn" type="button">
              <FiSliders />
              Filters Applied
            </button>

            <button
              className="reset-filter-btn"
              type="button"
              onClick={onReset}
            >
              <FiX />
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ListingsHeader;
