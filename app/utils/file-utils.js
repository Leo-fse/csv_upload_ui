export function organizeFiles(files) {
    const root = {}
  
    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split("/")
      let currentLevel = root
  
      pathParts.forEach((part, index) => {
        if (!part) return
  
        const path = pathParts.slice(0, index + 1).join("/")
        if (!currentLevel[path]) {
          currentLevel[path] = {
            name: part,
            path: path,
            type: index === pathParts.length - 1 ? "file" : "directory",
            children: index === pathParts.length - 1 ? undefined : {},
          }
        }
  
        if (index < pathParts.length - 1) {
          currentLevel = currentLevel[path].children
        }
      })
    })
  
    function convertToArray(obj) {
      return Object.values(obj).map((node) => ({
        ...node,
        children: node.children ? convertToArray(node.children) : undefined,
      }))
    }
  
    return convertToArray(root)
  }
  
  export function checkUploadStatus(files, uploadHistory, selectedFiles = new Set()) {
    return files.map((node) => {
      if (node.type === "file") {
        const uploadedFile = uploadHistory
          .flatMap((result) => result.files || [])
          .find((file) => file.relativePath === node.path)
  
        return {
          ...node,
          selected: selectedFiles.has(node.path),
          status: uploadedFile
            ? {
                isUploaded: true,
                timestamp: uploadHistory.find((h) => h.files?.some((f) => f.relativePath === node.path))?.timestamp,
              }
            : {
                isUploaded: false,
              },
        }
      }
  
      return {
        ...node,
        children: node.children ? checkUploadStatus(node.children, uploadHistory, selectedFiles) : undefined,
      }
    })
  }
  
  export function getSelectedFiles(nodes) {
    const selected = new Set()
  
    function traverse(node) {
      if (node.type === "file" && node.selected) {
        selected.add(node.path)
      }
      node.children?.forEach(traverse)
    }
  
    nodes.forEach(traverse)
    return selected
  }
  
  