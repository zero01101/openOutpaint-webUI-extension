import launch
from modules import scripts
from pathlib import Path

base_location = Path(__file__).parent
repo_destination = Path.joinpath(base_location, "app")
name = "openOutpaint"
repo = "https://github.com/zero01101/openOutpaint"
print("cloning openOutpaint repo into " + repo_destination)
launch.git_clone(repo, repo_destination, "openOutpaint")
