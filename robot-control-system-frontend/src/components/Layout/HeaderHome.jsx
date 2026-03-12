import React from "react";

function HeaderHome({ onLoginClick }) {
  return (
    <header className="w-full flex justify-between items-center px-10 py-5 bg-white">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold text-black">
        Robot Arm Control
      </h1>

      {/* Login button */}
      <button
        onClick={onLoginClick}
        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        Login
      </button>

    </header>
  );
}

export default HeaderHome;