import httpx
import base64
import re
from typing import List, Dict, Optional
from ..core.config import get_settings

settings = get_settings()

GITHUB_API_BASE = "https://api.github.com"
RAW_GITHUB_BASE = "https://raw.githubusercontent.com"


class GitHubService:
    def __init__(self, username: str = settings.GITHUB_USERNAME):
        self.username = username
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_repo_contents(self, repo_name: str = "Leetcode", path: str = "") -> List[Dict]:
        """Get contents of a repository path"""
        url = f"{GITHUB_API_BASE}/repos/{self.username}/{repo_name}/contents/{path}"
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching repo contents: {e}")
            return []
    
    async def get_file_content(self, repo_name: str, path: str) -> Optional[str]:
        """Get the content of a specific file"""
        url = f"{GITHUB_API_BASE}/repos/{self.username}/{repo_name}/contents/{path}"
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            data = response.json()
            if "content" in data:
                content = base64.b64decode(data["content"]).decode("utf-8")
                return content
            return None
        except httpx.HTTPError as e:
            print(f"Error fetching file content: {e}")
            return None
    
    async def get_raw_file_content(self, repo_name: str, path: str, branch: str = "main") -> Optional[str]:
        """Get raw file content from GitHub"""
        url = f"{RAW_GITHUB_BASE}/{self.username}/{repo_name}/{branch}/{path}"
        try:
            response = await self.client.get(url)
            if response.status_code == 200:
                return response.text
            # Try master branch if main fails
            if branch == "main":
                url = f"{RAW_GITHUB_BASE}/{self.username}/{repo_name}/master/{path}"
                response = await self.client.get(url)
                if response.status_code == 200:
                    return response.text
            return None
        except httpx.HTTPError as e:
            print(f"Error fetching raw file: {e}")
            return None
    
    async def get_leetcode_solutions(self) -> List[Dict]:
        """Fetch all LeetCode solutions from the repository"""
        solutions = []
        
        # Get root contents
        root_contents = await self.get_repo_contents("Leetcode")
        
        for item in root_contents:
            if item["type"] == "file" and item["name"].endswith(".py"):
                # Parse filename to extract problem info
                file_info = self._parse_filename(item["name"])
                if file_info:
                    content = await self.get_raw_file_content("Leetcode", item["name"])
                    solutions.append({
                        **file_info,
                        "filename": item["name"],
                        "github_url": item["html_url"],
                        "content": content,
                        "path": item["path"]
                    })
            elif item["type"] == "dir":
                # Handle directory structure
                dir_solutions = await self._process_directory(item["name"])
                solutions.extend(dir_solutions)
        
        return solutions
    
    async def _process_directory(self, dir_name: str) -> List[Dict]:
        """Process a directory containing solutions"""
        solutions = []
        dir_contents = await self.get_repo_contents("Leetcode", dir_name)
        
        for item in dir_contents:
            if item["type"] == "file" and item["name"].endswith(".py"):
                file_info = self._parse_filename(item["name"])
                if file_info:
                    content = await self.get_raw_file_content("Leetcode", f"{dir_name}/{item['name']}")
                    solutions.append({
                        **file_info,
                        "filename": item["name"],
                        "github_url": item["html_url"],
                        "content": content,
                        "path": item["path"],
                        "category": dir_name
                    })
        
        return solutions
    
    def _parse_filename(self, filename: str) -> Optional[Dict]:
        """Parse filename to extract problem number and title"""
        # Remove .py extension
        name_without_ext = filename.replace(".py", "")
        
        # Try to extract problem number and title
        # Patterns: "1. Two Sum.py", "1_two_sum.py", "two-sum.py", etc.
        patterns = [
            r"^(\d+)\.?\s*(.+)$",  # "1. Two Sum" or "1 Two Sum"
            r"^(\d+)_(.+)$",        # "1_two_sum"
            r"^(.+)$",              # Just the title
        ]
        
        for pattern in patterns:
            match = re.match(pattern, name_without_ext)
            if match:
                if len(match.groups()) == 2:
                    problem_num = match.group(1)
                    title = match.group(2).replace("_", " ").replace("-", " ").title()
                    return {
                        "problem_number": problem_num,
                        "title": title,
                        "slug": name_without_ext.lower().replace(" ", "-").replace("_", "-")
                    }
                else:
                    title = match.group(1).replace("_", " ").replace("-", " ").title()
                    return {
                        "problem_number": None,
                        "title": title,
                        "slug": name_without_ext.lower().replace(" ", "-").replace("_", "-")
                    }
        
        return {
            "problem_number": None,
            "title": name_without_ext.replace("_", " ").replace("-", " ").title(),
            "slug": name_without_ext.lower().replace(" ", "-").replace("_", "-")
        }
    
    async def close(self):
        await self.client.aclose()


github_service = GitHubService()
