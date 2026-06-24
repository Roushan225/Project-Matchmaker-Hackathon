"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

type Resource = { id: string; name: string; url: string; mimeType: string; bytes: number; uploadedById: string; createdAt: string };
type Member = { id: string; name: string };

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WorkspaceResourceBoard({ projectId, members }: { projectId: string; members: Member[] }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [status, setStatus] = useState("Loading resources…");
  const memberNames = new Map(members.map((member) => [member.id, member.name]));

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch(`/api/resources?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load resources.");
        setResources(data.resources);
        setStatus(data.resources.length ? "Shared files" : "No files shared yet");
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load resources.");
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, [projectId]);

  const uploadFiles = useCallback(async (files: File[]) => {
    setStatus(`Uploading ${files.length} file${files.length === 1 ? "" : "s"}…`);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("file", file);
        const response = await fetch("/api/uploads", { method: "POST", body: formData });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? `Could not upload ${file.name}.`);
        return data.resource as Resource;
      }));
      setResources((current) => [...uploaded, ...current]);
      setStatus(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} shared`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not upload these files.");
    }
  }, [projectId]);

  const onDrop = useCallback((files: File[]) => { void uploadFiles(files); }, [uploadFiles]);
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({ onDrop, maxSize: 10 * 1024 * 1024, multiple: true });
  const rejectionMessage = fileRejections[0] ? `${fileRejections[0].file.name} is too large. Limit: 10 MB.` : "";

  return <section className="h-[calc(100dvh-10rem)] min-h-[560px] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur md:h-[calc(100dvh-12rem)] md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">Shared resource board</p><h2 className="mt-2 text-2xl font-semibold text-white">Files for the whole team</h2><p className="mt-2 text-sm text-slate-400">Drop documents, images, archives, and working files. Each file is stored in Cloudinary.</p></div><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">{status}</span></div>
    <div {...getRootProps()} className={`mt-7 grid cursor-pointer place-items-center rounded-2xl border border-dashed px-5 py-10 text-center transition ${isDragActive ? "border-violet-300 bg-violet-300/10" : "border-white/20 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.06]"}`}><input {...getInputProps()} /><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-300/15 text-2xl text-violet-100">↑</span><p className="mt-4 font-semibold text-white">{isDragActive ? "Drop files to share them" : "Drag files here, or click to browse"}</p><p className="mt-1 text-sm text-slate-400">Up to 10 MB per file</p></div></div>
    {rejectionMessage && <p className="mt-3 rounded-xl bg-rose-400/10 px-3 py-2 text-sm text-rose-100">{rejectionMessage}</p>}
    <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{resources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/25 hover:bg-white/[0.08]"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg">{resource.mimeType.startsWith("image/") ? "◉" : "↗"}</span><div className="min-w-0"><p className="truncate font-medium text-white group-hover:text-violet-100">{resource.name}</p><p className="mt-1 text-xs text-slate-400">{formatBytes(resource.bytes)} · {memberNames.get(resource.uploadedById) ?? "Team member"}</p><p className="mt-2 text-xs text-indigo-100/50">{new Date(resource.createdAt).toLocaleDateString()}</p></div></div></a>)}</div>
    {!resources.length && status !== "Loading resources…" && <p className="mt-7 text-center text-sm text-slate-500">Your team’s shared files will appear here.</p>}
  </section>;
}
