param([Parameter(Mandatory=$true)][string]$Manifest)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$taskSpeech = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $taskSpeech.SelectVoice('Microsoft Daniel')
    $taskSpeech.Rate = 0
    $taskSpeech.Volume = 90
    $taskAudioDirectory = Join-Path $PSScriptRoot '../src/audio/boss'
    New-Item -ItemType Directory -Path $taskAudioDirectory -Force | Out-Null
    $taskLines = Get-Content -LiteralPath $Manifest -Raw -Encoding utf8 | ConvertFrom-Json
    $taskFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    for ($taskIndex = 0; $taskIndex -lt $taskLines.Count; $taskIndex++) {
        $taskOutput = Join-Path $taskAudioDirectory "result-$taskIndex.wav"
        $taskSpeech.SetOutputToWaveFile($taskOutput, $taskFormat)
        $taskSpeech.Speak([string]$taskLines[$taskIndex])
        $taskSpeech.SetOutputToNull()
        Write-Output "Generated result-$taskIndex.wav"
    }
} finally {
    $taskSpeech.Dispose()
}
