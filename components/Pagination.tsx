type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const getVisiblePages = (
  current: number,
  total: number
): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (total <= 6) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-8 h-fit">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-red-600 text-white hover:shadow-md hover:-translate-y-0.5 transition rounded disabled:opacity-50 cursor-pointer"
      >
        Prev
      </button>
      {getVisiblePages(currentPage, totalPages).map((item, index) => {
        if (item === "...") {
          return (
            <svg
              key={item}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-gray-500"
            >
              <circle cx="12" cy="18" r="1.5" />
              <circle cx="19" cy="18" r="1.5" />
              <circle cx="5" cy="18" r="1.5" />
            </svg>
          );
        }

        return (
          <button
            key={item}
            onClick={() => onPageChange(Number(item))}
            className={`px-3 py-1 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition rounded ${
              item === currentPage
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {item}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
