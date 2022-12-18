import launch
import os
from modules import scripts
from pathlib import Path

base_location = Path(__file__).parent
repo_destination = os.path.join(base_location, "app")
name = "openOutpaint"
repo = "https://github.com/zero01101/openOutpaint"
launch.git_clone(repo, repo_destination, "openOutpaint")
