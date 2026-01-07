param($file)

# 读取原始内容
$content = Get-Content $file -Raw -Encoding UTF8

# 定义替换规则
$replacements = @{
    '^pick fc712a6' = 'reword fc712a6'
    '^pick b00d716' = 'reword b00d716'
    '^pick 27bf41d' = 'reword 27bf41d'
    '^pick 1f31ef6' = 'reword 1f31ef6'
    '^pick ad30aaf' = 'reword ad30aaf'
    '^pick 3138860' = 'reword 3138860'
    '^pick eafedb6' = 'reword eafedb6'
    '^pick c4746e1' = 'reword c4746e1'
    '^pick 91aff2a' = 'reword 91aff2a'
    '^pick e8ce43a' = 'reword e8ce43a'
}

# 应用替换
foreach ($pattern in $replacements.Keys) {
    $replacement = $replacements[$pattern]
    $content = $content -replace $pattern, $replacement
}

# 写入文件
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)

exit 0
