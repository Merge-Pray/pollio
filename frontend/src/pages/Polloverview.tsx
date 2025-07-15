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
      <div className="flex flex-wrap justify-center gap-6">
        <NavLink to="/textpoll">
          <Card className="flex-1 min-w-[300px] h-32 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]">
            <CardHeader>
              <CardTitle className="text-2xl">Textpoll</CardTitle>
              <CardDescription className="text-lg">
                Choose between text options
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/imagepoll">
          <Card className="flex-1 min-w-[300px] h-32 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]">
            <CardHeader>
              <CardTitle className="text-2xl">Imagepoll</CardTitle>
              <CardDescription className="text-lg">
                Choose between images
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/datepoll">
          <Card className="flex-1 min-w-[300px] h-32 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]">
            <CardHeader>
              <CardTitle className="text-2xl">Datepoll</CardTitle>
              <CardDescription className="text-lg">
                Choose between dates
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>
      </div>
    </div>
  );
};

export default Polloverview;
