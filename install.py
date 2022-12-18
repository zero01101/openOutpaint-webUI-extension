import os
from launch import run

git = os.environ.get('GIT', "git")
print("hopefully pulling in main app as a submodule")
run(f'"{git}" pull --recurse-submodules')
print("hopefully finished pulling in main app as a submodule")