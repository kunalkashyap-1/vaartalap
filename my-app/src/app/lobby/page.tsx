import dynamic from "next/dynamic";

const LobbyClient = dynamic(() => import("@/components/lobby"), { ssr: false });

export default function Lobby() {
  return <LobbyClient />;
}
