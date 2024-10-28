import Main from "./Main";
import Login from "./Login";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  console.log("THIS IS MyAPP.JSX +++++++ WELCOME!! ++++")

  return (
    <div>
      <div><h1>Main page. This will be the first page</h1></div>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/main" element={<Main />} />
          </Routes>
        </Router >
      </div>
    </div>
  );
}
