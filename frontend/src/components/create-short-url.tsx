import * as React from "react"
import { Copy, Check, QrCode, Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { createShortUrl } from "../lib/api"
import { Button } from "../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export function CreateShortUrl() {
    const [destinationUrl, setDestinationUrl] = React.useState<string>("");
    const [customAlias, setCustomAlias] = React.useState<string>("");
    const [shortenedUrl, setShortenedUrl] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState<boolean>(false);
    const [showQr, setShowQr] = React.useState<boolean>(false);

    const qrRef = React.useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setShortenedUrl("");
        setShowQr(false);
        setLoading(true);

        try {
            const data = await createShortUrl({
                origin_url: destinationUrl,
                custom_alias: customAlias.trim() ? customAlias.trim() : null,
            });

            setShortenedUrl(data.short_url);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (shortenedUrl) {
            navigator.clipboard.writeText(shortenedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadQr = () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode-${customAlias || "short-url"}.png`;
            a.click();
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-sm gap-4">
            <Card>
                <CardHeader className="flex flex-col items-center">
                    <CardTitle>Url Shortner</CardTitle>
                    <CardDescription>
                        Create Short & Memorable link in Seconds
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="destination-url">Destination Url</Label>
                                <Input
                                    id="destination-url"
                                    type="url"
                                    placeholder="https://example.com/long-link"
                                    value={destinationUrl}
                                    onChange={(e) => setDestinationUrl(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="custom-alias">Alias (Optional)</Label>
                                <Input
                                    id="custom-alias"
                                    type="text"
                                    placeholder="my-custom-alias"
                                    value={customAlias}
                                    onChange={(e) => setCustomAlias(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="mt-4 text-xs font-medium text-destructive">
                                {error}
                            </p>
                        )}

                        {shortenedUrl && (
                            <div className="flex flex-col gap-3 my-6 border-t pt-4">
                                <Label htmlFor="shortened-url">Shorten Url</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="shortened-url"
                                        type="text"
                                        value={shortenedUrl}
                                        readOnly
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        title="Copy URL"
                                    >
                                        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={showQr ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setShowQr(!showQr)}
                                        title="Toggle QR Code"
                                        className={showQr ? "bg-[#0D1282] hover:bg-[#0D1282]/80" : ""}
                                    >
                                        <QrCode className="size-4" />
                                    </Button>
                                </div>

                                {showQr && (
                                    <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 border rounded-lg mt-2">
                                        <div ref={qrRef} className="bg-white p-2 rounded shadow-sm">
                                            <QRCodeCanvas
                                                value={shortenedUrl}
                                                size={140}
                                                bgColor="#FFFFFF"
                                                fgColor="#0a0a0aff"
                                                level="H"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDownloadQr}
                                            className="gap-1.5 text-xs w-full"
                                        >
                                            <Download className="size-3.5" />
                                            Download QR Code
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button
                            type="submit"
                            variant="default"
                            disabled={loading}
                            className="w-full bg-[#0D1282] hover:bg-[#0D1282]/70"
                        >
                            {loading ? "Shortening..." : "Short Url"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
