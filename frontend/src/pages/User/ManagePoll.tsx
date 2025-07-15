import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_URL } from "@/lib/config";

interface Poll {
  id: string;
  question: string;
  createdAt: string;
}

const MyPolls = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [tokenLinks, setTokenLinks] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const fingerprint = localStorage.getItem("fingerprint");
        const res = await fetch(`${API_URL}/api/poll/mine`, {
          headers: { "x-fingerprint": fingerprint || "" },
        });
        const data = await res.json();
        setPolls(data.polls || []);
      } catch (err) {
        setError("Fehler beim Laden deiner Umfragen.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []); // Dependency-Array hinzugefügt, um die Funktion nur einmal auszuführen.

  const handleGenerateVoteLink = async (pollId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/poll/${pollId}/generate-token`, {
        method: "POST",
      });
      const data = await res.json();

      // Update the tokenLinks state and store the token in the database
      const link = `${window.location.origin}/poll/securevote/${data.token}`;
      setTokenLinks((prev) => ({ ...prev, [pollId]: link }));

      // Save the token in the database
      await fetch(`${API_URL}/api/poll/${pollId}/add-token`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: {
            token: data.token,
            used: false,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      await navigator.clipboard.writeText(link);
      alert("Vote link copied!");
    } catch (err) {
      alert("Failed to generate the vote link.");
    }
  };

  const handleDelete = async (pollId: string) => {
    const confirm = window.confirm("Do you really want to delete this poll?");
    if (!confirm) return;
    try {
      const fingerprint = localStorage.getItem("fingerprint");
      await fetch(`${API_URL}/api/poll/delete/${pollId}`, {
        method: "DELETE",
        headers: { "x-fingerprint": fingerprint || "" },
      });
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
    } catch {
      alert("Failed to delete the poll.");
    }
  };

  if (loading) return <p className="text-center">Loading your polls...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Quickpolls</CardTitle>
          <CardDescription>Manage your polls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {polls.length === 0 ? (
            <p>No polls found.</p>
          ) : (
            polls.map((poll) => (
              <div
                key={poll.id}
                className="border p-4 rounded flex justify-between items-start gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{poll.question}</h3>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(poll.createdAt).toLocaleString()}
                  </p>

                  {tokenLinks[poll.id] && (
                    <div className="mt-2 text-sm text-blue-600">
                      <a
                        href={tokenLinks[poll.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Vote (One-Time Link)
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => navigate(`/quickpoll/result/${poll.id}`)}
                  >
                    Results
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => navigate(`/quickpoll/edit/${poll.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => handleGenerateVoteLink(poll.id)}
                  >
                    Generate Vote Link
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => handleDelete(poll.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPolls;
