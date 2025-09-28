import { LoaderIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center flex-grow">
      <LoaderIcon className="animate-spin h-10 w-10 text-gray-900" />
    </div>
  );
}
