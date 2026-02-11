import { useState } from "react";

const RemarksModal = ({ open, onClose, onSubmit }) => {
  const [text, setText] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-[360px]">
        <h3 className="font-medium mb-2">Offsite Work Reason</h3>

        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          placeholder="Why are you working offsite today?"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="border px-3 py-1 text-sm">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(text)}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};


export default RemarksModal