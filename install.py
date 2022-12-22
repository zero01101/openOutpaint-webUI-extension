import os
from launch import run
from modules import scripts

git = os.environ.get('GIT', "git")
usefulDirs = scripts.basedir().split(os.sep)[-2:]
print("preinit openOutpaint")
print(run(f'"{git}" -C ' + scripts.basedir() + ' submodule update --init --recursive --remote'))
