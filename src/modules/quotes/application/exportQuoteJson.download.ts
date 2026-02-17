import { downloadFile } from "../../../shared/lib/download/downloadFile";

export async function exportQuoteJsonDownload(params: {
  exportFn: () => Promise<unknown | null>;
  filename: string;
}) {
  const data = await params.exportFn();
  if (!data) return;

  downloadFile({
    content: JSON.stringify(data, null, 2),
    filename: params.filename,
    mimeType: "application/json",
  });
}
