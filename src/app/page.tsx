import { DiagramGenerator } from "@/app/_components/diagram-generator";

export default function page() {
  return (
    <div className="flex min-h-[calc(100vh-100px)] w-full items-center justify-center">
      <DiagramGenerator />
    </div>
  );
}
