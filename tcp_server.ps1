$port = 8000
$baseDir = "C:\Users\User\.gemini\antigravity\scratch\smart-expense-tracker"
$listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "TCP Web Server successfully running on http://127.0.0.1:$port/"

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            $client.Close()
            continue
        }
        
        $tokens = $requestLine.Split(' ')
        $urlPath = if ($tokens.Length -gt 1) { $tokens[1] } else { "/" }
        $cleanPath = $urlPath.Split('?')[0].TrimStart('/')
        if ([string]::IsNullOrEmpty($cleanPath) -or $cleanPath -eq '/') {
            $cleanPath = "index.html"
        }
        
        $filePath = Join-Path $baseDir $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $errBody = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($errBody.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($errBody, 0, $errBody.Length)
        }
        
        $stream.Flush()
        $client.Close()
    } catch {
        # continue loop
    }
}
