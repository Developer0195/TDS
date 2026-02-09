import { useState } from "react";
import { LuX } from "react-icons/lu";

const LocationPopover = ({ location }) => {
  const [open, setOpen] = useState(false);

  if (!location) return "—";

  const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs"
      >
        📍 View
      </button>

      {open && (
        <div className="absolute z-20 bg-white border border-gray-300 shadow-lg rounded p-3 text-xs w-56 mt-2">
          {/* CLOSE ICON */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          >
            <LuX size={14} />
          </button>

          <p className="mt-3">
            <span className="text-gray-500">Lat:</span>{" "}
            {location.latitude}
          </p>
          <p>
            <span className="text-gray-500">Lng:</span>{" "}
            {location.longitude}
          </p>

          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline block mt-2"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationPopover;
