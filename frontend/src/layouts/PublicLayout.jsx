import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/PublicLayout.css";

function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main">{children}</main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
