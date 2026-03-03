#!/bin/bash

echo "🐱 Setting up Kapil's Progress Tracker Backend"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✅ Python version: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/progress_tracker
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GITHUB_USERNAME=Raghav-2801
ADMIN_USERNAME=kapil
ADMIN_PASSWORD_HASH=\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1W
EOF
    echo "📝 Please update the .env file with your database credentials and admin password."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  1. Make sure PostgreSQL is running"
echo "  2. Run: python init_db.py"
echo "  3. Run: python run.py"
echo ""
echo "The API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
