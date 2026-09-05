import { ResourceForm } from "../ResourceForm";

export default function NewResourcePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add resource</h1>
      <ResourceForm mode="create" />
    </div>
  );
}
