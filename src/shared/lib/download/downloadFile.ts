export function downloadFile(params: {
  content: string | Blob;
  filename: string;
  mimeType?: string;
}) {
  const { content, filename, mimeType = "application/octet-stream" } = params;

  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
