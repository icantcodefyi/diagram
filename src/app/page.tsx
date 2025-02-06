import { DiagramGenerator } from "@/app/_components/diagram-generator";
import { AuthButton } from "@/app/_components/auth-button";

export default function page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <DiagramGenerator />
      <AuthButton />
    </div>
  );
}
