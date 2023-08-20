import gradio as gr
from modules import scripts
from modules.ui_components import ToolButton


class Script(scripts.Script):
    def title(self):
        return "OpenOutpaint"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def after_component(self, component, **kwargs):
        # Add button to both txt2img and img2img tabs
        if kwargs.get("elem_id") == "txt2img_send_to_extras" or kwargs.get("elem_id") == "img2img_send_to_extras":
            tabname = kwargs.get("elem_id").replace("_send_to_extras", "")
            new_send_button = ToolButton('🐠', elem_id=f'{tabname}_openOutpaint_button', tooltip="Send image and prompt parameters to openOutpaint.")
            new_send_button.click(None, [], None,
                                    _js="() => openoutpaint_send_gallery('WebUI " + tabname + " Resource')")

    def ui(self, is_img2img):
        return []
