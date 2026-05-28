function PropertyCardSkeleton({ count = 6 }) {
  const skeletons = Array.from({ length: count });

  return (
    <div style={styles.grid}>
      {skeletons.map((_, index) => (
        <div key={index} style={styles.card}>
          <div style={styles.image}></div>

          <div style={styles.cardBody}>
            <div style={{ ...styles.line, width: "70%", height: "20px" }}></div>
            <div style={{ ...styles.line, width: "45%" }}></div>
            <div style={{ ...styles.line, width: "55%" }}></div>
            <div style={{ ...styles.line, width: "40%" }}></div>
            <div style={{ ...styles.line, width: "35%" }}></div>

            <div style={styles.buttonRow}>
              <div style={styles.button}></div>
              <div style={styles.button}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  },

  image: {
    width: "100%",
    height: "200px",
    background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },

  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  line: {
    height: "14px",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },

  button: {
    flex: 1,
    height: "38px",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
};

export default PropertyCardSkeleton;
