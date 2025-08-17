"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Checkbox } from "../components/ui/checkbox"
import { Textarea } from "../components/ui/textarea"

import { Search, Copy, Check, Star } from "lucide-react"
import { cdnLibraries } from "../lib/famous-libraries"

export default function SimpleCDNGenerator() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cdnType, setCdnType] = useState("css")
  const [libraries, setLibraries] = useState([])
  const [selectedLibraries, setSelectedLibraries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadFamousLibraries()
  }, [cdnType])

  const loadFamousLibraries = useCallback(async () => {
    const famousLibs = []

    for (const lib of cdnLibraries.filter((lib) => lib.type === cdnType)) {
      try {
        const response = await fetch(
          `https://api.cdnjs.com/libraries/${encodeURIComponent(lib.name)}?fields=latest,version`,
        )
        const data = await response.json()

        famousLibs.push({
          name: lib.name,
          fileUrl: data.latest || lib.url,
          type: lib.type,
          isFamous: true,
          version: data.version || "latest",
        })
      } catch (error) {
        famousLibs.push({
          name: lib.name,
          fileUrl: lib.url,
          type: lib.type,
          isFamous: true,
          version: "latest",
        })
      }
    }

    setLibraries(famousLibs)
  }, [cdnType])

  const searchLibraries = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadFamousLibraries()
      return
    }

    setIsLoading(true)
    setSelectedLibraries([])

    try {
      const response = await fetch(
        `https://api.cdnjs.com/libraries?search=${encodeURIComponent(searchQuery)}&fields=latest,name,assets,version`,
      )
      const data = await response.json()

      const filteredLibs = []
      const famousLibNames = cdnLibraries.filter((lib) => lib.type === cdnType).map((lib) => lib.name.toLowerCase())

      data.results?.forEach((library) => {
        const isFamous = famousLibNames.includes(library.name.toLowerCase())

        if (library.assets && library.assets.length > 0) {
          const latestAssets = library.assets[0]
          const cssFiles = latestAssets.files?.filter((file) => file.endsWith(".css") || file.endsWith(".min.css")) || []
          const jsFiles = latestAssets.files?.filter(
            (file) => (file.endsWith(".js") || file.endsWith(".min.js")) && !file.endsWith(".css.js"),
          ) || []

          if (cdnType === "css" && cssFiles.length > 0) {
            const cssFile = cssFiles.find((file) => !file.includes(".min.")) || cssFiles[0]
            filteredLibs.push({
              ...library,
              fileUrl: `https://cdnjs.cloudflare.com/ajax/libs/${library.name}/${latestAssets.version}/${cssFile}`,
              type: "css",
              isFamous,
              version: latestAssets.version,
            })
          } else if (cdnType === "js" && jsFiles.length > 0) {
            const jsFile = jsFiles.find((file) => !file.includes(".min.")) || jsFiles[0]
            filteredLibs.push({
              ...library,
              fileUrl: `https://cdnjs.cloudflare.com/ajax/libs/${library.name}/${latestAssets.version}/${jsFile}`,
              type: "js",
              isFamous,
              version: latestAssets.version,
            })
          }
        }
      })

      const sortedLibs = filteredLibs.sort((a, b) => {
        if (a.isFamous && !b.isFamous) return -1
        if (!a.isFamous && b.isFamous) return 1
        return a.name.localeCompare(b.name)
      })

      setLibraries(sortedLibs)
    } catch (error) {
      console.error("Error searching libraries:", error)
      setLibraries([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, cdnType, loadFamousLibraries])

  const handleLibraryToggle = useCallback((library, checked) => {
    if (checked) {
      setSelectedLibraries((prev) => [...prev, library])
    } else {
      setSelectedLibraries((prev) => prev.filter((lib) => lib.name !== library.name))
    }
  }, [])

  const generateTags = useCallback(() => {
    return selectedLibraries
      .map((library) => {
        if (library.type === "css") {
          return `<link rel="stylesheet" href="${library.fileUrl}">`
        } else if (library.type === "js") {
          return `<script src="${library.fileUrl}"></script>`
        } else {
          return `<!-- ${library.name}: ${library.fileUrl} -->`
        }
      })
      .join("\n")
  }, [selectedLibraries])

  const copyToClipboard = useCallback(async () => {
    const tags = generateTags()
    try {
      await navigator.clipboard.writeText(tags)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }, [generateTags])



  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      searchLibraries()
    }
  }, [searchLibraries])

  const getTypeInfo = useCallback(() => {
    switch (cdnType) {
      case "css":
        return { label: "CSS Libraries" }
      case "js":
        return { label: "JavaScript Libraries" }
      case "other":
        return { label: "Other Assets" }
      default:
        return { label: "Libraries" }
    }
  }, [cdnType])

  const typeInfo = getTypeInfo()

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col p-4 max-w-6xl mx-auto">


        {/* Search Section */}
        <Card className="mb-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <CardContent className="p-4">
                         <div className="flex gap-2 mb-3">
               <Button
                 variant={cdnType === "css" ? "default" : "outline"}
                 onClick={() => setCdnType("css")}
                 className="px-4 py-2"
               >
                 CSS
               </Button>
               <Button
                 variant={cdnType === "js" ? "default" : "outline"}
                 onClick={() => setCdnType("js")}
                 className="px-4 py-2"
               >
                 JavaScript
               </Button>
               <Button
                 variant={cdnType === "other" ? "default" : "outline"}
                 onClick={() => setCdnType("other")}
                 className="px-4 py-2"
               >
                 Other
               </Button>
             </div>
                         <div className="flex gap-3">
               <Input
                 placeholder={`Search for ${cdnType.toUpperCase()} libraries...`}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyPress={handleKeyPress}
                 className="w-80 border border-gray-300 dark:border-gray-600"
               />
               <Button 
                 onClick={searchLibraries} 
                 disabled={isLoading} 
                 className="px-6 bg-blue-600 hover:bg-blue-700"
               >
                 <Search className="w-4 h-4 mr-2" />
                 {isLoading ? "..." : "Search"}
               </Button>
             </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {libraries.length > 0 && (
          <Card className="mb-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-1 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {typeInfo.label} ({libraries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-48 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {libraries.map((library) => (
                  <div
                    key={library.name}
                    className={`flex items-center space-x-3 p-2 rounded border ${
                      library.isFamous
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <Checkbox
                      id={library.name}
                      checked={selectedLibraries.some((lib) => lib.name === library.name)}
                      onCheckedChange={(checked) => handleLibraryToggle(library, checked)}
                      className="w-4 h-4"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label htmlFor={library.name} className="font-medium cursor-pointer text-sm truncate">
                          {library.name}
                          {library.isFamous && (
                            <span className="ml-2 text-yellow-600">★</span>
                          )}
                          {library.version && (
                            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-xs">
                              v{library.version}
                            </span>
                          )}
                        </label>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 font-mono">
                        {library.fileUrl}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selection Counter */}
        {selectedLibraries.length > 0 && (
          <div className="mb-3 flex-shrink-0">
            <div className="inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedLibraries.length} librar{selectedLibraries.length === 1 ? "y" : "ies"} selected
              </span>
                             <div className="flex gap-2">
                 <Button
                   onClick={copyToClipboard}
                   size="sm"
                   className="bg-green-600 hover:bg-green-700 text-white"
                 >
                   <Copy className="w-3 h-3 mr-1" />
                   Copy
                 </Button>
               </div>
            </div>
          </div>
        )}

        {/* Generated Tags Section */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Generated CDN Tags
            </CardTitle>
            {selectedLibraries.length > 0 && (
              <Button 
                onClick={copyToClipboard} 
                size="sm"
                className="ml-auto bg-blue-600 hover:bg-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
                         <Textarea
               value={generateTags()}
               readOnly
               placeholder="Select libraries above to generate CDN tags..."
               className="min-h-32 font-mono text-xs bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-0 resize-none h-full scrollbar-hide"
               style={{
                 fontFamily:
                   'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
               }}
             />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
