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
      <Card className="flex-1 min-w-[300px] h-90 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]">
        <CardHeader className="flex flex-col items-center text-center">
          <img
            src="/icon/icon_black-text.svg"
            alt="Text Poll Icon"
            className="w-30 h-30 mb-0 dark:invert"
          />
          <CardTitle className="text-2xl">Textpoll</CardTitle>
          <CardDescription className="text-lg">
            Let participants choose between written answer options — perfect for quick opinions or preferences.
          </CardDescription>
        </CardHeader>
      </Card>
    </NavLink>

    <NavLink to="/imagepoll">
      <Card className="flex-1 min-w-[300px] h-90 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]">
        <CardHeader className="flex flex-col items-center text-center">
          <img
            src="/icon/icon_black-img.svg"
            alt="Image Poll Icon"
            className="w-30 h-30 mb-0 dark:invert"
          />
          <CardTitle className="text-2xl">Imagepoll</CardTitle>
          <CardDescription className="text-lg">
            Let participants vote by selecting from images — ideal for visual choices like designs or products.
          </CardDescription>
        </CardHeader>
      </Card>
    </NavLink>

    <NavLink to="/datepoll">
      <Card className="flex-1 min-w-[300px] h-90 cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 active:scale-[0.98]">
        <CardHeader className="flex flex-col items-center text-center">
          <img
            src="/icon/icon_black-cal.svg"
            alt="Date Poll Icon"
            className="w-30 h-30 mb-0 dark:invert"
          />
          <CardTitle className="text-2xl">Datepoll</CardTitle>
          <CardDescription className="text-lg">
            Schedule meetings or events by letting participants choose the date that works best for them.
          </CardDescription>
        </CardHeader>
      </Card>
    </NavLink>
  </div>
</div>
  );
};

export default Polloverview;
