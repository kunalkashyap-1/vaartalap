import dynamic from "next/dynamic";

const RoomClient = dynamic(() => import("@/components/room"), {
  ssr: false,
});

export default function RoomPage() {
  return <RoomClient />;
}
