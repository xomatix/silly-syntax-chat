import { useEffect, useState } from "react";
import "./App.css";
import ChatRoomsList from "./ChatRoomsList";
import Login from "./login/Login";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(checkIfLoggedIn());
  }, []);

  const checkIfLoggedIn = () => {
    let user_id = Number(localStorage.getItem("bonanza_user_id"));
    let token = localStorage.getItem("bonanza_token");
    if (user_id == null || user_id <= 0 || token == null || token.length <= 0)
      return false;
    return true;
  };

  return (
    <>
      {!loggedIn && <Login></Login>}
      {loggedIn && (
        <div className="w-full h-full">
          <ChatRoomsList />
        </div>
      )}
    </>
  );
}

export default App;
