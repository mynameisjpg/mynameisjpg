---
# UNTITLED.JPG DISPATCH METADATA
title: "Relate Anything [github repo]"
subtitle: "Real-time open-vocabulary relation prediction from any inputs"
excerpt: "Give RelateAnything an image, object regions, and the relations you want to look for. It returns scored (subject, relation, object) triplets, such as person → riding → horse."
date: "2026-09-30 05:43:20 -0300"
author: "Juan P. Giusepponi"
status: "published"
format: "resource"
topic:
  pillar: "AI Perception, Culture & Representation"
  subtopic: "Computer vision vs. human perception"
tags:
  - "toolkit"
  - "github"
  - "repo"
  - "relational"
  - "data-labeling"
  - "ai"
  - "models"
  - "annotation"
  - ""
theme: "dark"
featured: false
reading_time: "Code Toolkit"
image:
  path: "assets/images/relate_anything.jpg"
  alt: "High-contrast B&W art of a seated guitarist beside a speaker, overlaid with coral-red diagrammatic outlines, directional arrows, and blank label blocks."
category: "tool/software"
resource_url: "https://github.com/Maelic/RelateAnything"
sys_id: "SYS_202609_RES"

links:
  - title: "Relate Anything GitHub Repository"
    url: "https://github.com/Maelic/RelateAnything"
    type: "github | repo"
    description: "Live interactive sandbox and reference documentation."
  - title: "Official Documentation / Live Demo"
    url: "https://maelic.github.io/RelateAnythingProject/demo/"
    type: "tool | repo | live demo"
    description: "Live interactive sandbox and reference documentation."

backlinks:
  - slug: "#2026-09-28-perceptual-vision-eval-toolkit.md"
    title: "Perceptual Vision Eval Toolkit"
    note: "Visual Eval Toolkit"

shareable: true
allow_embed: true
---

## 01. Overview & Capability

Give **RelateAnything** an image, object regions, and the relations you want to look for. It returns scored
`(subject, relation, object)` triplets, such as `person → riding → horse`.

<img src="assets/images/relateanything.gif" alt="video with data labeling tags" width="100%"/>

### Try it with zero install:

1. Go to https://maelic.github.io/RelateAnythingProject/demo/
2. Upload a photo or video, or use your webcam >
3. It runs entirely in your browser, nothing gets sent to a server

---

## 02. Do you want to run it in python (locally) instead?

Use Python 3.12+. Install a CUDA-enabled PyTorch build for NVIDIA GPU inference, or use device="cpu" in the example below.

```text
git clone https://github.com/Maelic/RelateAnything.git
cd RelateAnything
pip install -e ".[hub]"
```

Run this from the repository root. The sample photo is included; the two example boxes identify the person and the horse.

```text
import numpy as np
from PIL import Image
from relsgg import RelateAnything

model = RelateAnything.from_pretrained("maelic/relsgg-vits16plus", device="cuda")
image = Image.open("assets/reel/images/horse.jpg").convert("RGB")
boxes = np.array([[470, 130, 650, 630], [90, 310, 1010, 875]], dtype=np.float32)

# Boxes are [x1, y1, x2, y2] in original-image pixels.
# Labels are optional and only make the printed triplets easier to read.
for triplet in model.predict(image, boxes, box_labels=["person", "horse"], topk=5):
    print(triplet)

# Change what relations to look for, without retraining.
model.set_vocabulary(["riding", "carrying a rider", "beside", "in front of"])
graphs = model.predict(image, boxes, box_labels=["person", "horse"], decompose=True)
print(graphs["spatial"])
print(graphs["semantic"])
```

Released checkpoints include the backbone configuration and text encoder; no gated DINOv3 login is needed for inference. Replace the sample image and boxes with your own inputs; the API also supports masks and a larger built-in relation vocabulary.

---

### 03. API Reference

[API guide: inputs, vocabularies, masks, and scores](https://github.com/Maelic/RelateAnything/blob/main/docs/quickstart.md) — [Installation and offline use](https://github.com/Maelic/RelateAnything/blob/main/docs/installation.md)

---

## 04. Research Paper

**Title:** RelateAnything: Real-Time Open-Vocabulary Relation Prediction From Any Inputs
Subjects: Computer Vision and Pattern Recognition (cs.CV)<br>
• [arXiv:2609.12552](assets/docs/2609.12552v1.pdf) [cs.CV]<br>
• https://doi.org/10.48550/arXiv.2609.12552
