import html
from modules import script_callbacks, shared
import gradio as gr
from pathlib import Path
import os
import sys
import platform

def add_tab():
    with gr.Blocks(analytics_enabled=False) as ui:
        #refresh = gr.Button(value="refresh", variant="primary")
        # print(os.path.dirname(os.path.abspath('__file__')))
        # base_location = Path(__file__).parent
        # print(base_location)
        # repo_destination = Path.joinpath(base_location, "app")
        # print(repo_destination)
        print(os.getcwd())
        print(Path('.'))
        # canvas = gr.HTML()
        canvas = gr.HTML(f"<iframe src=\"https://zero01101.github.io/openOutpaint/\" style=\"height:1024px;width:100%;\"></iframe>")

        # refresh.click(
            
        # )


    return [(ui, "openOutpaint", "openOutpaint")]

script_callbacks.on_ui_tabs(add_tab)