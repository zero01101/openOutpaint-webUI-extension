async function openoutpaint_get_image_from_history() {
	return new Promise(function (resolve, reject) {
		var buttons = gradioApp().querySelectorAll(
			'#tab_images_history [style="display: block;"].tabitem div[id$=_gallery] .gallery-item'
		);
		var button = gradioApp().querySelector(
			'#tab_images_history [style="display: block;"].tabitem div[id$=_gallery] .gallery-item.\\!ring-2'
		);

		if (!button) button = buttons[0];

		if (!button)
			reject(new Error("[openoutpaint] No image available in the gallery"));

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

function openoutpaint_send_history_gallery(
	name = "Image Browser Resource",
	tab
) {
	openoutpaint_get_image_from_history()
		.then((dataURL) => {
			// Send to openOutpaint
			openoutpaint.frame.contentWindow.postMessage({
				key: openoutpaint.key,
				type: "openoutpaint/add-resource",
				image: {
					dataURL,
					resourceName: name,
				},
			});

			// Send prompt to openOutpaint
			const tab = get_uiCurrentTabContent().id;
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

			// Change Tab
			Array.from(
				gradioApp().querySelectorAll("#tabs > div:first-child button")
			).forEach((button) => {
				if (button.textContent.trim() === "openOutpaint") {
					button.click();
				}
			});
		})
		.catch((error) => {
			console.warn("[openoutpaint] No image selected to send to openOutpaint");
		});
}

document.addEventListener("DOMContentLoaded", () => {
	let tries = 3;
	const onload = () => {
		const element = gradioApp().getElementById("tab_images_history");
		const tabsEl = gradioApp().getElementById("images_history_tab");
		if (element) {
			console.debug(`[oo-ext] Detected image history extension`);

			// Gets tab buttons
			const tabs = Array.from(tabsEl.firstChild.querySelectorAll("button")).map(
				(button) => button.textContent.trim()
			);

			tabs.forEach((tab) => {
				const buttonPanel = gradioApp().getElementById(
					`${tab}_images_history_button_panel`
				);

				if (!buttonPanel) return;

				const button = document.createElement("button");
				button.textContent = "Send to openOutpaint";
				button.classList.add(
					"gr-button",
					"gr-button-lg",
					"gr-button-secondary"
				);
				button.addEventListener("click", () => {
					openoutpaint_send_history_gallery(`Image Browser (${tab}) Resource`);
				});

				buttonPanel.appendChild(button);
			});
		} else if (tries-- > 0) {
			// Tries n times every 1 second before giving up
			setTimeout(onload, 1000);
		}
	};
	onload();
});
