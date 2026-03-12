import React, { useState } from "react";
import HeaderHome from "../../components/Layout/HeaderHome";
import LoginModal from "../../components/login/LoginModal";
import robot from "../../assets/robot-banner.jpg";   

function HomePage() {

  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>

      <HeaderHome onLoginClick={() => setShowLogin(true)} />

      {/* Banner */}
      <section className="w-full h-[500px] bg-white flex items-center px-20">

        <div className="flex w-full items-center">

          {/* Text left */}
          <div className="w-1/2">

            <h1 className="text-5xl font-bold text-black mb-6">
              Robot Arm Control Platform
            </h1>

            <p className="text-gray-600 mb-6">
              Monitor and control industrial robot arms from a single dashboard.
            </p>

        

          </div>

          {/* Image right */}
          <div className="w-1/2 flex justify-center" >

            <img
              src={robot}
              className="w-[500px]"
              style={{ marginBottom: '35px', height: '486px' }}
            />

          </div>

        </div>

      </section>

      {/* Black section */}
      <section className="bg-black text-white py-20 text-center">

        <h2 className="text-3xl font-bold mb-4">
          Industrial Robot Monitoring
        </h2>

        <p className="text-gray-300">
          Manage factories, hubs and robotic devices from a centralized system.
        </p>

      </section>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />

    </div>
  );
}

export default HomePage;