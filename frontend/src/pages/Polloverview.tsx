import { Card, CardContent } from "@/components/ui/card";

const Polloverview = () => {
  return (
    <Card className="border-2 border-dashed border-gray-400">
      <CardContent className="pt-8 pb-8 text-center text-gray-500">
        <p className="text-xl font-bold">NO VOTES YET!</p>
        <p className="text-lg">Share this poll to get votes.</p>
      </CardContent>
    </Card>
  );
};
export default Polloverview;
