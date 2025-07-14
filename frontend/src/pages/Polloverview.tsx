import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavLink } from "react-router";

const Polloverview = () => {
  return (
    <div className="max-w-5xl mx-auto mt-8 p-6">
      <div className="flex flex-wrap gap-6">
        <NavLink to="/textpoll">
          <Card className="flex-1 min-w-[300px]">
            <CardHeader>
              <CardTitle className="text-2xl">Textpoll</CardTitle>
              <CardDescription className="text-lg">
                Description for Poll 1
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">Content for Poll 1</CardContent>
          </Card>
        </NavLink>

        <NavLink to="/imagepoll">
          <Card className="flex-1 min-w-[300px]">
            <CardHeader>
              <CardTitle className="text-2xl">Imagepoll</CardTitle>
              <CardDescription className="text-lg">
                Description for Poll 2
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">Content for Poll 2</CardContent>
          </Card>
        </NavLink>

        <NavLink to="/datepoll">
          <Card className="flex-1 min-w-[300px]">
            <CardHeader>
              <CardTitle className="text-2xl">Datepoll</CardTitle>
              <CardDescription className="text-lg">
                Description for Poll 3
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">Content for Poll 3</CardContent>
          </Card>
        </NavLink>
      </div>
    </div>
  );
};

export default Polloverview;
