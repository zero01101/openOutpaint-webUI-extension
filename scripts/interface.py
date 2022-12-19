import gradio as gr
from modules import script_callbacks, shared, scripts

elements = {}


class Script(scripts.Script):
    img2img = None
    txt2img = None

    def title(self):
        return "OpenOutpaint"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def after_component(self, component, **kwargs):
        global elements, share_image
        if kwargs.get('elem_id') is not None:
            if kwargs.get('elem_id').find('txt2img_gallery') != -1:
                self.txt2img = component
            elif kwargs.get('elem_id').find('img2img_gallery') != -1:
                self.img2img = component
        if kwargs.get("value") == "Send to extras":
            elements["openoutpaint_button"] = gr.Button(
                "Send to openOutpaint", elem_id=f"openoutpaint_button")
            elements["openoutpaint_button"].click(None, [], None,
                                                  _js="() => openoutpaint_send_gallery()")

    def ui(self, is_img2img):
        if elements.get("openoutpaint_button"):
            pass
        return []
