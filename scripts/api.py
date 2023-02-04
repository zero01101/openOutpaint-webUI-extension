from fastapi import FastAPI, Response, Form 
from fastapi.responses import JSONResponse 
from modules import sd_models, shared, scripts
import asyncio
import gradio as gr


def test_api(_: gr.Blocks, app: FastAPI):    
    """
        it kept yelling at me without the stupid gradio import there, i'm sure i did something wrong
        --------------------------
            Error executing callback app_started_callback for E:\storage\stable-diffusion-webui\extensions\apitest\scripts\api.py
            Traceback (most recent call last):
            File "E:\storage\stable-diffusion-webui\modules\script_callbacks.py", line 88, in app_started_callback
            c.callback(demo, app)
            TypeError: test_api() takes 1 positional argument but 2 were given
    """
    @app.post("/openOutpaint/unet-count")
    async def return_model_unet_channel_count(
        model_name: str = Form(description="the model to be inspected")
    ):
        err_msg = ""
        try:
            model = sd_models.checkpoints_list[model_name]
        except: 
            err_msg = "submitted model failed loading, falling back to loaded model"
            model = sd_models.checkpoints_list[get_current_model()]
        theta_0 = sd_models.read_state_dict(model.filename, map_location='cpu')
        channelCount = theta_0["model.diffusion_model.input_blocks.0.0.weight"].shape[1]
        return {            
            "unet_channels": channelCount,
            "estimated_type": switchAssumption(channelCount),            
            "tested_model": model,
            "additional_data": err_msg
        }

def switchAssumption(channelCount):
    match channelCount:
        case 4:
            return "traditional"
        case 5:
            return "sdv2 depth2img"
        case 7:
            return "sdv2 upscale 4x"
        case 8: 
            return "instruct-pix2pix"
        case 9: 
            return "inpainting"
        case _:
            return "¯\_(ツ)_/¯"

def get_current_model():
    options = {}
    for key in shared.opts.data.keys():
        metadata = shared.opts.data_labels.get(key)
        if(metadata is not None):
            options.update({key: shared.opts.data.get(key, shared.opts.data_labels.get(key).default)})
        else:
            options.update({key: shared.opts.data.get(key, None)})

    return options["sd_model_checkpoint"] # super inefficient but i'm a moron


try:
    import modules.script_callbacks as script_callbacks
    script_callbacks.on_app_started(test_api)
except:
    print("[openOutpaint-webui-extension] UNET API failed to initialize")
    
    