interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onEnter,
}: SearchBarProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
      }}
      placeholder="Search videos..."
      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  );
}
