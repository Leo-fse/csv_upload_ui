"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Upload, FileCheck, AlertCircle, Folder, File } from "lucide-react"
import { FileTree } from "./components/file-tree"
import { FileInput } from "./components/file-input"
import { organizeFiles, checkUploadStatus } from "./utils/file-utils"
import { UploadResult } from "./components/upload-result"

// FastAPIのエンドポイントURL
const FASTAPI_URL = "http://your-fastapi-url/upload"

export default function UploadForm() {
  const [selectedFiles, setSelectedFiles] = useState(null)
  const [selectedFilePaths, setSelectedFilePaths] = useState(new Set())
  const [uploadHistory, setUploadHistory] = useState([])
  const [isPending, setIsPending] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadType, setUploadType] = useState("files")
  const [showUploadConfirm, setShowUploadConfirm] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedFilePaths.size === 0) {
      setUploadResult({
        success: false,
        message: "アップロードするファイルを選択してください。",
        timestamp: new Date().toISOString(),
      })
      return
    }

    const formData = new FormData(e.currentTarget)

    // 選択されていないファイルを除外
    const newFormData = new FormData()
    for (const [key, value] of formData.entries()) {
      if (key === "files") {
        const file = value
        if (selectedFilePaths.has(file.webkitRelativePath || file.name)) {
          newFormData.append(key, value)
        }
      } else {
        newFormData.append(key, value)
      }
    }

    setPendingFormData(newFormData)

    // アップロード済みファイルのチェック
    const selectedUploadedFiles = Array.from(selectedFilePaths).filter((path) => {
      return uploadHistory.some((result) => result.files?.some((file) => file.relativePath === path))
    })

    if (selectedUploadedFiles.length > 0) {
      setShowUploadConfirm(true)
    } else {
      await executeUpload(newFormData)
    }
  }

  const executeUpload = async (formData) => {
    setIsPending(true)
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      setUploadResult(result)
      if (result.success) {
        setUploadHistory((prev) => [result, ...prev])
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: "アップロードに失敗しました。",
        timestamp: new Date().toISOString(),
        error: error.message,
      })
    } finally {
      setIsPending(false)
      setPendingFormData(null)
      setShowUploadConfirm(false)
    }
  }

  const handleFileSelection = (path, selected) => {
    const newSelection = new Set(selectedFilePaths)
    if (selected) {
      newSelection.add(path)
    } else {
      newSelection.delete(path)
    }
    setSelectedFilePaths(newSelection)
  }

  const handleUploadTypeChange = (value) => {
    setUploadType(value)
    setSelectedFiles(null)
    setSelectedFilePaths(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (folderInputRef.current) folderInputRef.current.value = ""
  }

  const handleFilesChange = (e) => {
    const files = e.target.files
    setSelectedFiles(files)
    if (files) {
      const paths = new Set()
      Array.from(files).forEach((file) => {
        paths.add(file.webkitRelativePath || file.name)
      })
      setSelectedFilePaths(paths)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ファイルアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="powerPlant">発電所名</Label>
                <Input id="powerPlant" name="powerPlant" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">設備名</Label>
                <Input id="equipment" name="equipment" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitNumber">号機名</Label>
                <Input id="unitNumber" name="unitNumber" required />
              </div>
            </div>

            <Tabs value={uploadType} onValueChange={handleUploadTypeChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="files">
                  <File className="h-4 w-4 mr-2" />
                  ファイル選択
                </TabsTrigger>
                <TabsTrigger value="folder">
                  <Folder className="h-4 w-4 mr-2" />
                  フォルダ選択
                </TabsTrigger>
              </TabsList>
              <TabsContent value="files" className="space-y-2">
                <FileInput
                  ref={fileInputRef}
                  id="files"
                  name="files"
                  label="ファイルを選択"
                  buttonText="ファイルを選択"
                  accept=".csv"
                  multiple
                  onChange={handleFilesChange}
                  required={uploadType === "files"}
                />
              </TabsContent>
              <TabsContent value="folder" className="space-y-2">
                <FileInput
                  ref={folderInputRef}
                  id="folder"
                  name="files"
                  label="フォルダを選択"
                  buttonText="フォルダを選択"
                  webkitdirectory=""
                  multiple
                  onChange={handleFilesChange}
                  required={uploadType === "folder"}
                />
              </TabsContent>
            </Tabs>

            {selectedFiles && selectedFiles.length > 0 && (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  選択された{uploadType === "folder" ? "フォルダ内の" : ""}ファイル ({selectedFiles.length}個):
                  <div className="mt-2">
                    <FileTree
                      nodes={checkUploadStatus(
                        organizeFiles(Array.from(selectedFiles)),
                        uploadHistory,
                        selectedFilePaths,
                      )}
                      onSelectionChange={handleFileSelection}
                    />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    アップロード対象: {selectedFilePaths.size}ファイル
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isPending || selectedFilePaths.size === 0} className="w-full">
              {isPending ? (
                "処理中..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  選択したファイルをアップロード
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {uploadResult && <UploadResult result={uploadResult} />}

      {uploadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>アップロード履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ファイル名</TableHead>
                    <TableHead>相対パス</TableHead>
                    <TableHead>保存場所</TableHead>
                    <TableHead>日時</TableHead>
                    <TableHead>状態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadHistory.map((item, index) =>
                    item.files?.map((file, fileIndex) => (
                      <TableRow key={`${index}-${fileIndex}`}>
                        <TableCell>{file.fileName}</TableCell>
                        <TableCell>{file.relativePath}</TableCell>
                        <TableCell>{file.location}</TableCell>
                        <TableCell>{new Date(item.timestamp).toLocaleString("ja-JP")}</TableCell>
                        <TableCell>{item.success ? "成功" : "失敗"}</TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Dialog open={showUploadConfirm} onOpenChange={setShowUploadConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アップロード確認</DialogTitle>
            <DialogDescription>
              選択されたファイルの中に、すでにアップロード済みのファイルが含まれています。
              上書きしてアップロードしますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadConfirm(false)}>
              キャンセル
            </Button>
            <Button onClick={() => pendingFormData && executeUpload(pendingFormData)}>アップロード</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

