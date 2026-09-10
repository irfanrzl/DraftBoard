// ---------- element refs ----------
const segPill = document.getElementById("seg-pill");
const segDashboard = document.getElementById("seg-dashboard");
const segWebsite = document.getElementById("seg-website");

const labelImage = document.getElementById("label-image");
const labelText = document.getElementById("label-text");
const dropBig = document.getElementById("drop-big");

const drop = document.getElementById("drop");
const imageInput = document.getElementById("image-input");

const diagramText = document.getElementById("diagram-text");
const examplesRow = document.getElementById("examples-row");
const exampleBlog = document.getElementById("example-blog");
const exampleShop = document.getElementById("example-shop");

const generateBtn = document.getElementById("generate-btn");
const toolError = document.getElementById("tool-error");

const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const downloadBtn = document.getElementById("download-btn");

const stageEmpty = document.getElementById("stage-empty");
const emptyTitle = document.getElementById("empty-title");
const frameWrap = document.getElementById("frame-wrap");
const preview = document.getElementById("preview");

// ---------- copy per mode ----------
const COPY = {
  dashboard: {
    labelImage: "An ERD, diagram, or description of your data",
    dropBig: "Drop an ERD or diagram",
    labelText: "Describe your data",
    placeholder: "e.g. Users (name, email, role), Posts (title, body, author)...",
    genIdle: "Generate dashboard",
    genBusy: "Drafting your dashboard…",
    dl: "↓ Download dashboard.html",
    emptyTitle: "Your dashboard appears here",
    ready: "Dashboard ready",
    filename: "dashboard.html",
  },
  website: {
    labelImage: "A wireframe, layout, or description of your site",
    dropBig: "Drop a wireframe or layout",
    labelText: "Describe your site",
    placeholder: "e.g. Landing page for a coffee subscription — hero, feature grid, pricing, footer...",
    genIdle: "Generate website",
    genBusy: "Drafting your website…",
    dl: "↓ Download website.html",
    emptyTitle: "Your website appears here",
    ready: "Website ready",
    filename: "website.html",
  },
};

const EXAMPLES = {
  blog: `Table User {
  id uuid [pk]
  email varchar
  status varchar
}
Table Post {
  id uuid [pk]
  title varchar
  user_id uuid [ref: > User.id]
}`,
  shop: `erDiagram
  USER ||--o{ ORDER : places
  ORDER {
    uuid id PK
    uuid user_id FK
    float total
  }`,
};

let mode = "dashboard"; // cosmetic only — labels/copy/filename; the engine still auto-classifies
let currentImage = null; // { base64, mime }
let currentHtml = null;
let currentObjectUrl = null;
let busy = false;

// ---------- mode toggle ----------
function setMode(next) {
  if (mode === next) return;
  mode = next;
  const c = COPY[mode];

  segPill.classList.toggle("right", mode === "website");
  segDashboard.classList.toggle("on", mode === "dashboard");
  segWebsite.classList.toggle("on", mode === "website");

  labelImage.textContent = c.labelImage;
  dropBig.textContent = c.dropBig;
  labelText.textContent = c.labelText;
  diagramText.placeholder = c.placeholder;
  downloadBtn.textContent = c.dl;
  examplesRow.hidden = mode !== "dashboard";

  if (!currentHtml) {
    emptyTitle.textContent = c.emptyTitle;
  }
  if (!busy) {
    generateBtn.textContent = c.genIdle;
  }
}

segDashboard.addEventListener("click", () => setMode("dashboard"));
segWebsite.addEventListener("click", () => setMode("website"));

// ---------- examples ----------
exampleBlog.addEventListener("click", () => {
  diagramText.value = EXAMPLES.blog;
  diagramText.focus();
});
exampleShop.addEventListener("click", () => {
  diagramText.value = EXAMPLES.shop;
  diagramText.focus();
});

// ---------- dropzone ----------
function renderDropImage(dataUrl) {
  drop.querySelectorAll(".drop-ico, .drop-big, .drop-sub, .drop-clear, img").forEach((el) => el.remove());
  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = "Uploaded screenshot";
  drop.appendChild(img);

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "drop-clear";
  clear.setAttribute("aria-label", "Remove image");
  clear.textContent = "\u00d7";
  clear.addEventListener("click", (e) => {
    e.stopPropagation();
    clearImage();
  });
  drop.appendChild(clear);
}

function renderDropEmpty() {
  drop.querySelectorAll("img, .drop-clear").forEach((el) => el.remove());
  if (!drop.querySelector(".drop-ico")) {
    const ico = document.createElement("div");
    ico.className = "drop-ico";
    ico.id = "drop-ico";
    ico.textContent = "◇";
    drop.appendChild(ico);

    const big = document.createElement("div");
    big.className = "drop-big";
    big.id = "drop-big";
    big.textContent = COPY[mode].dropBig;
    drop.appendChild(big);

    const sub1 = document.createElement("div");
    sub1.className = "drop-sub";
    sub1.textContent = "or click to browse · PNG, JPG · optional";
    drop.appendChild(sub1);

    const sub2 = document.createElement("div");
    sub2.className = "drop-sub";
    sub2.textContent = "reads with Gemini";
    drop.appendChild(sub2);

    drop.appendChild(imageInput);
  }
}

function setImage(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/data:(.*);base64/)?.[1] ?? file.type;
    currentImage = { base64, mime };
    renderDropImage(dataUrl);
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  currentImage = null;
  imageInput.value = "";
  renderDropEmpty();
}

drop.addEventListener("click", (e) => {
  if (e.target.closest(".drop-clear")) return;
  imageInput.click();
});
drop.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    imageInput.click();
  }
});
imageInput.addEventListener("change", () => setImage(imageInput.files?.[0]));

["dragenter", "dragover"].forEach((evt) =>
  drop.addEventListener(evt, (e) => {
    e.preventDefault();
    drop.classList.add("hover");
  })
);
["dragleave", "drop"].forEach((evt) =>
  drop.addEventListener(evt, (e) => {
    e.preventDefault();
    drop.classList.remove("hover");
  })
);
drop.addEventListener("drop", (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) setImage(file);
});

// ---------- generate ----------
function showError(message) {
  toolError.textContent = message;
  toolError.hidden = !message;
}

function setBusy(next) {
  busy = next;
  generateBtn.disabled = busy;
  generateBtn.innerHTML = busy
    ? `<span class="spin"></span>${COPY[mode].genBusy}`
    : COPY[mode].genIdle;
  statusDot.classList.toggle("live", busy);
  if (busy) statusText.textContent = "Generating…";
}

function renderResult(html) {
  currentHtml = html;
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  const blob = new Blob([html], { type: "text/html" });
  currentObjectUrl = URL.createObjectURL(blob);

  preview.src = currentObjectUrl;
  stageEmpty.hidden = true;
  frameWrap.hidden = false;
  frameWrap.classList.remove("show");
  // restart the reveal animation
  void frameWrap.offsetWidth;
  frameWrap.classList.add("show");

  downloadBtn.disabled = false;
  statusText.textContent = COPY[mode].ready;
}

async function generate() {
  showError("");
  const text = diagramText.value.trim();

  if (!text && !currentImage) {
    showError("Add some diagram text, a description, or an image first.");
    return;
  }

  setBusy(true);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        imageBase64: currentImage?.base64,
        imageMime: currentImage?.mime,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed.");
    renderResult(data.html);
  } catch (err) {
    showError(err.message || "Something went wrong.");
    statusText.textContent = "Ready when you are";
  } finally {
    setBusy(false);
  }
}

generateBtn.addEventListener("click", generate);

downloadBtn.addEventListener("click", () => {
  if (!currentHtml || !currentObjectUrl) return;
  const a = document.createElement("a");
  a.href = currentObjectUrl;
  a.download = COPY[mode].filename;
  a.click();
});
