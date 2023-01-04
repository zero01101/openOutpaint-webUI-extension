// Txt2Img Send to Resource
const openoutpaint = {
	frame: null,
	key: null,
};

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

function openoutpaint_gototab() {
	Array.from(
		gradioApp().querySelectorAll("#tabs > div:first-child button")
	).forEach((button) => {
		if (button.textContent.trim() === "openOutpaint") {
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
						? txt2img_textarea.value
						: img2img_textarea.value;
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
	console.info("[embed] Add message listener");
	window.addEventListener("message", ({data, origin, source}) => {
		if (source === frame.contentWindow) {
			switch (data.type) {
				case "openoutpaint/ack":
					if (data.message.type === "openoutpaint/init") {
						console.info("[embed] Received init ack");
						clearTimeout(initLoop);
						initLoop = null;
					}
					break;
			}
		}
	});

	// Initializes communication channel
	let initLoop = null;
	const sendInit = () => {
		console.info("[embed] Sending init message");
		frame.contentWindow.postMessage({
			type: "openoutpaint/init",
			key,
			host: window.location.origin,
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
		frame.contentWindow.location.reload();
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
			frame.style.height = `${iframeh + (innerh - current)}px`;
			frame.style.width = `${window.innerWidth}px`;
			frame.style.left = `${parseInt(frame.style.left, 10) - bb.x}px`;
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
