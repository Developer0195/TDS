import React, { useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import { LuPaperclip, LuUpload } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";

const AddAttachmentsInput = ({ disabled, attachments = [], setAttachments }) => {
  const [option, setOption] = useState("");
  const [uploading, setUploading] = useState(false);

  /* -------------------- ADD TEXT / LINK -------------------- */

  const handleAddOption = () => {
    if (!option.trim()) return;

    setAttachments([
      ...attachments,
      {
        url: option.trim(),
        name: "Manual link",
      },
    ]);

    setOption("");
  };

  /* -------------------- FILE UPLOAD -------------------- */

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        "/api/upload/attachment",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setAttachments([
        ...attachments,
        {
          url: response.data.url,
          name: response.data.name,
        },
      ]);
    } catch (error) {
      console.error("Attachment upload failed", error);
      alert("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* -------------------- DELETE -------------------- */

  const handleDeleteOption = (index) => {
    const updatedArr = attachments.filter((_, idx) => idx !== index);
    setAttachments(updatedArr);
  };

  /* -------------------- UI -------------------- */

  return (
    <div>
      {/* ATTACHMENT LIST */}
      {attachments.map((item, index) => (
        <div
          key={index}
          className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <div className="flex-1 flex items-center gap-3 border border-gray-100">
            <LuPaperclip className="text-gray-400" />

            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 underline break-all"
            >
              {item.name || item.url}
            </a>
          </div>

          {
            !disabled &&
            <button
              className="cursor-pointer"
              onClick={() => handleDeleteOption(index)}
            >
              <HiOutlineTrash className="text-lg text-red-500" />
            </button>
          }
        </div>
      ))}

      {/* ADD LINK + FILE */}
      {
        !disabled &&
        <>
          <div className="flex items-center gap-5 mt-4">
            {/* TEXT INPUT */}
            <div className="flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3">
              <LuPaperclip className="text-gray-400" />
              <input
                type="text"
                placeholder="Add file link"
                value={option}
                onChange={({ target }) => setOption(target.value)}
                className="w-full text-[13px] text-black outline-none bg-white py-2"
              />
            </div>

            <button className="card-btn text-nowrap" onClick={handleAddOption}>
              <HiMiniPlus className="text-lg" /> Add
            </button>
          </div>

          {/* FILE UPLOAD BUTTON */}
          <div className="mt-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer text-indigo-600">
              <LuUpload />
              {uploading ? "Uploading..." : "Upload file"}
              <input
                type="file"
                hidden
                accept="image/*,.pdf,.doc,.docx,.xlsx"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        </>
      }
    </div>
  );
};

export default AddAttachmentsInput;
