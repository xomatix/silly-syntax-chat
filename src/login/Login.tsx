import React, { useState } from "react";
import { AuthController } from "../controllers/AuthController";
import { LoginModel } from "../controllers/Types";
import { ViewsController } from "../controllers/ViewsController";

function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    let m = {} as LoginModel;
    m.login = login;
    m.password = password;

    await AuthController.Login(m);
    var resp = await ViewsController.GetView({ viewName: "user_info" });

    if (resp.data.length > 0) {
      localStorage.setItem(
        "bonanza_user_id",
        resp.data[0]["user_id"].toString()
      );
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-1/4 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 text-center">
          Login
        </h2>
        {/* Login input */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@example.com"
            required
          />
        </div>
        {/* Password input */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
          />
        </div>
        {/* Submit button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Login;
