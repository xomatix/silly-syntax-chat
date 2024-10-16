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

    if (user_id == null || user_id <= 0) return false;
    return true;
  };

  return (
    <>
      {!loggedIn && <Login></Login>}
      {loggedIn && (
        <div className="w-[100vw] h-[100vh]">
          <ChatRoomsList />
        </div>
      )}
    </>
  );
}

export default App;
