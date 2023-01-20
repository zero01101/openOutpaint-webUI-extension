// Txt2Img Send to Resource
const openoutpaint = {
	frame: null,
	key: null,
};

/**
 * Converts a Data URL string to a file object
 *
 * Based on https://stackoverflow.com/questions/28041840/convert-dataurl-to-file-using-javascript
 *
 * @param {string} dataurl Data URL to load into a file
 * @returns
 */
function openoutpaint_dataURLtoFile(dataurl) {
	var arr = dataurl.split(","),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], "openOutpaint-file", {type: mime});
}

async function openoutpaint_get_image_from_gallery() {
	var buttons = gradioApp().querySelectorAll(
		'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item'
	);
	var button = gradioApp().querySelector(
		'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item.\\!ring-2'
	);

	if (!button) button = buttons[0];

	if (!button)
		throw new Error("[openoutpaint] No image available in the gallery");

	const canvas = document.createElement("canvas");
	const image = document.createElement("img");
	image.src = button.querySelector("img").src;

	await image.decode();

	canvas.width = image.width;
	canvas.height = image.height;

	canvas.getContext("2d").drawImage(image, 0, 0);

	return canvas.toDataURL();
}

function openoutpaint_send_image(dataURL, name = "Embed Resource") {
	openoutpaint.frame.contentWindow.postMessage({
		key: openoutpaint.key,
		type: "openoutpaint/add-resource",
		image: {
			dataURL,
			resourceName: name,
		},
	});
}

function openoutpaint_gototab(tabname = "openOutpaint", tabsId = "tabs") {
	Array.from(
		gradioApp().querySelectorAll(`#${tabsId} > div:first-child button`)
	).forEach((button) => {
		if (button.textContent.trim() === tabname) {
			button.click();
		}
	});
}

function openoutpaint_send_gallery(name = "Embed Resource") {
	openoutpaint_get_image_from_gallery()
		.then((dataURL) => {
			// Send to openOutpaint
			openoutpaint_send_image(dataURL, name);

			// Send prompt to openOutpaint
			const tab = get_uiCurrentTabContent().id;

			if (["tab_txt2img", "tab_img2img"].includes(tab)) {
				const prompt =
					tab === "tab_txt2img"
						? gradioApp().querySelector("#txt2img_prompt textarea").value
						: gradioApp().querySelector("#img2img_prompt textarea").value;
				const negPrompt =
					tab === "tab_txt2img"
						? gradioApp().querySelector("#txt2img_neg_prompt textarea").value
						: gradioApp().querySelector("#img2img_neg_prompt textarea").value;
				openoutpaint.frame.contentWindow.postMessage({
					key: openoutpaint.key,
					type: "openoutpaint/set-prompt",
					prompt,
					negPrompt,
				});
			}

			// Change Tab
			openoutpaint_gototab();
		})
		.catch((error) => {
			console.warn("[openoutpaint] No image selected to send to openOutpaint");
		});
}

const openoutpaintjs = async () => {
	const frame = gradioApp().getElementById("openoutpaint-iframe");
	const key = gradioApp().getElementById("openoutpaint-key").value;

	openoutpaint.frame = frame;
	openoutpaint.key = key;

	// Listens for messages from the frame
	console.info("[openoutpaint] Add message listener");
	window.addEventListener("message", ({data, origin, source}) => {
		if (source === frame.contentWindow) {
			switch (data.type) {
				case "openoutpaint/ack":
					if (data.message.type === "openoutpaint/init") {
						console.info("[openoutpaint] Received Init Ack");
						clearTimeout(initLoop);
						initLoop = null;
					}
					break;
				case "openoutpaint/sendto":
					console.info(
						`[openoutpaint] Exported image to '${data.message.destination}'`
					);
					const container = new DataTransfer();
					const file = openoutpaint_dataURLtoFile(data.message.image);
					container.items.add(file);

					const setImageInput = (selector) => {
						const inputel = gradioApp().querySelector(selector);
						inputel.files = container.files;
						inputel.dispatchEvent(new Event("change"));
					};

					switch (data.message.destination) {
						case "img2img":
							openoutpaint_gototab("img2img");
							openoutpaint_gototab("img2img", "mode_img2img");
							setImageInput("#img2img_img2img_tab input[type=file]");
							break;
						case "img2img_sketch":
							openoutpaint_gototab("img2img");
							openoutpaint_gototab("Sketch", "mode_img2img");
							setImageInput("#img2img_img2img_sketch_tab input[type=file]");
							break;
						case "img2img_inpaint":
							openoutpaint_gototab("img2img");
							openoutpaint_gototab("Inpaint", "mode_img2img");
							setImageInput("#img2img_inpaint_tab input[type=file]");
							break;
						case "img2img_sketch_inpaint":
							openoutpaint_gototab("img2img");
							openoutpaint_gototab("Inpaint sketch", "mode_img2img");
							setImageInput("#img2img_inpaint_sketch_tab input[type=file]");
							break;
						case "extras":
							openoutpaint_gototab("Extras");
							setImageInput("#extras_single_tab input[type=file]");
							break;
						case "pnginfo":
							openoutpaint_gototab("PNG Info");
							setImageInput("#tab_pnginfo input[type=file]");
							break;
						default:
							console.warn(
								`[openoutpaint] Unknown destination ${data.message.destination}`
							);
					}
					break;
			}
		}
	});

	// Initializes communication channel
	let initLoop = null;
	const sendInit = () => {
		console.info("[openoutpaint] Sending init message");
		const pathname = window.location.pathname;
		const host = `${window.location.origin}${
			pathname.endsWith("/")
				? pathname.substring(0, pathname.length - 1)
				: pathname
		}`;
		frame.contentWindow.postMessage({
			type: "openoutpaint/init",
			key,
			host,
			destinations: [
				{
					name: "Image to Image",
					id: "img2img",
				},
				{
					name: "Sketch",
					id: "img2img_sketch",
				},
				{
					name: "Inpaint",
					id: "img2img_inpaint",
				},
				{
					name: "Sketch & Inpaint",
					id: "img2img_sketch_inpaint",
				},
				{
					name: "Extras",
					id: "extras",
				},
				{
					name: "PNG Info",
					id: "pnginfo",
				},
			],
		});
		initLoop = setTimeout(sendInit, 1000);
	};

	frame.addEventListener("load", () => {
		sendInit();
	});

	// Setup openOutpaint tab scaling
	const tabEl = gradioApp().getElementById("tab_openOutpaint");
	frame.style.left = "0px";

	const refreshBtn = document.createElement("button");
	refreshBtn.id = "openoutpaint-refresh";
	refreshBtn.textContent = "🔄";
	refreshBtn.title = "Refresh openOutpaint";
	refreshBtn.style.width = "fit-content";
	refreshBtn.classList.add("gr-button", "gr-button-lg", "gr-button-secondary");
	refreshBtn.addEventListener("click", () => {
		if (confirm("Are you sure you want to refresh openOutpaint?")) {
			frame.contentWindow.location.reload();
		}
	});
	tabEl.appendChild(refreshBtn);

	const recalculate = () => {
		// If we are on the openoutpaint tab, recalculate
		if (tabEl.style.display !== "none") {
			frame.style.height = window.innerHeight + "px";
			const current = document.body.scrollHeight;
			const bb = frame.getBoundingClientRect();
			const iframeh = bb.height;
			const innerh = window.innerHeight;
			frame.style.height = `${Math.floor(iframeh + (innerh - current)) - 1}px`;
			frame.style.width = `${Math.floor(window.innerWidth) - 1}px`;
			frame.style.left = `${Math.floor(
				parseInt(frame.style.left, 10) - bb.x
			)}px`;
		}
	};

	window.addEventListener("resize", () => {
		recalculate();
	});

	new MutationObserver((e) => {
		recalculate();
	}).observe(tabEl, {
		attributes: true,
	});

	// Add button to other tabs
	const createButton = () => {
		const button = document.createElement("button");
		button.classList.add("gr-button", "gr-button-lg", "gr-button-secondary");
		button.textContent = "Send to openOutpaint";
		return button;
	};

	const extrasBtn = createButton();
	extrasBtn.addEventListener("click", () =>
		openoutpaint_send_gallery("WebUI Extras Resource")
	);
	gradioApp().querySelector("#tab_extras button#extras_tab").after(extrasBtn);

	const pnginfoBtn = createButton();
	pnginfoBtn.addEventListener("click", () => {
		const image = gradioApp().querySelector("#pnginfo_image img");
		if (image && image.src) {
			openoutpaint_send_image(image.src, "WebUI PNGInfo Resource");
			openoutpaint_gototab();
		}
	});
	gradioApp().querySelector("#tab_pnginfo button#extras_tab").after(pnginfoBtn);

	// Initial calculations
	sendInit();
	recalculate();

	new MutationObserver((mutations) => {
		if (
			mutations.some(
				(mutation) =>
					mutation.attributeName === "style" &&
					mutation.target.style.display !== "none"
			)
		)
			frame.contentWindow.focus();
	}).observe(tabEl, {
		attributes: true,
	});

	if (tabEl.style.display !== "none") frame.contentWindow.focus();
};
document.addEventListener("DOMContentLoaded", () => {
	const onload = () => {
		if (gradioApp().getElementById("openoutpaint-iframe")) {
			openoutpaintjs();
		} else {
			setTimeout(onload, 10);
		}
	};
	onload();
});
