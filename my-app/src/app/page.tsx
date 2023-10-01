"use client";
import Image from "next/image";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [code, setCode] = useState<string>("");
  const { push } = useRouter();

  const handleRoom = () => {
    const fourDigit = Math.floor((Math.random() * 4)*10000);
    window.location.replace(`/room?roomID=${fourDigit}`);
  };

  return (
    <div className="bg-gray-100 h-screen">
      <nav className="navbar bg-white flex justify-between p-4 items-center">
        <div
          className="flex cursor-pointer"
          onClick={(e) => {
            push("/");
          }}
        >
          <Image alt="logo" width={40} height={40} src="/logo.png" />
          <h1 className="text-3xl ml-2 font-semibold">Echo</h1>
        </div>
        <button
          className="bg-purple-700 font-semibold rounded-lg p-3 text-white hover:bg-purple-600 transition-colors"
          onClick={handleRoom}
        >
          Start a meeting
        </button>
      </nav>
      <main>
        <div className="hero p-6">
          <div className="flex justify-between p-4">
            <div className="flex flex-col gap-9">
              <p className="text-7xl font-semibold text-gray-800 py-12">
                Connect Beyond Borders: Your World, One Click Away
              </p>
              <div className="flex gap-6 items-center">
                <button
                  className="bg-purple-700 rounded-lg p-3 text-white hover:bg-purple-600 transition-colors"
                  onClick={handleRoom}
                >
                  Create instant meeting
                </button>
                <input
                  className="rounded-xl p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="text"
                  name="code"
                  id="code"
                  placeholder="Enter a code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  className="bg-purple-700 rounded-lg p-3 text-white hover:bg-purple-600 transition-colors flex items-center"
                  onClick={(e) => push(`/lobby?roomID=${code}`)}
                >
                  <LoginOutlinedIcon className="mr-2" />
                  Join
                </button>
              </div>
            </div>
            <Image
              className="floating"
              alt=""
              width={500}
              height={500}
              src="/vector.png"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
