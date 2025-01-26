"use client"

import { forwardRef, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

export const FileInput = forwardRef(({ label, buttonText, onChange, ...props }, ref) => {
  const localInputRef = useRef(null)
  const inputRef = ref || localInputRef

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} className="min-w-[200px]">
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        <span className="text-sm text-muted-foreground">
          {inputRef.current?.files?.length
            ? `${inputRef.current.files.length}個のファイルを選択中`
            : "ファイルが選択されていません"}
        </span>
      </div>
      <Input ref={inputRef} type="file" onChange={onChange} className="hidden" aria-label={label} {...props} />
    </div>
  )
})
FileInput.displayName = "FileInput"

