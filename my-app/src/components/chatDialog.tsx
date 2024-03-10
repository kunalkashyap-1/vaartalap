interface Props {
  name: string;
  text?: string;
  original: string;
}

const ChatDialog: React.FC<Props> = ({ name, text, original }) => {
  return (
    <div className="flex flex-col w-full">
      <h3 className="text-sm font-semibold mb-1">{name}</h3>
      {text && (
        <div className="mb-1">
          <span className="text-xs text-black-500 truncate">{text}</span>
        </div>
      )}
      <div className="flex items-center">
      <div className={`h-1 rounded-xl ${text?"bg-gray-300":"bg-gray-800"} w-6`}></div>
        <span className={`mr-1 text-xs ${text?"text-gray-400":"text-black-400"}`}>{original}</span>
      </div>
    </div>
  );
};

export default ChatDialog;
