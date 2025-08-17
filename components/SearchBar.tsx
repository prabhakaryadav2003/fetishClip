type Props = {
  value: string;
  onChange: (val: string) => void;
};

const SearchBar = ({ value, onChange }: Props) => {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search videos..."
        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
      />
    </div>
  );
};

export default SearchBar;
