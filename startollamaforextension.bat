@echo off
REM Change to Ollama folder
cd "C:\Users\Henry\AppData\Local\Programs\Ollama"

REM Set origins so Chrome extensions can connect
set OLLAMA_ORIGINS=chrome-extension://*

REM Start Ollama server
ollama serve

pause
\