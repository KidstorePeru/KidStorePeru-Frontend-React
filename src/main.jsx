import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Apply the saved theme before React renders, so a light-theme user never sees a dark flash.
try {
  const saved = localStorage.getItem("kidstore-theme");
  document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
} catch {
  document.documentElement.setAttribute("data-theme", "light");
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
);
