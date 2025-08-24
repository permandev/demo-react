import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import FormBuilder from "./pages/FormBuilder";
import FormRenderer from "./pages/FormRender";
import Test from "./pages/Test";

export default function App() {
  return (
    <Router>
      <div>
        {/* Header */}
        <header
          style={{
            background: "#282c34",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ color: "white", margin: 0 }}>My App</h2>
          <nav>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                gap: "1rem",
                margin: 0,
                padding: 0,
              }}
            >
              <li><Link style={linkStyle} to="/">Home</Link></li>
              <li><Link style={linkStyle} to="/builder">Form Builder</Link></li>
              <li><Link style={linkStyle} to="/render">Form Render</Link></li>
              {/* <li><Link style={linkStyle} to="/test">Test</Link></li> */}
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main style={{ padding: "1rem" }}>
          <Routes>
            <Route path="/builder" element={<FormBuilder />} />
            <Route path="/render" element={<FormRenderer />} />
            <Route path="/test" element={<Test />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the Form Builder and Renderer application!</p>
    </div>
  );
}

// 🔹 Reuse link style
const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold"
};
