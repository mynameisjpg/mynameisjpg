---
title: "Operational Images: Why Neural Networks Don't Actually Look at Pictures"
subtitle: "From Harun Farocki and Vilém Flusser to gradient saliency: how machine vision replaced the human gaze with automated instruction."
excerpt: "Human beings look at pictures to interpret meaning, memory, and emotion. Neural networks process operational images: visual inputs that exist purely to execute actions."

date: 2026-10-10 12:00:00 -0300
last_modified_at: 2026-10-10 12:00:00 -0300

author: "Juan P. Giusepponi"
status: "published"

format: "essay"

topic:
  pillar: "Philosophy of the Image & Visual Culture"
  subtopic: "Modes of seeing and visual semiotics"

tags:
  - "harun-farocki"
  - "vilem-flusser"
  - "operational-images"
  - "computer-vision"
  - "vision"
  - "attention"
  - "politics"
  - "human-vision"
  - "saliency-maps"
  - "visual-semiotics"
  - "surveillance"
  - "apparatus"

theme: "dark"
featured: true
toc: true
math: false

sys_id: "SYS_261010_OPIMG"
reading_time: "10 min read"

links:
  - title: "Eye/Machine (Harun Farocki, 2001–2003)"
    url: "https://www.harunfarocki.de/installations/2000s/2000/eye-machine.html"
    type: "archive"
    description: "Foundational three-part video installation conceptualizing operational images in military guidance systems and automated factory robotics."
  - title: "Towards a Philosophy of Photography (Vilém Flusser, 1983)"
    url: "https://en.wikipedia.org/wiki/Towards_a_Philosophy_of_Photography"
    type: "book"
    description: "Seminal media theory text dissecting technical images, the automated apparatus, and the human operator as functionary."

backlinks:
  - slug: "#2026-10-09-ai-images-groupe-mu"
    title: "Flawless Textures, Impossible Objects: Groupe µ and the Visual Semiotics of AI"
    note: "Analysis of plastic vs. iconic signs in synthetic generative models."
  - slug: "#2026-09-28-perceptual-vision-eval-toolkit"
    title: "Perceptual Vision Eval Toolkit: Psychophysical Metrics for Canvas/UI Analysis"
    note: "Automated framework measuring contrast and multi-stability in machine-parsed graphics."
  - slug: "#2026-09-28-haraway-cyborg-manifesto-neural-borderlands"
    title: "Donna Haraway’s Cyborg Manifesto: Neural Borderlands and Boundary Ruptures"
    note: "Post-human boundary breakdowns between organic vision and machinic feedback loops."

shareable: true
allow_embed: true

image:
  path: "assets/images/operational-images.jpg"
  alt: "An engraved human eye layered with digital circuit lines and pixel glitch effects in reddish-pink against a textured black background.."

gallery_images:
  - path: "assets/images/operational_web.png"
    alt: "Abstract glitch design"
---

## 01. The Image That Does Not Want to Be Seen

In 2001, German filmmaker and theorist Harun Farocki began exhibiting a video installation titled _Eye/Machine_. The piece opened with archival footage recorded during the 1991 Gulf War: grainy, flickering video captured by a camera mounted directly onto the nose cone of a precision-guided missile.

As the missile hurtles toward a bridge, crosshairs lock onto the concrete pier. The frame updates rapidly, recalculating trajectory, until the screen dissolves into sudden static. The missile has struck its target.

Farocki coined a term for this footage that remains the sharpest diagnostic tool we have for modern artificial intelligence: **the operational image** (_operative Bilder_).

> _"These are images that do not represent an object, but rather are part of an operation. They are images made neither to entertain nor to inform. They are images that do not even want to be seen."_ — Harun Farocki

For centuries, visual culture assumed a fundamental contract: a picture is created by a human being to be contemplated by another human being. It records a likeness, evokes an emotion, or tells a story.

Machine vision tears up that contract. A self-driving car processing camera feeds at sixty frames per second does not look at a pedestrian with curiosity, empathy, or dread. The image exists solely as a mathematical buffer to calculate brake pressure. `When sight becomes an operational step in an automated feedback loop, the nature of what an image is changes completely.`

---

## 02. Flusser’s Apparatus: The Image as Encoded Program

Two decades before Farocki analyzed military video, Czech-Brazilian philosopher <a href="https://en.wikipedia.org/wiki/Vil%C3%A9m_Flusser" target="_blank">Vilém Flusser</a> anticipated this transformation in _Towards a Philosophy of Photography_ (1983).

Flusser divided human history by how we externalize thought. First came traditional images (cave paintings, tapestries, frescos), which abstracted the four dimensions of space and time into two flat dimensions. Then came writing, which unspooled images into linear, historical lines of text.

Finally came the third epoch: **technical images**.

```mermaid
flowchart LR
    A[Traditional Images<br/>Magical & Mythic] --> B[Linear Text<br/>Historical & Conceptual]
    B --> C[Technical Images<br/>Automated Programs]
    C --> D[Operational Vectors<br/>Real-Time Actuation]
```

A technical image (a photograph, a video feed, a satellite radar map) appears to depict the world naturally. But Flusser argued it does nothing of the sort. It is an image created by an **apparatus**—a programmed black box. The apparatus translates scientific theories and mathematical models into visual surfaces.

Flusser observed that the person holding a modern camera is rarely an autonomous artist. They are a _functionary_. They press buttons, switch lenses, and explore the pre-programmed possibilities built into the device by its engineers.

In modern deep learning, the apparatus has swallowed the human functionary entirely. Convolutional neural networks (CNNs) and <a href="https://en.wikipedia.org/wiki/Vision_transformer" target="_blank">Vision Transformers (ViTs)</a> do not look at reality through a viewfinder. They digest light as float32 tensors. The pixels are not representations of trees, faces, or streets. They are activation values designed to traverse a multi-layer computational graph.

---

## 03. What Saliency Maps Actually Reveal

When engineers want to show what a vision model is paying attention to, they usually generate a **saliency map** using tools like <a href="https://en.wikipedia.org/wiki/Class_activation_mapping#Grad-CAM_and_CAM_comparison" target="_blank">Grad-CAM</a>.

These look like heatmaps layered over the original image. Bright red and yellow spots highlight which parts of the picture tipped the model's decision toward a label—such as "pedestrian," "stop sign," or "dog."

```text
MACHINE VISION PIPELINE:
[RAW LIGHT] ──> [SENSOR TENSOR] ──> [FEATURE FILTERS] ──> [HEATMAP] ──> [ACTION]
                                                                  │
                                                           (NO HUMAN GAZE)
```

It is tempting to look at these maps and assume the model is paying attention the way we do. But tracing the process reveals something much simpler.

The network is hunting for raw statistical correlations: high-contrast edges, patch textures, and color ratios that showed up often during training. You might look at a portrait and notice tired eyes. A vision model just picks up on dark oval shapes and edge gradients that happen to cross a numerical threshold.

The heatmap doesn't show comprehension. It simply highlights the pixels that triggered the circuit.

---

## 04. The Structural Shift: Human Gaze vs. Machine Actuation

Trading the interpretive gaze for operational processing shifts the entire ground of visual culture:

| Dimension                 | The Human Interpretive Gaze       | Machinic Operational Vision              |
| :------------------------ | :-------------------------------- | :--------------------------------------- |
| **Primary Goal**          | Meaning, contemplation, memory    | Classification, targeting, actuation     |
| **Underlying Substrate**  | Neural retina & cultural memory   | Multi-dimensional tensors & matrix math  |
| **Audience**              | Another human observer            | An automated software process            |
| **Failure Mode**          | Misinterpretation or projection   | False positive, adversarial perturbation |
| **Duration of the Image** | Archived, remembered, revisited   | Processed in memory and discarded        |
| **Relationship to Power** | Ideological persuasion & rhetoric | Direct physical enforcement              |

Artist and researcher Trevor Paglen noted that the overwhelming majority of images produced today are never seen by human eyes. They are generated by automated cameras, read by algorithms in data centers, and deleted in milliseconds without ever gracing a screen.

Human vision has become a minority practice on planet Earth. The primary consumers of images are no longer people; they are machines monitoring other machines.

---

## 05. The Automated Panopticon: Seeing as Actuating

In classical surveillance theories, such as Michel Foucault’s analysis of Jeremy Bentham’s Panopticon, vision functioned through psychological deterrence. A prisoner in a central tower did not need to be watched at every second; the _possibility_ of being seen forced them to internalize the guard's gaze.

Operational images abolish the need for psychological internalization because they bypass human consciousness altogether.

When an automated license plate reader flags a vehicle, when an Amazon fulfillment camera tracks a warehouse worker's hand speed, or when an autonomous drone locks onto a convoy, the camera does not deter. It executes.

```mermaid
flowchart TD
    subgraph Classical Vision
        A1[Event in World] --> B1[Camera Records Image]
        B1 --> C1[Human Guard Evaluates]
        C1 --> D1[Policy Decided]
    end
    subgraph Operational Vision
        A2[Event in World] --> B2[Sensor Captures Tensor]
        B2 --> C2[Weights Trigger Threshold]
        C2 --> D2[Direct Actuation / Lock / Strike]
    end
```

The camera ceases to be an eye. It becomes a trigger. There is no contemplative interval between seeing and acting, no space where doubt, compassion, or political negotiation can enter the frame.

---

## 06. Reclaiming Friction: Against Frictionless Sight

If operational images turn visual perception into frictionless mathematical command, where does that leave human aesthetic practice?

The answer is not a nostalgic retreat into analog film or painted canvases. It lies in introducing deliberate **perceptual friction** into machinic systems.

This friction takes many forms:

1. **Adversarial Perturbations:** Sub-perceptual pixel noise that leaves an image recognizable to a human while completely scrambling the classification vector of a neural network.
2. **Ambiguity and Multi-Stability:** Compositions that force visual systems to toggle between contradictory interpretations (like the visual illusions analyzed by Gestalt psychologists and Groupe µ), denying algorithms the clean confidence scores they require.
3. **Decoupling Sight from Function:** Creating images that refuse to optimize for utility, proving that sight can still be an open question rather than a closed instruction.

Vilém Flusser wrote that the only way to resist the automated apparatus is to play against it: to force the program to produce possibilities its creators never intended.

When we look at an AI-generated scene or an automated vision dashboard, we are not looking at art or reality. We are looking at an operational script. Remembering that distinction is the first step toward reclaiming our own eyes.
