import React from "react";

const UserAnalyticsModal = ({ user, onClose }) => {
    if (!user) return null;

    const analytics = user.analytics || {};

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[95%] max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">
                    {user.name} — Analytics
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Info label="Email" value={user.email} />
                    <Info label="Role" value={user.role} />
                    <Info label="Phone" value={user.phone || "—"} />
                    <Info label="Skills" value={user.skills?.join(", ") || "—"} />
                </div>

                <hr className="my-4" />

                <div className="grid grid-cols-3 gap-4">
                    <Stat title="Tasks Completed" value={analytics.tasksCompleted} />
                    <Stat title="On-time %" value={`${analytics.onTimePercentage || 0}%`} />
                    <Stat title="Avg Delay (mins)" value={analytics.avgDelayMinutes} />
                    <Stat title="Weekly Hours" value={analytics?.avgWorkingHours?.weekly} />
                    <Stat title="Monthly Hours" value={analytics?.avgWorkingHours?.monthly} />
                    <Stat title="Yearly Hours" value={analytics?.avgWorkingHours?.yearly} />
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 text-sm text-gray-600 hover:underline"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

const Stat = ({ title, value }) => (
    <div className="bg-gray-50 p-3 rounded text-center">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-semibold">{value ?? 0}</p>
    </div>
);

export default UserAnalyticsModal;
