import { DiagramGenerator } from "@/app/_components/diagram-generator";
import { AuthButton } from "@/app/_components/auth-button";
import { DiagramHistory } from "@/app/_components/diagram-history";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full">
      <DiagramHistory />
      <div className="flex flex-1 items-center justify-center relative">
        <DiagramGenerator />
        <div className="absolute top-4 right-4">
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
