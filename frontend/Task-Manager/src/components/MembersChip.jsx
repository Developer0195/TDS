const MembersChip = ({ members = [] }) => {
  const visible = members.slice(0, 2);
  const remaining = members.length - visible.length;

  if (members.length === 0) {
    return <span className="text-xs text-gray-400">No members</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {visible.map((m) => (
        <div
          key={m._id}
          className="w-auto h-7 rounded-lg px-2 bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700"
          title={m.name}
        >
          {m.profileImageUrl ? (
            <img
              src={m.profileImageUrl}
              alt={m.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            m.name
          )}
        </div>
      ))}

      {remaining > 0 && (
        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default MembersChip;