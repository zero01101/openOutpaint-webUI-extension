from modules import script_callbacks, scripts, shared
import gradio as gr
from fastapi import FastAPI
import os
from launch import run
import pathlib
import inspect

import string
import random as rd


extension_dir = pathlib.Path(inspect.getfile(lambda: None)).parent.parent
key_characters = (string.ascii_letters + string.digits)


def random_string(length=20):
    return ''.join([rd.choice(key_characters) for _ in range(length)])


key = random_string()


def get_files(path):
    # Gets all files
    directories = set()
    for root, _, files in os.walk(path.resolve()):
        for file in files:
            directories.add(root + '/' + file)

    return directories


def started(demo, app: FastAPI):
    try:
        # Force allow paths for fixing symlinked extension directory references
        force_allow = get_files(extension_dir / "app")

        # Add to allowed files list
        app.blocks.temp_file_sets.append(force_allow)

        # Force allow paths for fixing symlinked extension directory references (base javascript files now)
        force_allow = get_files(extension_dir / "javascript")

        # Add to allowed files list
        app.blocks.temp_file_sets.append(force_allow)
    except Exception:
        print(f"[openOutpaint] Could not force allowed files. Skipping...")
        pass


def update_app():
    git = os.environ.get('GIT', "git")
    # print(scripts.basedir)
    run(f'"{git}" -C "' + os.path.join(scripts.basedir(), usefulDirs[0], usefulDirs[1]) +
        '" submodule update --init --recursive --remote')


def add_tab():
    try:
        if shared.cmd_opts.lock_oo_submodule:
            print(f"[openOutpaint] Submodule locked. Will skip submodule update.")
        else:
            update_app()
    except Exception:
        update_app()

    with gr.Blocks(analytics_enabled=False) as ui:
        #refresh = gr.Button(value="refresh", variant="primary")
        canvas = gr.HTML(
            f"<iframe id=\"openoutpaint-iframe\" class=\"border-2 border-gray-200\" src=\"file={usefulDirs[0]}/{usefulDirs[1]}/app/index.html?noprompt\"></iframe>")
        keyinput = gr.HTML(
            f"<input id=\"openoutpaint-key\" type=\"hidden\" value=\"{key}\">")

    return [(ui, "openOutpaint", "openOutpaint")]


usefulDirs = scripts.basedir().split(os.sep)[-2:]

with open(f"{scripts.basedir()}/app/key.json", "w") as keyfile:
    keyfile.write('{\n')
    keyfile.write(f"  \"key\": \"{key}\"\n")
    keyfile.write('}\n')
    keyfile.close()

script_callbacks.on_ui_tabs(add_tab)
script_callbacks.on_app_started(started)
