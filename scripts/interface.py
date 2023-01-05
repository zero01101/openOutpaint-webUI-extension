import gradio as gr
from modules import scripts


class Script(scripts.Script):
    def title(self):
        return "OpenOutpaint"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def after_component(self, component, **kwargs):
        # Add button to both txt2img and img2img tabs
        if kwargs.get("elem_id") == "extras_tab":
            basic_send_button = gr.Button(
                "Send to openOutpaint", elem_id=f"openoutpaint_button")
            basic_send_button.click(None, [], None,
                                    _js="() => openoutpaint_send_gallery('WebUI Resource')")

    def ui(self, is_img2img):
        return []
