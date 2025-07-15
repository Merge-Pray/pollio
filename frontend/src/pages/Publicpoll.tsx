import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface Poll {
  id: string;
  question: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPolls: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  message: string;
  polls: Poll[];
  pagination: PaginationInfo;
}

const Publicpoll = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalPolls: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPolls = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/poll/quick?page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch polls");
      }

      const data: ApiResponse = await response.json();
      setPolls(data.polls);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch polls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPolls(page);
    }
  };

  const handlePollClick = (pollId: string) => {
    navigate(`/quickpoll/vote/${pollId}`);
  };

  const renderPaginationLinks = () => {
    const { currentPage, totalPages } = pagination;
    const links = [];

    links.push(
      <PaginationItem key={1}>
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (currentPage > 3) {
      links.push(
        <div key="ellipsis-start" className="items-center md:flex hidden">
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </div>
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      links.push(
        <div key={i} className="items-center md:flex hidden">
          <PaginationItem>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        </div>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      links.push(
        <div key="ellipsis-end" className="items-center md:flex hidden">
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </div>
      );
    }

    if (totalPages > 1) {
      links.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return links;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Public Polls</h1>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading polls...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Public Polls</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Public Polls</h1>

      {polls.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No public polls available.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-8">
            {polls.map((poll) => (
              <Card
                key={poll.id}
                className="p-4 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]"
                onClick={() => handlePollClick(poll.id)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-2">
                    {poll.question}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 transition-colors duration-200">
                  Click to vote
                </p>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className={
                      !pagination.hasPrev
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {renderPaginationLinks()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className={
                      !pagination.hasNext
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {polls.length} of {pagination.totalPolls} polls
          </div>
        </>
      )}
    </div>
  );
};

export default Publicpoll;
