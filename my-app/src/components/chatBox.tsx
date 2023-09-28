import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendIcon from "@mui/icons-material/Send";

export default function ChatBox() {

  return (
    <div className="chat_box flex flex-col justify-between p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl">In call messages</h1>
        <button className="" onClick={() => {}}>
          <CloseOutlinedIcon />
        </button>
      </div>
      <div className="messages flex">
        <input
          type="text"
          name="message"
          id=""
          className="rounded-xl p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="bg-blue-60 h-max p-2">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
