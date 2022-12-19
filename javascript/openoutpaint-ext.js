// Txt2Img Send to Resource
const openoutpaint = {
	frame: null,
	key: null,
};

async function openoutpaint_get_image_from_gallery() {
	return new Promise(function (resolve, reject) {
		var buttons = gradioApp().querySelectorAll(
			'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item'
		);
		var button = gradioApp().querySelector(
			'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item.\\!ring-2'
		);

		if (!button) button = buttons[0];

		if (!button)
			reject(new Error("[openoutpaint] No image selected in the gallery"));

		const canvas = document.createElement("canvas");
		const image = document.createElement("img");
		image.onload = () => {
			canvas.width = image.width;
			canvas.height = image.height;

			canvas.getContext("2d").drawImage(image, 0, 0);

			resolve(canvas.toDataURL());
		};
		image.src = button.querySelector("img").src;
	});
}

function openoutpaint_send_gallery() {
	openoutpaint_get_image_from_gallery()
		.then((dataURL) => {
			// Send to openOutpaint
			openoutpaint.frame.contentWindow.postMessage({
				key: openoutpaint.key,
				type: "openoutpaint/add-resource",
				image: {
					dataURL,
					resourceName: "Embed Resource",
				},
			});
		})
		.catch((error) => {
			console.warn("[openoutpaint] No image selected to send to openOutpaint");
		});

	// Change Tab
	Array.from(
		gradioApp().querySelectorAll("#tabs > div:first-child button")
	).forEach((button) => {
		if (button.textContent.trim() === "openOutpaint") {
			button.click();
		}
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
		});
		initLoop = setTimeout(sendInit, 1000);
	};

	sendInit();
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
