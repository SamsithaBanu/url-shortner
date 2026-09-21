import { useEffect, useState, useRef } from "react";
import MainLayout from "../components/main-layout";
import { Copy, Check, Trash2, ExternalLink, RefreshCw, QrCode, Download, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "../components/ui/button";
import { deleteShortUrl, type URLResponse, getMyUrls } from "../lib/api";

const AllUrlPage = () => {
  const [urls, setUrls] = useState<URLResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeQrUrl, setActiveQrUrl] = useState<URLResponse | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  const fetchUrls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyUrls();
      setUrls(data);
    } catch (err: any) {
      setError(err.message || "Failed to load URLs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (shortCode: string) => {
    if (!confirm(`Are you sure you want to delete "${shortCode}"?`)) return;

    try {
      await deleteShortUrl(shortCode);
      setUrls((prev) => prev.filter((u) => u.short_code !== shortCode));
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleCopy = (shortUrl: string, shortCode: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas && activeQrUrl) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${activeQrUrl.short_code}.png`;
      a.click();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">All Shortened Links</h2>
          <Button variant="outline" size="sm" onClick={fetchUrls} disabled={loading} className="gap-2">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-card border rounded-lg space-y-2">
            <RefreshCw className="size-5 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading URLs...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="text-center p-8 bg-card border rounded-lg">
            <p className="text-sm text-muted-foreground">No short URLs found.</p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Short Code</th>
                  <th className="p-3">Original URL</th>
                  <th className="p-3 text-center">Clicks</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="border-none">
                {urls.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 bg-white shadow-sm border rounded-lg mt-2">
                    <td className="p-3 font-medium text-primary">
                      <a
                        href={item?.origin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.short_url}
                        <ExternalLink className="size-3" />
                      </a>
                    </td>
                    <td className="p-3 max-w-xs truncate text-muted-foreground" title={item.origin_url}>
                      {item.origin_url}
                    </td>
                    <td className="p-3 text-center font-medium">{item.clicks}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveQrUrl(item)}
                          title="View QR Code"
                        >
                          <QrCode className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(item.short_url, item.short_code)}
                          title="Copy Link"
                        >
                          {copiedCode === item.short_code ? (
                            <Check className="size-4 text-green-500" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.short_code)}
                          className="text-destructive hover:text-destructive"
                          title="Delete Link"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      {activeQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-background border rounded-lg shadow-lg p-6 max-w-sm w-full relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveQrUrl(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-foreground">QR Code</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {activeQrUrl.short_url}
              </p>
            </div>

            <div ref={qrRef} className="bg-white p-3 rounded-lg border shadow-xs">
              <QRCodeCanvas
                value={activeQrUrl.short_url}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#0d0d0eff"
                level="H"
              />
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadQr}
              className="w-full bg-[#0D1282] hover:bg-[#0D1282]/80 gap-2"
            >
              <Download className="size-4" />
              Download QR Code
            </Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AllUrlPage;