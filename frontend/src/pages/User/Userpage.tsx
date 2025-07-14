import { useEffect } from "react";
import { useParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import useUserStore from "@/hooks/userstore";

const Userpage = () => {
  const { id } = useParams();
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:3001/user/${id}`);
  //       const data = await response.json();
  //       setCurrentUser(data);
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //     }
  //   };

  //   if (id) {
  //     fetchUser();
  //   }
  // }, [id, setCurrentUser]);

  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        {currentUser ? (
          <div>
            <h2 className="text-lg font-bold">
              Welcome, {currentUser.username}
            </h2>
            <p>User ID: {currentUser.id}</p>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Userpage;
