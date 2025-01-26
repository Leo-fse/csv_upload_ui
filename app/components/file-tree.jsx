"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

export function FileTree({ nodes, level = 0, onSelectionChange }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  return (
    <div style={{ marginLeft: level * 20 }}>
      {nodes.map((node) => (
        <div key={node.path}>
          <div className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded">
            {node.type === "file" && (
              <Checkbox
                checked={node.selected}
                onCheckedChange={(checked) => onSelectionChange(node.path, checked === true)}
                aria-label={`${node.name}を選択`}
              />
            )}
            <div
              className="flex items-center gap-1 flex-1 cursor-pointer"
              onClick={() => node.children && toggleNode(node.path)}
            >
              {node.children ? (
                expandedNodes.has(node.path) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : (
                <File className="h-4 w-4" />
              )}
              {node.children ? <Folder className="h-4 w-4 text-blue-500" /> : null}
              <span>{node.name}</span>
              {node.status && !node.children && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant={node.status.isUploaded ? "secondary" : "outline"}>
                        {node.status.isUploaded ? "アップロード済" : "未アップロード"}
                      </Badge>
                    </TooltipTrigger>
                    {node.status.isUploaded && node.status.timestamp && (
                      <TooltipContent>
                        アップロード日時: {new Date(node.status.timestamp).toLocaleString("ja-JP")}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          {node.children && expandedNodes.has(node.path) && (
            <FileTree nodes={node.children} level={level + 1} onSelectionChange={onSelectionChange} />
          )}
        </div>
      ))}
    </div>
  )
}

