"use client";

import { useState } from "react";
import { toast } from "sonner";
import { paraphrase } from "@/app/actions/paraphrase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REWRITE_STYLES } from "@/types/paraphrase";

export default function ParaphraserForm() {
  const [inputText, setInputText] = useState("");
  const [style, setStyle] = useState<string>(REWRITE_STYLES[0]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);
    paraphrase(inputText, style)
      .then((res) => {
        if (res.error) {
          setError(res.error);
          toast.error(res.error);
        } else if (res.data) {
          setResult(res.data);
          toast.success("Paraphrased successfully.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard
      .writeText(result)
      .then(() => {
        toast.success("Copied to clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard.");
      });
  }

  const canSubmit = inputText.trim().length > 0 && !loading;
  const canCopy = result.length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your text</CardTitle>
          <CardDescription>
            Paste the text you want to paraphrase below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text">Text to paraphrase</Label>
            <Textarea
              id="input-text"
              placeholder="Paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="resize-y"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Rewrite style</Label>
            <Select value={style} onValueChange={setStyle} disabled={loading}>
              <SelectTrigger id="style" className="w-full sm:w-[240px]">
                <SelectValue placeholder="Choose a style" />
              </SelectTrigger>
              <SelectContent>
                {REWRITE_STYLES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Paraphrasing…" : "Paraphrase"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Result</CardTitle>
              <CardDescription>
                Your paraphrased text. Use Copy to clipboard to copy it.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!canCopy}
            >
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={result}
              rows={6}
              className="resize-y bg-muted/50"
              aria-label="Paraphrased result"
            />
          </CardContent>
        </Card>
      )}
    </form>
  );
}
