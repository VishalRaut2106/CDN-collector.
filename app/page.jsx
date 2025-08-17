"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Copy, Check, Star, RefreshCw } from "lucide-react"
import { cdnLibraries } from "@/lib/famous-libraries"

export default function CDNCollectionGenerator() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cdnType, setCdnType] = useState("css")
  const [libraries, setLibraries] = useState([])
  const [selectedLibraries, setSelectedLibraries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lastUpdateCheck, setLastUpdateCheck] = useState(null)
  const [hasUpdates, setHasUpdates] = useState(false)

  useEffect(() => {
    loadFamousLibraries()
    checkForUpdates()
    const updateInterval = setInterval(checkForUpdates, 300000) // Check every 5 minutes
    return () => clearInterval(updateInterval)
  }, [cdnType])

  const checkForUpdates = async () => {
    try {
      const storedVersions = JSON.parse(localStorage.getItem("cdnVersions") || "{}")
      const currentTime = Date.now()

      // Only check if it's been more than 5 minutes since last check
      if (lastUpdateCheck && currentTime - lastUpdateCheck < 300000) return

      const famousLibNames = cdnLibraries.filter((lib) => lib.type === cdnType).map((lib) => lib.name)
      let updatesFound = false

      for (const libName of famousLibNames.slice(0, 5)) {
        // Check first 5 to avoid rate limits
        try {
          const response = await fetch(`https://api.cdnjs.com/libraries/${encodeURIComponent(libName)}?fields=version`)
          const data = await response.json()

          if (data.version && storedVersions[libName] && storedVersions[libName] !== data.version) {
            updatesFound = true
            console.log(`[v0] Update detected for ${libName}: ${storedVersions[libName]} -> ${data.version}`)
          }

          if (data.version) {
            storedVersions[libName] = data.version
          }
        } catch (error) {
          console.error(`[v0] Error checking version for ${libName}:`, error)
        }
      }

      localStorage.setItem("cdnVersions", JSON.stringify(storedVersions))
      setLastUpdateCheck(currentTime)
      setHasUpdates(updatesFound)

      if (updatesFound) {
        // Auto-refresh libraries if updates are found
        loadFamousLibraries()
      }
    } catch (error) {
      console.error("[v0] Error checking for updates:", error)
    }
  }

  const loadFamousLibraries = async () => {
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
          latest: data.latest || lib.url,
          version: data.version || "latest",
        })
      } catch (error) {
        // Fallback to static URL if API fails
        famousLibs.push({
          name: lib.name,
          fileUrl: lib.url,
          type: lib.type,
          isFamous: true,
          latest: lib.url,
          version: "latest",
        })
      }
    }

    setLibraries(famousLibs)
  }

  const searchLibraries = async () => {
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
          const cssFiles =
            latestAssets.files?.filter((file) => file.endsWith(".css") || file.endsWith(".min.css")) || []
          const jsFiles =
            latestAssets.files?.filter(
              (file) => (file.endsWith(".js") || file.endsWith(".min.js")) && !file.endsWith(".css.js"),
            ) || []

          const otherFiles =
            latestAssets.files?.filter(
              (file) =>
                !file.endsWith(".css") &&
                !file.endsWith(".min.css") &&
                !file.endsWith(".js") &&
                !file.endsWith(".min.js") &&
                !file.endsWith(".css.js"),
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
          } else if (cdnType === "other") {
            let fileToUse = null

            // First, try to find common "other" file types
            if (otherFiles.length > 0) {
              fileToUse =
                otherFiles.find(
                  (file) =>
                    file.endsWith(".woff") ||
                    file.endsWith(".woff2") ||
                    file.endsWith(".ttf") ||
                    file.endsWith(".otf") ||
                    file.endsWith(".eot") ||
                    file.endsWith(".svg") ||
                    file.endsWith(".png") ||
                    file.endsWith(".jpg") ||
                    file.endsWith(".gif") ||
                    file.endsWith(".webp") ||
                    file.endsWith(".ico") ||
                    file.endsWith(".wasm") ||
                    file.endsWith(".json") ||
                    file.endsWith(".xml") ||
                    file.endsWith(".map") ||
                    file.includes("font") ||
                    file.includes("icon"),
                ) || otherFiles[0]
            }

            // If no other files but library name suggests it's for "other" category
            if (!fileToUse && (cssFiles.length > 0 || jsFiles.length > 0)) {
              const libraryNameLower = library.name.toLowerCase()
              if (
                libraryNameLower.includes("font") ||
                libraryNameLower.includes("icon") ||
                libraryNameLower.includes("image") ||
                libraryNameLower.includes("emoji") ||
                libraryNameLower.includes("symbol") ||
                libraryNameLower.includes("glyph")
              ) {
                // Use the first available file for font/icon libraries
                fileToUse = latestAssets.files[0]
              }
            }

            // Fallback: if no CSS/JS files, include any file
            if (!fileToUse && cssFiles.length === 0 && jsFiles.length === 0 && latestAssets.files?.length > 0) {
              fileToUse = latestAssets.files[0]
            }

            if (fileToUse) {
              filteredLibs.push({
                ...library,
                fileUrl: `https://cdnjs.cloudflare.com/ajax/libs/${library.name}/${latestAssets.version}/${fileToUse}`,
                type: "other",
                isFamous,
                version: latestAssets.version,
              })
            }
          }
        } else if (library.latest) {
          if (cdnType === "css" && (library.latest.endsWith(".css") || library.latest.endsWith(".min.css"))) {
            filteredLibs.push({ ...library, fileUrl: library.latest, type: "css", isFamous, version: library.version })
          } else if (
            cdnType === "js" &&
            (library.latest.endsWith(".js") || library.latest.endsWith(".min.js")) &&
            !library.latest.endsWith(".css")
          ) {
            filteredLibs.push({ ...library, fileUrl: library.latest, type: "js", isFamous, version: library.version })
          } else if (cdnType === "other") {
            if (
              !library.latest.endsWith(".css") &&
              !library.latest.endsWith(".min.css") &&
              !library.latest.endsWith(".js") &&
              !library.latest.endsWith(".min.js")
            ) {
              filteredLibs.push({
                ...library,
                fileUrl: library.latest,
                type: "other",
                isFamous,
                version: library.version,
              })
            } else {
              const libraryNameLower = library.name.toLowerCase()
              if (
                libraryNameLower.includes("font") ||
                libraryNameLower.includes("icon") ||
                libraryNameLower.includes("image") ||
                libraryNameLower.includes("emoji")
              ) {
                filteredLibs.push({
                  ...library,
                  fileUrl: library.latest,
                  type: "other",
                  isFamous,
                  version: library.version,
                })
              }
            }
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
  }

  const handleLibraryToggle = (library, checked) => {
    if (checked) {
      setSelectedLibraries((prev) => [...prev, library])
    } else {
      setSelectedLibraries((prev) => prev.filter((lib) => lib.name !== library.name))
    }
  }

  const generateTags = () => {
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
  }

  const copyToClipboard = async () => {
    const tags = generateTags()
    try {
      await navigator.clipboard.writeText(tags)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchLibraries()
    }
  }

  const getTypeInfo = () => {
    switch (cdnType) {
      case "css":
        return { icon: "🎨", label: "CSS Libraries", description: "Popular stylesheets and CSS frameworks" }
      case "js":
        return { icon: "⚡", label: "JavaScript Libraries", description: "Popular JavaScript libraries and frameworks" }
      case "other":
        return { icon: "📁", label: "Other Assets", description: "Fonts, images, and other resources" }
      default:
        return { icon: "📦", label: "Libraries", description: "CDN resources" }
    }
  }

  const typeInfo = getTypeInfo()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">📦 CDN Collection Generator</h1>
          <p className="text-muted-foreground">Search and generate CDN links for popular libraries</p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Libraries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Select value={cdnType} onValueChange={setCdnType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select CDN type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="css">🎨 CSS Libraries</SelectItem>
                  <SelectItem value="js">⚡ JavaScript Libraries</SelectItem>
                  <SelectItem value="other">📁 Other Assets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={`Search for ${cdnType.toUpperCase()} libraries (e.g., ${
                  cdnType === "css"
                    ? "bootstrap, tailwind, bulma"
                    : cdnType === "js"
                      ? "react, vue, jquery"
                      : "fonts, icons, images"
                }) or leave empty to see popular libraries`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={searchLibraries} disabled={isLoading} className="px-6">
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {libraries.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {typeInfo.icon} {typeInfo.label} ({libraries.length})
                <span className="text-sm font-normal text-muted-foreground">- Popular libraries shown first</span>
                {hasUpdates && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <RefreshCw className="w-3 h-3" />
                    Updates available
                  </div>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {libraries.map((library) => (
                  <div
                    key={library.name}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      library.isFamous
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <Checkbox
                      id={library.name}
                      checked={selectedLibraries.some((lib) => lib.name === library.name)}
                      onCheckedChange={(checked) => handleLibraryToggle(library, checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={library.name} className="font-medium cursor-pointer flex items-center gap-2">
                        {library.name}
                        {library.isFamous && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        {library.version && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            v{library.version}
                          </span>
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground truncate">{library.fileUrl}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Libraries Count */}
        {selectedLibraries.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {selectedLibraries.length} {cdnType.toUpperCase()} librar{selectedLibraries.length === 1 ? "y" : "ies"}{" "}
              selected
            </p>
          </div>
        )}

        {/* Generated Tags Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated CDN Tags</CardTitle>
            {selectedLibraries.length > 0 && (
              <Button onClick={copyToClipboard} variant="outline" size="sm" className="ml-auto bg-transparent">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              value={generateTags()}
              readOnly
              placeholder="Select libraries above to generate CDN tags..."
              className="min-h-32 font-mono text-sm bg-muted/50 text-green-400"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Popular libraries are shown first with a star. Search for specific libraries or browse the curated
            collection.
          </p>
        </div>
      </div>
    </div>
  )
}
