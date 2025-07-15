import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import useUserStore from "@/hooks/userstore";

interface Poll {
  id: string;
  title: string;
  question: string;
  type: string;
  createdAt: string;
  expirationDate?: string;
  expired: boolean;
  multipleChoice: boolean;
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

const Userpage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
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

  const fetchUserPolls = async (page: number = 1) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/user/${id}/polls?page=${page}&limit=10`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You need to be logged in to view this page");
        }
        throw new Error("Failed to fetch user polls");
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
    if (id) {
      fetchUserPolls(1);
    }
  }, [id]); // Remove currentUser dependency

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchUserPolls(page);
    }
  };

  const handlePollClick = (pollId: string) => {
    navigate(`/user/polls/${pollId}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "image":
        return "bg-green-100 text-green-800";
      case "date":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝";
      case "image":
        return "🖼️";
      case "date":
        return "📅";
      default:
        return "📊";
    }
  };

  const renderPaginationLinks = () => {
    const { currentPage, totalPages } = pagination;
    const links: React.ReactNode[] = [];

    if (totalPages === 0) return links;

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Polls</h1>
          <p className="text-gray-600">
            {currentUser ? `Welcome, ${currentUser.username}` : "Loading..."}
          </p>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading your polls...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Polls</h1>
          <p className="text-gray-600">
            {currentUser ? `Welcome, ${currentUser.username}` : ""}
          </p>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Polls</h1>
        <p className="text-gray-600">
          {currentUser ? `Welcome, ${currentUser.username}` : ""}
        </p>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't created any polls yet. Start by creating your first
                poll!
              </p>
              <button
                onClick={() => navigate("/polloverview")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Poll
              </button>
            </CardContent>
          </Card>
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
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          poll.type
                        )}`}
                      >
                        {getTypeIcon(poll.type)}{" "}
                        {poll.type.charAt(0).toUpperCase() + poll.type.slice(1)}
                      </span>
                      {poll.multipleChoice && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Multiple Choice
                        </span>
                      )}
                      {poll.expired && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </div>
                    {poll.title && (
                      <h3 className="text-lg font-semibold mb-1">
                        {poll.title}
                      </h3>
                    )}
                    <p className="text-gray-700 mb-2">{poll.question}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Created: {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                      {poll.expirationDate && (
                        <span>
                          Expires:{" "}
                          {new Date(poll.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-600 font-medium transition-colors duration-200">
                  Click to manage poll →
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

export default Userpage;
