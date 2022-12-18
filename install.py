import git

from launch import run

git = os.environ.get('GIT', "git")
run(f'"{git}" pull --recurse-submodules')