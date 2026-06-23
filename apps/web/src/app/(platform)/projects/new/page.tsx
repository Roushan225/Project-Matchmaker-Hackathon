import { CreateProjectForm } from "@/features/projects/components/create-project-form";

export default function NewProjectPage() {
  return <div className="mx-auto max-w-3xl"><p className="text-sm font-medium text-teal-300">New opportunity</p><h1 className="mt-2 text-3xl font-semibold text-white">Describe the project people will want to join.</h1><p className="mt-3 text-slate-400">Clear requirements produce better applications. Keep the pitch concrete and the needs honest.</p><CreateProjectForm /></div>;
}
