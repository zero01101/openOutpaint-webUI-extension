In this repo lives a mighty handy little wrapper for adding [openOutpaint](https://github.com/zero01101/openOutpaint) to [AUTOMATIC1111 webUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) directly as a native extension.

Please see the respective READMEs and wikis for each of the above projects for a more comprehensive understanding of their feature sets.

This extension also adds buttons to send output from webUI txt2img and img2img tools directly to openOutpaint which will also include the prompts used for convenience.

**Note: Requires `--api` flag enabled in your webui-user launch script!**

**_FURTHER NOTE: the commandline flag `--gradio-debug` disables custom API routes and completely breaks openOutpaint. please remove it from your COMMANDLINE_ARGS before running openOutpaint._**

![image](https://user-images.githubusercontent.com/1649724/209033089-fb908d92-0c52-4165-a6a3-e6e9f28b032d.png)
