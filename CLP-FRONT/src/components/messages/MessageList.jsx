import React, { useEffect, useState } from "react";
import apiService from "../../Services/api.service";
import { Link } from "react-router-dom";

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await apiService.get("/message/common");
      setMessages(res.data.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const disableMessage = async (id) => {
    if (!window.confirm("Are you sure you want to disable this message?")) return;

    try {
      await apiService.get(`/message/disableMessage/${id}`);
      fetchMessages();
    } catch (err) {
      console.error("Failed to disable message:", err);
      alert("Failed to disable message.");
    }
  };

  const renderFilePreview = (filePath) => {
    if (!filePath) return null;
    const lowerPath = filePath.toLowerCase();

    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(lowerPath)) {
      return (
        <img
          src={filePath}
          alt="Attachment"
          className="w-20 h-20 object-cover rounded shadow"
        />
      );
    } else if (/\.pdf$/i.test(lowerPath)) {
      return (
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          View PDF
        </a>
      );
    } else {
      return (
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Download File
        </a>
      );
    }
  };

  if (loading) return <p className="p-6">Loading messages...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-bold">Message List</h4>
        <Link
          to="/message-create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Create New Message
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Sr. No.</th>
              <th className="p-2 border">Message Description</th>
              {/* <th className="p-2 border">Attachment</th>
              <th className="p-2 border">Created At</th> */}
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map((message, i) => (
                <tr key={message._id}>
                  <td className="border p-2">{i + 1}</td>
                  <td
                    className="border p-2 break-words text-left"
                    dangerouslySetInnerHTML={{
                      __html: message.message_description,
                    }}
                  />
                  {/* <td className="border p-2">
                    {renderFilePreview(message.attachment)}
                  </td>
                  <td className="border p-2">
                    {message.created_at
                      ? new Date(message.created_at).toLocaleString()
                      : "—"}
                  </td> */}
                  <td className="border p-2">
                    {message.disable ? (
                      <span className="bg-red-500 text-white px-2 py-1 rounded">
                        Disabled
                      </span>
                    ) : (
                      <span className="bg-green-500 text-white px-2 py-1 rounded">
                        Enabled
                      </span>
                    )}
                  </td>
                  <td className="border p-2">
                    {message.alert_message
                      ? "Home Page Notice"
                      : "Batch Announcement"}
                  </td>
                  <td className="border p-2">
                    {!message.disable && (
                      <button
                        onClick={() => disableMessage(message._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessageList;
