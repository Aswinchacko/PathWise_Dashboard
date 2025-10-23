@echo off
echo Setting up environment variables for PathWise Dashboard...

if not exist .env (
    echo Creating .env file...
    copy env.example .env
    echo.
    echo .env file created! Please edit it with your actual API keys.
    echo.
    echo Required API Keys:
    echo - VITE_SERPER_API_KEY: Get from https://serper.dev/
    echo - VITE_GROQ_API_KEY: Get from https://console.groq.com/
    echo.
    echo Opening .env file for editing...
    notepad .env
) else (
    echo .env file already exists!
)

echo.
echo Setup complete! Make sure to add your API keys to the .env file.
pause
