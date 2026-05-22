import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  HomeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { useHistory } from "../context/HistoryContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const {
    history,
    setHistory,
    setSelected,
    selected,
  } = useHistory();

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`);

      setHistory((prev) =>
        prev.filter((item) => item._id !== id)
      );

      // Close full view if deleted item was open
      if (selected?._id === id) {
        setSelected(null);
      }

      toast.success("History deleted");
    } catch (error) {
      toast.error("Failed to delete history");
    }
  };

  return (
    <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">

      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link
          to="/"
          onClick={() => setSelected(null)}
          className="text-xl font-bold text-primary-600 hover:opacity-80"
        >
          MailCraft AI
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-4 py-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          <HomeIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
      </nav>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="text-xs text-gray-400 px-2 mb-2">
          History
        </p>

        <div className="space-y-1">
          {history.map((item) => (
            <div
              key={item._id}
              className="group flex items-center justify-between hover:bg-gray-100 rounded-md"
            >
              <button
                onClick={() => setSelected(item)}
                className="flex-1 text-left px-3 py-2 text-sm text-gray-700 truncate"
              >
                {item.prompt}
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(item._id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-center text-gray-500">
        Built with React & MERN
      </div>
    </div>
  );
};

export default Sidebar;