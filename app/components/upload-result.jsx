"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export function UploadResult({ result }) {
  if (!result) return null

  return (
    <div className="space-y-4">
      <Alert variant={result.success ? "default" : "destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>

      {result.files && result.files.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="results">
            <AccordionTrigger>処理結果の詳細</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {result.files.map((file, index) => (
                  <div key={index} className="flex items-start gap-2 p-4 rounded border">
                    {file.error ? (
                      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{file.fileName}</p>
                        <Badge variant={file.error ? "destructive" : "success"}>{file.error ? "失敗" : "成功"}</Badge>
                      </div>
                      {file.error ? (
                        <p className="text-destructive text-sm">{file.error}</p>
                      ) : (
                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">処理行数: {file.processedRows || 0}行</p>
                          {file.details && <p className="text-muted-foreground">{file.details}</p>}
                          <p className="text-muted-foreground">保存場所: {file.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

